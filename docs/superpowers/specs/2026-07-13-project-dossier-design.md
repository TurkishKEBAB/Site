# Project Dossier Persistence Design

Date: 2026-07-13  
Status: Approved for implementation  
Related roadmap: `docs/superpowers/plans/2026-07-13-admin-driven-harmony.md` (Phase 4)

## Goal

Move the project dossier shown by the NEXUS project modal from the checked-in
`frontend/src/content/projectDetails.ts` map into an admin-managed backend
aggregate. An administrator must be able to edit one project's overview,
metrics, C4 architecture, ADRs, engineering log, diagrams, and dossier gallery
in one save operation. Public visitors must receive the same typed content by
project slug without authentication.

The existing project editor and project image manager remain independent. A
dossier gallery item is editorial case-study content; a `ProjectImage` remains
an existing project asset and is not deleted or silently migrated by this
phase.

## Design decisions

### Aggregate shape

Use a normalized aggregate rooted at `ProjectDossier`, with one-to-one
ownership by `Project` and ordered child collections:

| Table | Ownership | Purpose |
| --- | --- | --- |
| `project_dossiers` | one row per project | `impact_en`, `impact_tr`, timestamps |
| `dossier_metrics` | dossier | displayed value, optional numeric value, label, note, order |
| `dossier_c4_levels` | dossier | C4 label, note, order |
| `dossier_c4_nodes` | C4 level | node kind, title, subtitle, leaf flag, tier/order |
| `dossier_adrs` | dossier | ADR id, title, status, date, context, decision, trade-off, order |
| `dossier_log_entries` | dossier | commit hash, tag, date, title, note, order |
| `dossier_diagrams` | dossier | diagram id, kind, title, note, validated variant data, order |
| `dossier_gallery_items` | dossier | safe source URL/path, caption, hint, order |

Every child foreign key uses `ON DELETE CASCADE`, and every SQLAlchemy parent
relationship uses `cascade="all, delete-orphan"`. Child lists are always
returned in `display_order`; C4 nodes additionally use `tier_order` before
`display_order`.

The aggregate is intentionally not stored as one unvalidated JSON document.
Diagram data is the one controlled exception: its shape differs by diagram
kind, so it is stored in a JSON column only after Pydantic discriminated-union
validation. The API never accepts an arbitrary aggregate JSON blob.

### Localized overview

The existing static project records contain localized impact copy while the
technical dossier content is EN-first. The dossier root therefore stores both
`impact_en` and `impact_tr`. The public response selects the requested impact
with EN fallback. The admin form edits both values. Existing project title,
summary, description, and technology localization continue to come from the
project API.

### API boundary

The router is mounted under `/api/v1/dossiers`:

- `GET /dossiers/{project_slug}?language=en|tr` — public dossier read. Returns
  `404` when the project or dossier does not exist.
- `GET /dossiers/projects/{project_id}` — admin dossier read, including both
  impact language values. Returns `404` when no dossier exists.
- `PUT /dossiers/projects/{project_id}` — admin whole-aggregate upsert. The
  request contains the complete root and child collections. Existing child
  rows are replaced only after the payload validates and the project is found.
- `DELETE /dossiers/projects/{project_id}` — admin dossier delete. Project
  deletion also removes its dossier through the foreign-key cascade.

The public route does not expose admin-only metadata or permit mutations. All
admin endpoints depend on `require_admin` and record an admin audit action.

### Validation

Pydantic request models validate the complete payload before any database
mutation:

- all labels, titles, ids, dates, hashes, and required text are non-empty and
  bounded by explicit maximum lengths;
- metric `numeric_value`, when supplied, is a non-negative decimal; its
  display `value` remains a string so values such as `86.97%`, `3rd`, and
  `200K` remain faithful to the design;
- C4 kinds are `person`, `system`, `client`, `container`, `component`, `store`,
  `queue`, or `external`; each level has at least one node and each node has a
  non-negative tier/order;
- diagram kinds are `c4`, `sequence`, `schema`, `tiers`, or `matrix`, with a
  discriminated typed data object for each kind;
- gallery sources must be an absolute `http`/`https` URL or a site-relative
  path beginning with `/`; schemes such as `javascript:` are rejected;
- all display/tier orders are non-negative and duplicate child identifiers are
  rejected within their collection;
- `impact_en` and `impact_tr` are required for a non-empty dossier, while the
  child collections may be empty so an admin can save an overview-only
  dossier.

The CRUD layer uses one SQLAlchemy transaction. It flushes the root, deletes
the previous child rows, inserts the validated replacement graph, commits,
then reloads the aggregate with ordered eager relationships. Any exception
rolls back the entire operation.

### Frontend data flow

The API service exposes typed dossier methods and the generated API contract is
regenerated after the backend schema is stable. The public project page keeps
the existing project list query. Selecting a project triggers a dossier query
by slug; while it is pending the modal can open with the project overview, and
the modal displays the full tabs once the dossier arrives. A missing or failed
dossier produces a compact overview/empty state with a retry action rather
than importing checked-in dossier data.

The renderer types currently declared in `projectDetails.ts` move to a neutral
frontend dossier module. `ProjectDossierModal`, `C4Diagram`, and
`DiagramGallery` consume those API-aligned types. The transformation from the
API response to `DossierProject` is pure and tested. Public code must not import
`projectDetails.ts` after the acceptance tests pass. The static file is retired
only then.

The admin project table gains a dossier action. Opening it loads the protected
aggregate or creates an empty typed editor state for a `404`. The editor is
split into overview, metrics, C4, ADR, engineering log, diagrams, and gallery
sections, but submits one validated payload through the dossier service. The
existing project image manager remains available as-is.

### Migration and initial data

Migration `20260713_0005_project_dossier.py` creates the root and child tables,
indexes project ownership/order fields, and adds no destructive changes to
existing project or image tables. The initial schema supports empty dossiers;
seed/backfill data is a separate idempotent operation so deploying the schema
does not make startup dependent on frontend source files. The migration and
seed path must be safe to run against the SQLite test database and PostgreSQL.

During the cutover, the public frontend has no static fallback. This makes an
empty dossier explicit and ensures that an admin-authored record is the only
source of truth. The existing static content remains available in git until
the API-backed acceptance test proves the modal path, then it is removed in a
separate cleanup change.

## Acceptance scenarios

1. An unauthenticated visitor can read a dossier by project slug and receives
   ordered metrics, C4 levels/nodes, ADRs, log entries, diagrams, gallery
   items, and the requested localized impact.
2. A visitor cannot use the admin read, upsert, or delete endpoints.
3. An admin can create an overview-only dossier, then add/reorder every child
   collection and save it in one request.
4. Invalid URLs, C4 kinds, negative numeric metrics, duplicate identifiers,
   and malformed diagram variants fail with `422` and leave the previous
   aggregate unchanged.
5. Updating a dossier replaces removed child rows without leaving orphans;
   deleting a project removes the dossier and all children.
6. The public project modal renders an API-authored dossier, and a missing
   dossier renders a compact degraded state without a `projectDetails.ts`
   import.
7. Existing project CRUD and project image-manager behavior remain green.

## Verification evidence required

- focused backend dossier tests, then the complete backend suite;
- focused frontend transformation/editor/modal tests, then Vitest;
- `npm run lint`, `npm run type-check`, `npm run check:api-types`, and
  `npm run build`;
- OpenAPI export diff is committed with generated frontend API types;
- Alembic offline compilation/history reaches `20260713_0005`;
- `git diff --check` and confirmation that the two pre-existing user changes
  in `app/layout.tsx` and `next-env.d.ts` were not staged or modified.
