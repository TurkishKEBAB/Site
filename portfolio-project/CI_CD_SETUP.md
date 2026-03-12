# CI/CD Setup Guide

This document describes the current CI/CD, branch governance, and production secret/variable standard.

## CI Workflows

- `.github/workflows/ci.yml`
  - `Backend Quality`
  - `Frontend Quality`
  - `SonarCloud Scan (Push)` (push-only, not required for PR merge)
- `.github/workflows/sonar-pr-gate.yml`
  - Required PR gate check: `Sonar PR Gate` (fork-safe `pull_request_target`)

## Production Secret/Variable Scope

All deploy/smoke keys must be stored under GitHub `production` environment.

Helper script (optional):

```powershell
cd portfolio-project
.\set-production-env-github.ps1
```

### Environment Secrets (`production`)

- `RAILWAY_PRODUCTION_MIGRATION_HOOK_URL`
- `RAILWAY_PRODUCTION_DEPLOY_HOOK_URL`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `PRODUCTION_SMOKE_ADMIN_EMAIL`
- `PRODUCTION_SMOKE_ADMIN_PASSWORD`

### Environment Variables (`production`)

- `PRODUCTION_API_ROOT_URL` (must start with `https://`, no trailing slash)
- `PRODUCTION_FRONTEND_URL` (must start with `https://`, no trailing slash)

Note: Sonar keys remain repo/org scoped:

- Secret: `SONAR_TOKEN`
- Variable: `SONAR_ORGANIZATION`

## Railway Production Runtime Contract

Set these values in Railway production service environment:

### Required

- `ENVIRONMENT=production`
- `DATABASE_URL`
- `SECRET_KEY` (min 32 chars)
- `FRONTEND_URL`
- `ADMIN_EMAILS`
- `SMTP_USERNAME`
- `SMTP_PASSWORD`
- `REDIS_URL`
- `CAPTCHA_ENABLED=true`
- `CAPTCHA_PROVIDER=turnstile`
- `CAPTCHA_SECRET_KEY`

### Recommended

- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `REFRESH_TOKEN_EXPIRE_DAYS`
- `AUTH_LOGIN_RATE_LIMIT`
- `CONTACT_RATE_LIMIT`
- `CORS_EXTRA_ORIGINS`
- `GITHUB_API_TOKEN`
- `SUPABASE_URL`
- `SUPABASE_KEY`

## Vercel Production Runtime Contract

Set in Vercel production environment:

- `VITE_API_BASE_URL=https://<backend-domain>/api/v1`

## Production Deploy & Smoke Scope

Workflow: `.github/workflows/deploy-production.yml`

- Deploy gates:
  - `Backend Quality (Prod Gate)`
  - `Frontend Quality (Prod Gate)`
- Smoke checks include:
  - `/live`
  - `/health`
  - `/ready`
  - `/api/v1/auth/login/json`
  - `/api/v1/admin/stats`
  - Frontend root URL
- `/api/v1/contact/` is intentionally excluded from deploy smoke because CAPTCHA is mandatory in production.

## Rotation Policy

- Rotate deploy/smoke secrets every 90 days at most.
- After each rotation:
  - trigger `Deploy Production` manually (`workflow_dispatch`)
  - confirm `Production Smoke Checks` passes
  - record rotation date and owner in internal ops notes

## Validation Checklist

- Missing any required `production` secret/variable must fail deploy pipeline validation step.
- Invalid URL format (`http://` or trailing slash) for `PRODUCTION_*_URL` must fail smoke config validation.
- Invalid smoke admin credentials must fail login step and make deploy red.

## CAPTCHA Functional Check (Manual / E2E)

- Run separately from deploy smoke.
- Expected behavior:
  - valid Turnstile token -> `POST /api/v1/contact/` returns `201`
  - missing/invalid token -> `POST /api/v1/contact/` returns `400`

## Manual GitHub Governance Settings

These are UI/ruleset settings and are not versioned in git.

## Recommended Branch Strategy

- Permanent branches:
  - `main`: production-ready branch only
  - `Codex_Implementation`: active integration/development branch
- Short-lived branches:
  - `feat/*`, `fix/*`, `chore/*`, `docs/*`, `refactor/*`
- PR flow:
  - feature branch -> `Codex_Implementation`
  - `Codex_Implementation` -> `main`
- Merge strategy:
  - squash merge only
  - auto-delete head branches after merge
  - no direct pushes to `main`
  - no direct pushes to `Codex_Implementation` except emergency maintainer fixes

### Main Branch Ruleset

- Require pull request before merge
- Require 2 approvals
- Require review from Code Owners
- Dismiss stale approvals
- Require conversation resolution
- Include administrators
- Require branch up to date
- Disable force push
- Disable branch deletion
- Required checks:
  - `Backend Quality`
  - `Frontend Quality`
  - `Sonar PR Gate`
  - `PR Governance`

### Codex_Implementation Branch Ruleset

- Require pull request before merge
- Require 1 approval
- Require review from Code Owners
- Dismiss stale approvals
- Require conversation resolution
- Include administrators
- Require branch up to date
- Disable force push
- Disable branch deletion
- Required checks:
  - `Backend Quality`
  - `Frontend Quality`
  - `PR Governance`
  - `PR Labeler`

### Repository Settings

- Enable auto-delete head branches
- Disable merge commits
- Disable rebase merges
- Enable squash merges
- Enable secret scanning and push protection if available
- Keep default branch as `main`

### Production Environment

- Required reviewers: none (automatic deploy)
- Deployment branches: only `main`
