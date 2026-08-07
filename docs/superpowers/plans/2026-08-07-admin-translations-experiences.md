# Admin Translation and Experience Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the admin project translation flow by eliminating the project-detail response validation error, and refresh the NETAŞ experience record so the public/admin data reflects the current GitGraph work.

**Architecture:** Keep the existing project translation endpoint and response contract, fixing the detail serializer so it emits the complete `ProjectTranslation` response shape. Store the canonical NETAŞ copy in `seed_data.py` for fresh databases and apply the same change to existing production rows through a revisioned Alembic data migration. Add endpoint/seed/migration regression coverage so future deploys cannot silently reintroduce either stale data or the 500 response.

**Tech Stack:** FastAPI, SQLAlchemy, Pydantic v2, Alembic, PostgreSQL, pytest, Next.js/TypeScript.

## Global Constraints

- Work only on a feature/fix branch; never commit directly to `main`.
- Keep the project translation API contract backward-compatible.
- Update both English and Turkish NETAŞ translations and the base experience fields used as the fallback.
- Make the production data change idempotent and target the NETAŞ record by stable identifying fields rather than a generated UUID.
- Do not change unrelated admin authentication or deployment configuration.

## Task 1: Reproduce and lock down the project translation failure

**Files:** `portfolio-project/backend/tests/test_projects_admin.py`

- [ ] Add a project-detail test with an English and Turkish translation.
- [ ] Assert the detail endpoint returns 200 and each translation includes `project_id`, `created_at`, and `updated_at`.
- [ ] Run the focused test before the fix and confirm it fails with the current response validation behavior.

## Task 2: Fix project translation serialization

**Files:** `portfolio-project/backend/app/api/v1/projects.py`

- [ ] Include the complete response fields for each serialized project translation.
- [ ] Run the focused project tests and the backend suite with the repository’s local Python test workaround if needed.

## Task 3: Define and test the refreshed NETAŞ experience data

**Files:** `portfolio-project/backend/seed_data.py`, `portfolio-project/backend/tests/test_seed_data.py`, `portfolio-project/backend/tests/test_experiences.py`

- [ ] Replace the stale NETAŞ English/Turkish title, organization, and description data with the current six-person KKTC e-Nüfus, timezone, test, stack, query optimization, i18n, and null-safety copy.
- [ ] Preserve the existing work-experience dates and type unless the requested copy requires otherwise.
- [ ] Add assertions for the canonical Turkish description and key English facts.

## Task 4: Apply the NETAŞ refresh to existing databases

**Files:** `portfolio-project/backend/alembic/versions/20260807_0008_refresh_netas_experience.py`, migration tests if present

- [ ] Add an idempotent data migration that updates the NETAŞ base row and its `en`/`tr` translations.
- [ ] Make the migration safe when a translation is missing by updating existing rows and inserting the expected language row only when the parent NETAŞ experience exists.
- [ ] Test the migration upgrade against representative stale data and verify a second execution does not duplicate translations.

## Task 5: Verify, publish, and validate production

- [ ] Run backend tests, frontend lint/type-check/tests/build as applicable.
- [ ] Regenerate any checked-in API schema only if the API contract changes.
- [ ] Commit the logical backend fix and data refresh with Conventional Commits.
- [ ] Push the branch and open a PR targeting `main`.
- [ ] After merge/deploy, verify project detail endpoints return 200 and both language variants expose translations; verify the NETAŞ experience in `en` and `tr`.

