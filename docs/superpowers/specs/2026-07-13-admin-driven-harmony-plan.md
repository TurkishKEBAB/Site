# Admin-Driven Site Harmony Design

**Date:** 2026-07-13
**Decision:** Make the backend and admin panel the source of truth for editable public content.
**First delivery slice:** Blog administration and public blog hardening.

## Current evidence

The original audit correctly identified the source-of-truth split, but its Blog status is stale relative to the current branch:

- `app/(public)/blog/page.tsx` already fetches posts through `src/lib/blog.ts`.
- `app/(public)/blog/[slug]/page.tsx` already fetches detail data and metadata from the API.
- `src/services/blogService.ts`, `useBlogPostsQuery`, and backend Blog CRUD already exist.
- `Admin.tsx` exposes Projects, Skills, Experiences, and Messages, but no Blog tab.
- Public detail lookup does not currently restrict a known draft slug to published posts.
- The public list endpoint can be asked for drafts without an admin-specific route.
- `tags` exist in the frontend compatibility type but not in the backend Blog model/schema.
- The translation write endpoint exists, but the admin has no protected detail response that includes translations.
- Blog server fetches use a five-minute revalidation window, so admin edits are not immediately visible.
- The detail GET endpoint mutates view counts, which can count metadata and page rendering separately.

## Goals

1. Allow an authenticated administrator to create, edit, publish, translate, and delete Blog posts.
2. Make drafts inaccessible through public list, search, and detail endpoints.
3. Keep EN/TR content editing explicit and preserve the existing English fallback behavior.
4. Make tags part of the backend contract and database schema.
5. Make a successful admin edit visible to the public Blog without waiting for an ISR window.
6. Preserve the existing NEXUS visual language and current public Blog layout.
7. Leave every delivered slice independently testable and releasable.

## Non-goals

- Project dossier persistence; it remains a separate Phase 4.
- Technologies administration; it remains Phase 2.
- Career graph persistence; it remains Phase 5.
- Translations and site configuration outside Blog posts; they remain Phase 6.
- WakaTime/GitHub telemetry administration; those remain read-only integrations.
- Rich HTML rendering. Blog content remains Markdown rendered by `react-markdown` without raw HTML support.

## Architecture

The existing public Blog server components remain the rendering boundary. They call the public API with the selected locale and use `cache: "no-store"` for editable Blog data. The admin panel continues its existing client-side imperative service pattern rather than introducing a second state-management model into `Admin.tsx`.

The backend keeps public and administrative concerns separate:

- Public routes return published posts only.
- `/api/v1/blog/admin` and `/api/v1/blog/admin/{post_id}` require `require_admin` and expose drafts plus translations.
- Slugs are supplied or generated at creation time and are immutable during update; changing a slug later would require redirect history, which is outside this slice.
- Existing `published` naming remains the canonical backend field. Frontend compatibility aliases (`is_published`, `views`, `view_count`) remain normalized at the service boundary.

## Backend contract

### Public endpoints

- `GET /api/v1/blog/`
  - Returns only published posts.
  - Supports `skip`, `limit`, `language`, and `published_only=true`.
  - Requests that attempt `published_only=false` without admin authorization are rejected.
- `GET /api/v1/blog/search`
  - Searches published posts only.
- `GET /api/v1/blog/{slug}?count_view=true|false`
  - Returns published detail only.
  - Defaults to `count_view=true` for compatibility.
  - Metadata fetches set `count_view=false`; page detail fetches set it once to avoid double counting.

### Administrative endpoints

- `GET /api/v1/blog/admin`
  - Requires admin authorization.
  - Returns published and draft posts with pagination.
- `GET /api/v1/blog/admin/{post_id}`
  - Requires admin authorization.
  - Returns the post and its translations.
- `POST /api/v1/blog/`
  - Requires admin authorization.
  - Accepts title, optional slug, content, excerpt, cover image, tags, reading time, published state, and optional initial translations.
- `PUT /api/v1/blog/{post_id}`
  - Requires admin authorization.
  - Updates editable fields except slug.
