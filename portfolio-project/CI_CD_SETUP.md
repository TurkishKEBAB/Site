# CI/CD Setup Guide

This document describes the current CI/CD, branch governance, and production secret/variable standard.

## CI Workflows

- `.github/workflows/ci.yml`
  - `Backend Quality`
  - `Frontend Quality`
  - `SonarCloud Quality Gate` (pushes to `main`/`develop` and trusted same-repository pull requests)
- `.github/workflows/codeql.yml`
  - `CodeQL (javascript-typescript)`
  - `CodeQL (python)`
- `.github/workflows/dependency-review.yml`
  - `Dependency Review` (high-severity dependency changes fail)
- `.github/workflows/workflow-security.yml`
  - `Workflow Security` (actionlint syntax/semantic checks + zizmor audit)
- `.github/workflows/scorecard.yml`
  - `OpenSSF Scorecard` (scheduled supply-chain assessment)

SonarCloud is intentionally consolidated into `ci.yml` so the scan consumes the
coverage artifacts produced by the same quality run. Trusted pushes and
same-repository pull requests fail when Sonar credentials are missing or the
quality gate is red. Fork and Dependabot pull requests cannot receive the
repository Sonar secret, so their Sonar job is skipped with an explicit summary
while secret-free checks continue to run.

Dependabot (`.github/dependabot.yml`) opens weekly updates for GitHub Actions,
frontend npm packages, and backend pip packages. All workflow action references
are pinned to full commit SHAs.

The backend CI gate currently enforces syntax and undefined-name safety with a
baseline-safe flake8 selection. Full black/isort/flake8 style enforcement is a
follow-up item because the existing backend contains pre-existing formatting and
style findings; enabling it immediately would turn the new quality workflow into
a permanently failing gate instead of a trustworthy signal.

Workflow Security runs for every pull request so a required check cannot be left
pending by workflow path filters. Its required PR run uses zizmor's local audits;
push and scheduled runs additionally publish a separate `Workflow Security Online
Audit` check with GitHub Advisory API coverage. This keeps transient API
availability from blocking ordinary pull requests while retaining broader
scheduled analysis. The same required job runs actionlint against every workflow
to catch invalid keys, expression type errors, unknown action inputs/outputs,
shell errors, and dependency mistakes before the online audit starts.

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

For protected Vercel Preview deployments, create a Vercel **Protection Bypass
for Automation** secret and store it as the GitHub `preview` Environment secret
`VERCEL_AUTOMATION_BYPASS_SECRET`. The `Preview Quality` workflow sends it only
as the `x-vercel-protection-bypass` request header to Playwright and Lighthouse;
it is never printed or passed to the application build. If Preview deployments
are public, the secret is still recommended so deployment protection can be
enabled later without silently disabling browser verification. Keep required
reviewers disabled for this non-production Environment unless you intentionally
want every preview verification to pause for approval.

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

- `NEXT_PUBLIC_API_BASE_URL=https://<backend-domain>/api/v1`

## Sentry Release and Alert Policy

The repository already initializes Sentry on the frontend and backend. Keep
release names tied to deployable commits so an alert can be mapped back to the
exact source revision:

- Browser instrumentation resolves `NEXT_PUBLIC_SENTRY_RELEASE`, then
  `NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA`.
- Next.js server and edge instrumentation resolves `SENTRY_RELEASE`, then
  `NEXT_PUBLIC_SENTRY_RELEASE`, `VERCEL_GIT_COMMIT_SHA`, and `GITHUB_SHA`.
- FastAPI resolves an explicit/configured `SENTRY_RELEASE`, then `GITHUB_SHA`,
  `RAILWAY_GIT_COMMIT_SHA`, `VERCEL_GIT_COMMIT_SHA`, and finally the application
  version.
- All three paths disable default PII collection. Backend reporting remains
  disabled when `SENTRY_DSN` is absent.

Create these Sentry alert rules for the production environment and review the
thresholds after the first two weeks of real traffic:

1. Error count above 5 events in 5 minutes.
2. A new issue whose level is `error` or `fatal`.
3. Release health below 95% healthy sessions.
4. p95 transaction latency above 1 second for 10 minutes.

