# Public Performance Follow-ups Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reduce public first-content delay and backend latency without changing the current visual design or public API compatibility.

**Architecture:** Keep the public route shell server-rendered, fetch the Projects summary on the server with the existing backend cache, and hydrate the existing React Query client with initial data. Keep blog rendering independent from view counting, and move sync SQLAlchemy-only handlers to FastAPI’s threadpool execution model. Remove unnecessary public JavaScript only where the current provider boundaries permit it.

**Tech Stack:** Next.js App Router, React 19, TanStack Query, FastAPI, synchronous SQLAlchemy, Redis cache, Vitest, pytest.

## Global Constraints

- Preserve HeroIntro full-screen visuals and safe body-overflow cleanup.
- Do not modify `.github/copilot-instructions.md` or `.github/instructions/`.
- Do not expose blog view-count failures to readers.
- Keep existing detail/admin project response fields and endpoint paths compatible.
- Every production behavior change gets a failing regression test before implementation.

---

### Task 1: Make above-the-fold reveal animations hydration-safe

**Files:**
- Modify: `portfolio-project/frontend/src/components/AnimatedSection.tsx`
- Modify: `portfolio-project/frontend/src/routes/Home.tsx`
- Modify: `portfolio-project/frontend/src/components/Navigation.tsx`
- Test: `portfolio-project/frontend/src/components/AnimatedSection.test.tsx`

- [ ] Write a failing test proving the default section renders without a hidden initial style and an opted-in animated section retains the reveal behavior.
- [ ] Run the focused Vitest test and confirm the expected failure.
- [ ] Add an explicit `animateOnEnter` prop with a non-hidden default; opt in only below-fold sections and keep HeroIntro unchanged.
- [ ] Run the focused test and then the existing frontend component tests.
- [ ] Commit as `fix(frontend): keep public content visible before hydration`.

### Task 2: Server-render and hydrate the Projects list

**Files:**
- Modify: `portfolio-project/frontend/app/(public)/projects/page.tsx`
- Modify: `portfolio-project/frontend/src/routes/ProjectsClient.tsx`
- Modify: `portfolio-project/frontend/src/routes/Projects.tsx`
- Modify: `portfolio-project/frontend/src/hooks/usePublicData.ts`
- Test: `portfolio-project/frontend/src/routes/Projects.test.tsx`

- [ ] Add a failing test for rendering server-provided project data without the loading placeholder.
- [ ] Run the focused test and confirm it fails because the client ignores initial data.
- [ ] Add a server-safe public project fetch and pass the compact result through `ProjectsClient` into React Query `initialData`.
- [ ] Preserve refetch, error, locale changes, and dossier lazy loading.
- [ ] Run route tests and the public server-component boundary check.
- [ ] Commit as `perf(frontend): render project index from server data`.

### Task 3: Decouple blog view counting from content rendering

**Files:**
- Modify: `portfolio-project/frontend/src/lib/blog.ts`
- Modify: `portfolio-project/backend/app/api/v1/blog.py`
- Modify: `portfolio-project/backend/app/crud/blog.py`
- Test: `portfolio-project/frontend/src/lib/blog.test.ts`
- Test: `portfolio-project/backend/tests/test_blog.py`

- [ ] Add failing frontend and backend tests proving content reads do not require view counting and count failures do not fail a read.
- [ ] Run the focused tests and confirm the expected failure.
- [ ] Make the content read use `count_view=false`; add a separate atomic view-count operation that is best-effort and returns no reader-facing error.
- [ ] Ensure metadata/content reads do not duplicate avoidable backend work.
- [ ] Run focused frontend/backend tests.
- [ ] Commit as `perf(blog): remove view counting from render path`.

### Task 4: Compact public project lists and explicit caching

**Files:**
- Modify: `portfolio-project/backend/app/schemas/project.py`
- Modify: `portfolio-project/backend/app/api/v1/projects.py`
- Modify: `portfolio-project/backend/app/api/v1/blog.py`
- Modify: `portfolio-project/backend/app/api/v1/skills.py`
- Modify: `portfolio-project/frontend/next.config.mjs`
- Test: `portfolio-project/backend/tests/test_projects.py`

- [ ] Add failing tests for the compact list shape and public cache headers.
- [ ] Run the focused tests and confirm failure.
- [ ] Add a summary list schema/serializer, cache headers for public reads, and immutable caching for the versioned profile asset.
- [ ] Keep project detail/admin serialization unchanged.
- [ ] Run focused backend tests and inspect response headers.
- [ ] Commit as `perf(api): slim public payloads and cache reads`.

### Task 5: Keep synchronous SQLAlchemy off the async event loop

**Files:**
- Modify: `portfolio-project/backend/app/api/v1/admin.py`
- Modify: `portfolio-project/backend/app/api/v1/blog.py`
- Modify: `portfolio-project/backend/app/api/v1/dossiers.py`
- Modify: `portfolio-project/backend/app/api/v1/experiences.py`
- Modify: `portfolio-project/backend/app/api/v1/projects.py`
- Modify: `portfolio-project/backend/app/api/v1/skills.py`
- Modify: `portfolio-project/backend/app/api/v1/translations.py`
- Test: `portfolio-project/backend/tests/test_endpoint_execution_models.py`

- [ ] Add failing introspection tests for public sync-DB handlers that are still declared async.
- [ ] Run the focused tests and confirm failure.
- [ ] Convert only handlers whose work is synchronous SQLAlchemy/auth/audit work to `def`; keep handlers with awaited external/file/email work async.
- [ ] Run endpoint and regression tests.
- [ ] Commit as `perf(backend): keep sync database handlers off event loop`.

### Task 6: Avoid loading optional observability and unnecessary motion code

**Files:**
- Modify: `portfolio-project/frontend/instrumentation-client.ts`
- Modify: `portfolio-project/frontend/src/components/AnimatedSection.tsx`
- Modify: `portfolio-project/frontend/src/components/Navigation.tsx`
- Test: `portfolio-project/frontend/src/components/providers.test.tsx`

- [ ] Add a failing test for no client Sentry initialization when the DSN is absent.
- [ ] Run the focused test and confirm failure.
- [ ] Make client observability conditional while preserving router error hooks when configured; keep simple navigation/section transitions CSS-first.
- [ ] Run tests, lint, type-check, and bundle analysis.
- [ ] Commit as `perf(frontend): defer optional public runtime code`.

### Task 7: Fix remaining scroll-lock and lazy-image cleanup edges

**Files:**
- Modify: `portfolio-project/frontend/src/components/nexus/ProjectDossierModal.tsx`
- Modify: `portfolio-project/frontend/src/components/nexus/ProjectDossierModal.tsx`
- Test: `portfolio-project/frontend/src/components/nexus/ProjectDossierModal.test.tsx`

- [ ] Add a failing test proving an existing body overflow value is restored after closing the dossier.
- [ ] Run the focused test and confirm failure.
- [ ] Restore the exact prior overflow value and add lazy/async decoding to gallery images.
- [ ] Run the focused test.
- [ ] Commit as `fix(frontend): restore modal scroll state safely`.

### Task 8: Full verification and delivery

- [ ] Run frontend tests, lint, type-check, server-boundary check, build, and bundle analysis.
- [ ] Run targeted backend tests and the full repository quality script with the supported Python version.
- [ ] Review `git diff --check`, status, and all commits; confirm only intended files changed.
- [ ] Push the branch and open a PR targeting `main` with a conventional title.