- `POST /api/v1/blog/{post_id}/translations`
  - Requires admin authorization.
  - Upserts one EN/TR translation and returns the translated admin detail shape.
- `DELETE /api/v1/blog/{post_id}`
  - Requires admin authorization.

### Data rules

- `tags` is a non-null JSON array of strings, defaulting to `[]`.
- Translation language is limited to `en` and `tr` in the first admin UI, while the backend keeps its existing supported-language validation for compatibility.
- Empty tags are removed and duplicate tags are de-duplicated in the frontend before submission.
- A published post has `published_at`; unpublishing clears it.
- Public detail and search never return unpublished rows, even when a slug or search term is known.

## Frontend behavior

The new Blog admin tab will provide:

- A table with title, slug, publication status, published/updated date, tags, and view count.
- Create and edit forms for title, create-only slug, excerpt, Markdown body, cover image URL, comma-separated tags, reading time, and publish state.
- An EN/TR translation editor opened from the row.
- Explicit delete confirmation and disabled action states while a request is pending.
- Existing toast/error handling and modal focus-trap behavior.
- NEXUS panel, border, label, status-dot, and button styling consistent with the existing admin shell.

The public Blog will retain its current card/detail UI, but server fetches will be uncached for this editable content. Existing degraded and not-found states remain visible when the API is unavailable.

## Phase roadmap

### Phase 1: Blog administration and hardening

Deliver the scope described above. Acceptance: an admin can create a draft, verify it is absent publicly, publish it, see it on `/blog`, open the slug detail, edit EN/TR content and tags, and delete it. Backend and frontend tests plus the full quality gate must pass.

### Phase 2: Technologies and project index

Add a protected Technologies tab over the existing technology CRUD. Make the project editor use the managed technology catalog. Replace `Projects.tsx` `projectRecords` reads with the projects API for title, summary, description, impact, technologies, featured state, and ordering. Keep dossier data static until Phase 4. Acceptance: an admin project edit changes the public project index.

### Phase 3: Skills, CapabilityMatrix, and TechRadar

Use the existing `domain` and `ring` fields as the public mapping contract. Transform API skills into the `CapabilityGroup` shape consumed by `CapabilityMatrix`; transform skill rings into the radar blips consumed by `TechRadar`; preserve locale labels and empty states. Acceptance: an admin-created skill appears in the matching matrix domain and radar ring.

### Phase 4: Project dossier

Create a project-owned dossier aggregate with typed child collections for metrics, C4 nodes/levels, ADRs, engineering log entries, diagrams, and gallery items. Use ordered child tables rather than one unvalidated JSON blob so each editor section can validate and reorder independently. Add migration, CRUD, schemas, OpenAPI generation, protected admin editing, and public read transformation into `DossierProject`. Acceptance: a dossier authored in admin renders in the existing modal with no static `projectDetails` dependency.

### Phase 5: Career graph from experiences

Use Experiences as the single source of truth and extend the model with graph presentation fields rather than storing duplicate lanes/nodes/links. Required fields are lane identifier, lane label/color, timeline position, node kind, and optional parent/link target. Transform the API response into the existing `CareerGraph` shape for `CareerMap` and `CareerLog`. Acceptance: one admin edit updates both views and `careerGraph.ts` is no longer imported by public code.

### Phase 6: Translations and site configuration

Add protected Translations and Site-config tabs over the existing APIs. Replace static UI dictionary/site configuration reads only after API fallback, locale behavior, metadata, and degraded states are tested. Acceptance: a site-config or translation edit is visible in the corresponding public shell without a code change.

## Cross-cutting rules

- Every backend schema/model change includes an Alembic migration, regenerated `backend/openapi.json`, and regenerated `frontend/src/services/apiTypes.generated.ts`.
- Every behavior change follows red-green-refactor: write a failing test, run it and observe the expected failure, implement the smallest change, then run the focused and regression suites.
- No existing user modifications are overwritten. The current `layout.tsx` and `next-env.d.ts` changes are outside this work.
- Each phase ends with backend pytest, frontend lint, type-check, test, and build evidence before it is marked complete.
- Each self-contained phase is committed with Conventional Commits and remains independently reviewable.