`NEXT_PUBLIC_SENTRY_DSN` is intended for client initialization and is not an
authentication credential. `SENTRY_AUTH_TOKEN` is different: it can upload
source maps and must remain a GitHub/Vercel/Railway environment secret. The
Next.js build uploads source maps only when that token is present and removes
the uploaded maps from the build output afterward; builds without the token
continue without an upload attempt.

## Production Verification Scope

Workflow: `.github/workflows/deploy-production.yml` (`Production Verification`)

Vercel and Railway perform the actual production deployment through their
provider integrations. This workflow is a post-deploy quality and smoke
verification workflow; it is not a pre-deploy blocker for those external
integrations.

- Verification gates:
  - `Backend Quality (Production Verification)`
  - `Frontend Quality (Production Verification)`
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
  - trigger `Production Verification` manually (`workflow_dispatch`)
  - confirm frontend and backend smoke checks pass
  - record rotation date and owner in internal ops notes

## Validation Checklist

- Missing any required `production` secret/variable must fail deploy pipeline validation step.
- Invalid URL format (`http://` or trailing slash) for `PRODUCTION_*_URL` must fail smoke config validation.
- Invalid smoke admin credentials must fail the backend verification step.
- Missing Railway staging hooks fail `main`, `develop`, and manual dispatch runs; feature branches may skip with a summary.
- Custom Vercel preview deployment runs only on trusted branch pushes/manual dispatch. Pull-request source code is never given Vercel deployment secrets.

## CAPTCHA Functional Check (Manual / E2E)

- Run separately from deploy smoke.
- Expected behavior:
  - valid Turnstile token -> `POST /api/v1/contact/` returns `201`
  - missing/invalid token -> `POST /api/v1/contact/` returns `400`

## Manual GitHub Governance Settings

These are UI/ruleset settings and are not versioned in git.

### Security Automation Settings

After each check has completed its first successful run, add these names to the
`main` ruleset as required checks:

- `Backend Quality`
- `Frontend Quality`
- `SonarCloud Quality Gate`
- `CodeQL (javascript-typescript)`
- `CodeQL (python)`
- `Dependency Review`
- `Workflow Security`

Configure the `production` Environment under **Settings → Environments** with:

- `main` as the only deployment branch/tag pattern (or protected branches only)
- at least one required reviewer for production verification jobs
- `Prevent self-review` enabled
- environment-scoped smoke credentials and URLs only
- administrator bypass disabled unless an incident procedure explicitly requires it

The repository workflow already references `environment: production`; these
settings are GitHub UI/ruleset state and must be verified after repository
creation or transfer.

Keep `OpenSSF Scorecard` advisory until the repository has reviewed its first
baseline findings. CodeQL, Scorecard, and zizmor SARIF uploads require the
repository's Code Security/Advanced Security settings to permit code-scanning
results.

## Recommended Branch Strategy

- Permanent branches:
  - `main`: only long-lived development base; production-ready
- Short-lived branches: see [`../AGENTS.md`](../AGENTS.md) and [`../GIT_WORKFLOW.md`](../GIT_WORKFLOW.md) for the canonical naming rules (`feature/*`, `fix/*`, `refactor/*`, `chore/*`, `docs/*`, `test/*`, `ci/*`, `build/*`).
- PR flow:
  - feature branch -> `main` (squash merge)
- Merge strategy:
  - squash merge only
  - auto-delete head branches after merge
  - no direct pushes to `main`

> The `Codex_Implementation` integration branch has been retired. Do not
> recreate it; do not target it from feature branches. See
> [`../GIT_WORKFLOW.md`](../GIT_WORKFLOW.md) for the migration history.

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
  - `SonarCloud Quality Gate`
  - `CodeQL (javascript-typescript)`
  - `CodeQL (python)`
  - `Dependency Review`
  - `Workflow Security`

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

## DevOps Roadmap

The current workflows intentionally keep provider integrations and job
boundaries explicit. The next maturity stages are:

1. Extract reusable workflows after the current job inputs, artifacts, and
   check names have stabilized.
2. Add required GitHub Environment approvals for production when deployment
   ownership changes from automatic provider integrations.
3. Migrate provider authentication to OIDC and short-lived credentials after
   Railway and Vercel support is confirmed for this repository.
4. Publish SBOMs and artifact attestations after an artifact destination and
   retention policy are selected.
5. Add SLSA-style provenance enforcement once deployment consumes those
   attestations rather than only storing them.
