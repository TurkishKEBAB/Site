# Admin Translation and Experience CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the admin project translation flow by eliminating the project-detail response validation error, and make experience translations editable through admin CRUD endpoints without overwriting the base record.

**Architecture:** Keep the existing project translation endpoint and response contract, fixing the detail serializer so it emits the complete `ProjectTranslation` response shape. Extend experience update CRUD with translation upsert support and add a dedicated translation endpoint. Make the admin form send the selected language to the translation table while preserving the English base fields. Content changes remain an admin CRUD responsibility rather than a seed or migration.

**Tech Stack:** FastAPI, SQLAlchemy, Pydantic v2, PostgreSQL, pytest, Next.js/TypeScript, Vitest.

## Global Constraints

- Work only on a feature/fix branch; never commit directly to `main`.
- Keep the project translation API contract backward-compatible.
- Preserve base English experience fields when an admin edits Turkish content.
- Enforce one translation per experience and language at the schema/database boundary.
- Do not change unrelated admin authentication or deployment configuration.

## Task 1: Reproduce and lock down the project translation failure

**Files:** `portfolio-project/backend/tests/test_projects_admin.py`

- [ ] Add a project-detail test with English and Turkish translations.
- [ ] Assert the detail endpoint returns 200 and each translation includes `project_id`, `created_at`, and `updated_at`.
- [ ] Run the focused test before the fix and confirm it fails with the current response validation behavior.

## Task 2: Fix project translation serialization

**Files:** `portfolio-project/backend/app/api/v1/projects.py`

- [ ] Include the complete response fields for each serialized project translation.
- [ ] Run the focused project tests and the backend suite.

## Task 3: Add experience translation CRUD controls

**Files:** `portfolio-project/backend/app/schemas/experience.py`, `portfolio-project/backend/app/crud/experience.py`, `portfolio-project/backend/app/api/v1/experiences.py`, `portfolio-project/backend/tests/test_experiences.py`

- [ ] Accept translation payloads in experience updates without treating them as base fields.
- [ ] Add an admin-only translation upsert endpoint.
- [ ] Reject duplicate languages in one payload and preserve the unique database constraint.
- [ ] Verify updating a translation does not overwrite the base English record.

## Task 4: Connect the admin experience CRUD to translations

**Files:** `portfolio-project/frontend/src/routes/Admin.tsx`, `portfolio-project/frontend/src/services/experienceService.ts`, `portfolio-project/frontend/src/services/types.ts`, `portfolio-project/frontend/src/lib/admin/experiencePayload.ts`

- [ ] Load the admin list with the explicitly selected language.
- [ ] Send create/update payloads through the experience translation-aware CRUD.
- [ ] Add frontend service and payload tests for endpoint selection and base-field preservation.

## Task 5: Verify, publish, and validate production

- [ ] Run backend tests and frontend lint, type-check, tests, and build as applicable.
- [ ] Regenerate checked-in API schema only if required by the API contract.
- [ ] Commit logical changes with Conventional Commits.
- [ ] Push the branch and update the PR targeting `main`.
- [ ] After merge/deploy, verify project detail endpoints return 200 and both language variants expose translations.
- [ ] Verify experience edits in English and Turkish persist through the admin API and do not require reseeding.
