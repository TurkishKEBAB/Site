# Admin ↔ Site Harmony — Admin-Driven Roadmap

**Date:** 2026-07-13 · **Branch:** `feature/frontend-yosys-dossier`
**Decision:** make the public site **admin-driven** — the backend/admin becomes the source of truth; public pages read from the API instead of static `src/content/*`.

## Audit summary (why)

The public site renders 100% static content (`site.ts`, `projectDetails.ts`, `careerGraph.ts`, `telemetryDetail.ts`). The admin edits backend entities the site never reads — **only contact messages** are actually connected. Backend supports blog/projects/skills/experiences/technologies/translations/site/contact; admin exposes only Projects/Skills/Experiences/Messages; Blog/Technologies/Translations/Site-config have **no admin tab**; the project **dossier** and **career graph** have no backend model at all.

## Guiding rules

- One phase per PR/commit-set; each phase leaves the app green (type-check, lint, tests, build; backend pytest).
- Every backend model change ⇒ Alembic migration + `scripts/export_openapi.py` + `npm run gen:api`.
- Keep the NEXUS look; retire static content only once its API replacement renders identically.
- Delete dead `usePublicData` hooks as each becomes real (or wire them).

## Phases (ordered by value ÷ independence)

### Phase 1 — Blog (recommended first; cleanest, fully self-contained)
Backend blog CRUD already exists; nothing on the site or admin uses it.
- **Admin:** add a **Blog tab** — list (title/status/date), create/edit form (title, slug, excerpt, markdown body, cover image, tags, `is_published`), EN/TR translations, publish toggle, delete. Reuse `AdminForms` patterns.
- **Frontend public:** wire `Blog.tsx` (card grid) + `BlogDetail.tsx` (article) to the blog API (`blogService` + a `useBlogQuery`), replacing static/empty content. Increment views via existing endpoint.
- **Acceptance:** create a post in admin → appears on `/blog` → opens on `/blog/[slug]`.

### Phase 2 — Technologies + Projects (basic fields)
- **Admin:** add a **Technologies tab** (name/slug/icon CRUD) feeding the project multiselect.
- **Frontend public:** `Projects.tsx` index reads projects from the API (title/summary/description/impact/technologies/featured) instead of `projectRecords`. **Dossier stays static in Phase 2** (see Phase 4).
- Delete `projectRecords` once the API path matches.
- **Acceptance:** edit a project in admin → the index row/summary updates on `/projects`.

### Phase 3 — Skills → CapabilityMatrix + TechRadar
Backend skill is already `domain`/`ring` aligned.
- **Frontend public:** `CapabilityMatrix` groups backend skills by `domain`; `TechRadar` places them by `ring`. Replace static `capabilityGroups`/`techRadar` data.
- Wire the orphaned `useSkillsQuery`.
- **Acceptance:** add a skill in admin → shows in the right matrix group + radar ring on `/about`.

### Phase 4 — Project dossier (new backend models + admin editor)
The largest piece; the dossier has no backend model today.
- **Backend:** models for `metrics`, `c4_levels`, `adrs`, `log_entries`, `diagrams`, `gallery` under a project (JSON columns or child tables); migration; CRUD; schemas; OpenAPI.
- **Admin:** a dossier editor within the project edit flow (tabbed, matching the public dossier).
- **Frontend:** `projectDetails` reads from the API; retire the static file.
- **Acceptance:** author a dossier in admin → renders in the public dossier modal.

### Phase 5 — Career (reconcile Experiences ↔ careerGraph)
Admin "Experiences" and site "career graph" use different shapes.
- Decide the model: extend the backend to store the **git-graph** (lanes/nodes/links) OR derive the graph from experience rows.
- Wire About's `CareerViews` (map + log) to it; retire static `careerGraph`.
- **Acceptance:** edit career in admin → both graph and log views update.

### Phase 6 — Translations + Site config
- **Admin:** a Translations tab (key/EN/TR) over the existing translations API; a Site-config tab (social links, nav labels, availability status) over `site.py`.
- Wire `LanguageContext`/`siteConfig` fully to the API.

### Cross-cutting — Admin NEXUS restyle (carry-over)
Finish the earlier follow-up as each tab is touched: CRUD **form inputs + modal surfaces** to NEXUS, status pills → cyan dots.

## Telemetry note (not in scope for "dynamic")

Waka/GitHub are read-only external stats. Compact panels are already live; the deep-dive is static snapshot. Leave admin out of telemetry; optionally add live deep-dive later.

## Suggested execution order

**1 → 2 → 3** deliver visible admin↔site wiring fast on the simple entities. **4 → 5 → 6** are heavier (new models / reconciliation). Recommend shipping Phase 1 (Blog) first and reassessing.
