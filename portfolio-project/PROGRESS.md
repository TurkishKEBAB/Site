# Portfolio Project Progress

Last Updated: 2026-02-24

This is the single source of truth for project status.

## Current Status

- Backend: 100% (API, auth, admin guards, test suite)
- Frontend: 80% (core pages, admin shell, performance/SEO/testing foundations)
- DevOps: 82% (CI + staging workflows + reliability/security hardening)
- Overall: 89%

## Sprint Overview

### Sprint 1 - Completed

- Week 1: Frontend stabilization completed (error handling, blog/detail rendering, admin modularization)
- Week 2: Backend test expansion completed (65 tests, coverage gate >=80)
- Week 3: Performance + SEO + frontend test setup completed
- Week 4: Final QA and release-readiness completed (root test reliability, startup hardening, docs normalization)

Sprint 1 exit criteria (all met):

- [x] Frontend lint/test/build passes
- [x] Backend tests pass with coverage gate
- [x] Root-level pytest command is stable
- [x] Projects and admin auth API paths validated in local environment
- [x] Operational scripts improved (`start.ps1`, `status.ps1`)
- [x] Documentation contradictions resolved with one canonical status file

## Validation Snapshot

- Frontend: `npm run lint`, `npm run test`, `npm run test:coverage`, `npm run build` passed
- Backend: `python -m pytest -q` passed (65 passed, coverage gate passed)
- Root: `python -m pytest -q` passed via root `pytest.ini`

## Notes on Sonar and Coverage

- Test coverage exists and is passing locally.
- Sonar showing 0% coverage means report import/config mismatch, not missing tests.
- Coverage export/import paths are being standardized as part of Sprint 1 closure.

## Sprint 2 - In Progress

### Week 1 - Completed

- [x] Repository-level GitHub Actions CI pipeline added (`.github/workflows/ci.yml`)
- [x] Backend quality job wired (pytest + coverage xml artifact)
- [x] Frontend quality job wired (lint + test + coverage lcov artifact + build)
- [x] SonarCloud scan job wired with conditional secret/org checks

### Week 2 - Completed

- [x] Staging deployment workflow (Vercel + Railway)
- [x] Environment secret/variable checklist for CI/CD and deploy
- [x] Branch protection + required checks documentation

### Week 3 - Completed

- [x] Sonar issue burn-down (security/reliability high priority)
  - [x] Removed hardcoded DB password from `backend/docker-compose.yml`
  - [x] Removed `0.0.0.0` hard-bind in `backend/app/main.py` runtime path
  - [x] Reduced hardcoded test credential pattern in `backend/tests/conftest.py`
  - [x] Added explicit safety predicates in rollback delete statements
- [x] Deprecation/reliability cleanups
  - [x] Replaced `datetime.utcnow()` usage with timezone-aware UTC datetime logic
  - [x] Replaced FastAPI `regex=` with `pattern=` in query/path validators
  - [x] Removed unnecessary async signatures or added true async behavior (`to_thread`)
  - [x] Addressed frontend reliability lint patterns (`Number.parseInt`, `Number.isNaN`, canvas particle refactor)
