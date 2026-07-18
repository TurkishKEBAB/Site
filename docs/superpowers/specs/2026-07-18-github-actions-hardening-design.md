# GitHub Actions Hardening Design

**Date:** 2026-07-18  
**Status:** Approved for implementation

## Goal

Make the repository's GitHub Actions workflows trustworthy as engineering gates: a green check must mean that the intended validation actually ran, security-sensitive workflows must expose only the permissions and secrets they need, and operational workflows must fail clearly when required configuration is missing.

## Scope

This change covers every workflow currently under `.github/workflows/`, the supporting Dependabot configuration, and the CI/CD setup guide. It includes SonarCloud, build/test quality, deployment verification, staging/preview deployment behavior, backup/restore validation, release drafting, PR labeling, and stale-item maintenance.

It also adds repository-level static and supply-chain checks:

- Dependabot updates for npm, pip, and GitHub Actions.
- CodeQL analysis for Python and JavaScript/TypeScript.
- Dependency Review for pull requests.
- OpenSSF Scorecard for repository and workflow supply-chain visibility.
- Workflow static/security linting with actionlint/zizmor-compatible checks.

The application runtime, Railway deployment model, Vercel production integration, and production secret values are not redesigned in this change. OIDC credentials, reusable-workflow extraction, SBOM publication, and artifact attestation are documented as follow-up work rather than introduced without provider-side preparation.

## Design

### 1. One CI quality source and one Sonar analysis per run

`.github/workflows/ci.yml` remains the single source of truth for build and test quality. It runs on pushes to `main`/`develop` and on pull requests targeting those branches.

The backend quality job produces the existing XML coverage report and additionally runs deterministic formatting/lint checks. The frontend quality job keeps lint, server-component boundaries, API contract drift, coverage, npm audit, and build checks, and adds the existing TypeScript `type-check` script.

Both coverage reports are uploaded as short-lived artifacts. A single SonarCloud job depends on both quality jobs, downloads those exact artifacts, and scans `portfolio-project` with full git history. The scan waits for the SonarCloud quality gate and fails the job when the gate is red.

The duplicate `.github/workflows/sonar-pr-gate.yml` workflow is removed. Its independent test/coverage execution is the source of unnecessary work and makes it possible for the repository to show a successful workflow without a real Sonar analysis when configuration is skipped. Pull-request metadata is passed to the consolidated Sonar job only for pull-request events.

For pushes and same-repository pull requests, missing `SONAR_TOKEN` or `SONAR_ORGANIZATION`, invalid authentication, and scan failures are hard failures. Fork pull requests remain secret-safe: the Sonar job is skipped because GitHub does not expose repository secrets to that event, while the normal CI jobs still validate the untrusted code. The skip reason is written to the job summary so it cannot be mistaken for an executed analysis.

### 2. Fail-closed operational workflows with explicit exceptions

Operational workflows distinguish between an intentionally unavailable optional integration and a misconfigured required path:

- Production verification requires all production URLs and smoke credentials, and keeps frontend/backend smoke checks independent so one provider's failure does not hide the other.
- The production workflow is named and documented as verification because Vercel and Railway perform the actual deployment through their own integrations. The workflow verifies the result after the external deployment; it is not described as a pre-deploy blocker.
- Staging deploy hooks are required for `main`, `develop`, and manual dispatch. Feature-branch runs may skip when no hook is configured, but the skip is explicit in the summary.
- Custom Vercel preview deployment does not expose deployment secrets to code from a pull-request event. Pull-request validation runs without privileged secrets; privileged preview deployment is restricted to trusted branch pushes/manual runs or a separate trusted handoff mechanism. PR comments are performed only by a narrowly-permissioned job.
- Backup/restore drills receive a timeout, deterministic artifact retention, and explicit restore-count validation.

No workflow silently succeeds after a required secret, URL, token, or hook is absent. Every intentional skip has a machine-readable condition and a human-readable summary.

### 3. Least privilege and untrusted-code boundaries

All workflows retain or add explicit `permissions`. Permissions are scoped to the minimum job that needs them:

- Build/test jobs use read-only repository access.
- Sonar analysis uses read-only repository access and the Sonar token only in the scan step.
- Preview deploy jobs do not receive pull-request write permission; the comment job receives only pull-request write permission.
- Release Drafter receives contents write and pull-request read, but does not receive pull-request write unless its documented API behavior requires it.
- PR labeler and stale maintenance retain only the issue/PR write permissions needed for their API operations.
- CodeQL and Scorecard receive security-events write only where SARIF upload requires it; Scorecard additionally receives the minimum OIDC permission required by its provenance workflow.

Every action reference uses a full commit SHA with a version comment. Shell steps use strict mode where practical, quote URLs and variables, avoid interpolating secrets into scripts, and set job timeouts for external calls.

### 4. New repository security automation

The following checks are separate from product CI so each signal has a clear owner and failure meaning:

- `codeql.yml`: scheduled, push-to-main, and pull-request CodeQL analysis for Python and JavaScript/TypeScript.
- `dependency-review.yml`: pull-request-only review that blocks newly introduced high/critical dependency vulnerabilities according to the action's supported severity policy.
- `scorecard.yml`: scheduled and main-branch supply-chain assessment with SARIF upload and a retained result artifact.
- `workflow-security.yml`: actionlint syntax validation and zizmor security analysis over all workflow YAML files.
- `.github/dependabot.yml`: weekly grouped updates for frontend npm dependencies, backend pip dependencies, and GitHub Actions, with Conventional Commit prefixes and CI labels.

These checks are initially required only after their first successful repository run and branch-protection configuration. The workflow files and CI/CD guide will identify the exact required check names so GitHub rulesets cannot silently refer to obsolete names.

### 5. Documentation and operational contract

`portfolio-project/CI_CD_SETUP.md` is updated to describe:

- The consolidated CI/Sonar topology and actual triggers.
- The fork pull-request limitation and explicit Sonar skip behavior.
- The production verification model and staging/preview secret policy.
- New security automation and recommended required checks.
- Manual repository settings that cannot be represented in YAML.
- A staged DevOps roadmap for reusable workflows, OIDC, SBOM/provenance, artifact attestations, and deployment environments.

The guide must not claim that a workflow is fork-safe, required, or deployment-capable unless the YAML and GitHub event model actually provide that behavior.

## Failure and recovery behavior

When a quality, security, or operational check fails, the workflow exits non-zero and preserves the relevant report/artifact where possible. When a third-party service is unavailable, retries are bounded and the final failure identifies the service and endpoint. A missing secret is never retried as if it were a transient network error.

Fork PRs are the only intentional Sonar exception because secret exposure is not permitted. Their ordinary CI, CodeQL, dependency review, and workflow lint checks continue to run without repository secrets.

## Validation criteria

The implementation is complete only when all of the following are true:

1. Every workflow YAML parses successfully and all action references are full-length SHAs.
2. The duplicate Sonar workflow is gone, and `ci.yml` runs exactly one Sonar scan after both coverage-producing jobs.
3. Missing Sonar configuration fails eligible push/same-repository PR runs and produces an explicit summary for fork PR skips.
4. Backend and frontend quality jobs execute their documented tests and static checks, including frontend type-check and coverage artifact existence.
5. Deployment workflows distinguish required configuration from intentional branch/fork skips.
6. No workflow grants more repository or pull-request write permission than its job requires.
7. CodeQL, Dependency Review, Scorecard, workflow linting, and Dependabot configuration are present, pinned, and documented.
8. Local static validation and the repository's relevant test/quality commands are run; failures caused by pre-existing dependency or application issues are reported separately rather than hidden.

