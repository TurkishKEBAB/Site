# CI/CD Setup Guide

This document explains the Sprint 2 CI and staging deployment baseline.

## CI Workflow

- File: `.github/workflows/ci.yml`
- Triggers: push and pull_request on `main`, `Codex_Implementation`, `develop`
- Jobs:
  - `backend-quality`: installs backend dependencies and runs `python -m pytest -q`
  - `frontend-quality`: runs `npm run lint`, `npm run test`, `npm run test:coverage`, `npm run build`
  - `sonarcloud`: runs only when Sonar credentials are configured

## Staging Deployment Workflows

- Frontend preview deploy: `.github/workflows/deploy-vercel-preview.yml`
  - Triggers: PR to `main`/`Codex_Implementation`/`develop`, push to `Codex_Implementation`/`develop`, manual dispatch
  - Deploy target: Vercel preview
- Backend staging deploy: `.github/workflows/deploy-railway-staging.yml`
  - Triggers: push to `Codex_Implementation`/`develop`, manual dispatch
  - Deploy target: Railway via deploy hook

## Coverage Artifacts

- Backend XML: `portfolio-project/backend/coverage.xml`
- Frontend LCOV: `portfolio-project/frontend/coverage/lcov.info`

These are uploaded as GitHub Actions artifacts and consumed by the SonarCloud job.

## Required GitHub Secrets and Variables

### Required for SonarCloud job

- Secret: `SONAR_TOKEN`
- Variable: `SONAR_ORGANIZATION`

If either is missing, the SonarCloud job is skipped while backend/frontend quality jobs still run.

### Required for Vercel preview workflow

- Secret: `VERCEL_TOKEN`
- Secret: `VERCEL_ORG_ID`
- Secret: `VERCEL_PROJECT_ID`

If any are missing, the Vercel preview job is skipped.

### Required for Railway staging workflow

- Secret: `RAILWAY_DEPLOY_HOOK_URL`

Optional:

- Variable: `STAGING_API_HEALTH_URL` (example: `https://api-staging.example.com/health`)

If deploy hook is missing, Railway job is skipped.

## Sonar Project Config

- File: `portfolio-project/sonar-project.properties`
- Key points:
  - Project key: `TurkishKEBAB_Site`
  - Python coverage import path: `backend/coverage.xml`
  - JS/TS coverage import path: `frontend/coverage/lcov.info`

## Recommended Branch Protection

For `main` branch, require these checks before merge:

- `Backend Quality`
- `Frontend Quality`
- `SonarCloud Scan` (once secrets/vars are configured)

For staging branches (`Codex_Implementation`, `develop`), recommended checks:

- `Vercel Preview Deploy`
- `Railway Staging Deploy`

## Suggested Environment Mapping

- `main`: production deploy gates only
- `develop`: staging deploy target branch
- `Codex_Implementation`: integration branch for iterative deployment verification
