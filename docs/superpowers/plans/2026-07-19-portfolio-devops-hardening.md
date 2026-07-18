# Portfolio DevOps Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the portfolio repository's existing CI/security foundation into a staged DevOps quality system that detects dependency risk, workflow drift, user-facing regressions, runtime failures, and release provenance.

**Architecture:** Keep GitHub Actions as the orchestration layer and preserve the existing least-privilege, commit-pinned workflow model. Apply fast deterministic checks to pull requests, run heavier browser/security checks after preview or staging deployments, and reserve SBOM/attestation work for release artifacts. Existing Vercel and Railway integrations remain the deployers; GitHub workflows verify their results.

**Tech Stack:** GitHub Actions, Dependabot, CodeQL, SonarCloud, zizmor, actionlint, pytest, npm, Playwright, Lighthouse CI, Sentry, OWASP ZAP, Trivy, GitHub artifact attestations.

## Global Constraints

- Never commit directly to `main`; use a scoped branch and open a PR targeting `main`.
- Preserve the user's uncommitted `portfolio-project/frontend/next-env.d.ts` change; never stage it.
- Keep third-party actions pinned to immutable commit SHAs with version comments.
- Keep pull-request jobs deterministic and avoid exposing secrets to untrusted fork code.
- Do not add Renovate alongside Dependabot, duplicate secret scanners, or make a second AI reviewer a security gate.
- Do not claim a check is complete until the local command and the resulting GitHub check or alert state have been verified.

---

### Task 1: Remediate open dependency and CodeQL alerts

**Files:**
- Modify: `portfolio-project/backend/requirements-dev.txt`
- Modify: `portfolio-project/frontend/package.json`
- Modify: `portfolio-project/frontend/package-lock.json`
- Modify: `portfolio-project/frontend/src/lib/metadata.test.ts`

**Interfaces:**
- Consumes: GitHub Dependabot alerts #1, #2, and #5 and CodeQL alert #1.
- Produces: patched development dependency constraints, a single patched PostCSS version throughout the npm tree, and a URL-host assertion that does not rely on substring sanitization.

- [x] **Step 1: Update the Python development dependency floors**

  Set `pytest` to `>=9.0.3,<10.0.0` and `black` to `>=26.3.1,<27.0.0`, retaining the existing compatible ranges for the other tools.

- [x] **Step 2: Force the patched PostCSS version in every npm dependency path**

  Add the root package override below while retaining the direct `postcss` development dependency:

  ```json
  "overrides": {
    "postcss": "8.5.16"
  }
  ```

  Regenerate the lockfile with `npm install --package-lock-only` from `portfolio-project/frontend` and verify that the nested Next.js PostCSS copy is no longer `8.4.31`.

- [x] **Step 3: Replace the CodeQL-sensitive URL substring assertion**

  Replace `url.startsWith("https://yigitokur.me")` with an explicit parsed URL check:

  ```ts
  expect(
    urls.every((url) => {
      const parsed = new URL(url);
      return parsed.protocol === "https:" && parsed.hostname === "yigitokur.me";
    }),
  ).toBe(true);
  ```

- [x] **Step 4: Verify dependency and frontend behavior**

  Run from `portfolio-project/frontend`:

  ```powershell
  npm ci
  npm ls postcss --all
  npm run test
  npm run lint
  npm run type-check
  npm audit --audit-level=high
  ```

  Expected: installation succeeds, every resolved PostCSS version is at least `8.5.10`, tests/lint/type-check pass, and npm reports no high or critical vulnerability.

- [x] **Step 5: Verify the backend dependency change**

  Run from the repository root:

  ```powershell
  python -m pytest -q
  ```

  Expected: the existing backend suite and coverage gate pass with pytest 9.x.

- [ ] **Step 6: Commit the self-contained alert remediation**

  ```powershell
  git add portfolio-project/backend/requirements-dev.txt portfolio-project/frontend/package.json portfolio-project/frontend/package-lock.json portfolio-project/frontend/src/lib/metadata.test.ts
  git commit -m "fix(security): remediate dependency and URL analysis alerts"
  ```

---

### Task 2: Add deterministic workflow linting and document production protection

**Files:**
- Modify: `.github/workflows/workflow-security.yml`
- Modify: `portfolio-project/CI_CD_SETUP.md`
- Create: `.github/workflows/post-deploy-verification.yml`

**Interfaces:**
- Consumes: existing commit-pinned workflow security job and `deployment_status` events from Vercel/Railway.
- Produces: actionlint validation, documented `production` Environment controls, and post-deployment verification entry points without duplicating deployments.

- [x] **Step 1: Add actionlint to the workflow security job**

  Install a pinned actionlint release using a pinned `actions/setup-go` step and run `actionlint -color` against `.github/workflows/*.yml`. Keep the existing zizmor jobs unchanged and preserve read-only permissions.

- [x] **Step 2: Add the production Environment checklist**

  Document these repository settings in `portfolio-project/CI_CD_SETUP.md`: required reviewer, prevent self-review, protected `main` deployment branch, and environment-scoped smoke secrets/variables.

- [x] **Step 3: Add deployment-status verification triggers**

  Build the verification workflow so it runs only for successful Vercel or Railway deployment statuses, validates the URL scheme before use, and executes safe public smoke checks. It must not receive pull-request secrets and must not deploy.

- [x] **Step 4: Verify workflow syntax and security**

  Run actionlint locally, then run the repository's existing workflow-security checks. Confirm all new action references are immutable SHAs and the workflow has no write permissions unless required by a specific upload step.

- [x] **Step 5: Commit workflow quality and deployment verification**

  ```powershell
  git add .github/workflows/post-deploy-verification.yml portfolio-project/CI_CD_SETUP.md docs/superpowers/plans/2026-07-19-portfolio-devops-hardening.md
  git commit -m "ci(github): add post-deploy verification"
  ```

---

### Task 3: Add browser and performance regression checks

**Files:**
- Create: `portfolio-project/frontend/playwright.config.ts`
- Create: `portfolio-project/frontend/e2e/public-pages.spec.ts`
- Modify: `portfolio-project/frontend/package.json`
- Modify: `portfolio-project/frontend/package-lock.json`
- Modify: `portfolio-project/frontend/.gitignore`
- Modify: `portfolio-project/frontend/vite.config.ts`
- Create: `.github/workflows/preview-quality.yml`
- Create: `portfolio-project/frontend/lighthouserc.cjs`

**Interfaces:**
- Consumes: successful preview deployment URL from Vercel and the public page contract.
- Produces: Playwright smoke tests and Lighthouse CI reports; both start advisory and become required only after stable baselines are established.

- [x] **Step 1: Add Playwright with deterministic CI settings**

  Configure Chromium only, one worker in CI, trace-on-first-retry, and a base URL supplied by `PLAYWRIGHT_BASE_URL`. Cover `/`, `/about`, `/projects`, `/blog`, `/contact`, `robots.txt`, and `sitemap.xml`.

- [x] **Step 2: Add preview verification workflow**

  Trigger from successful deployment status, install only Chromium, run Playwright, upload reports on failure, and keep permissions read-only.

- [x] **Step 3: Configure Lighthouse CI budgets**

  Run against the public pages and set initial assertions for performance, accessibility, best practices, and SEO. Store the report artifact and avoid blocking PRs until a baseline has been reviewed. Use the pinned `treosh/lighthouse-ci-action` rather than adding `@lhci/cli` to the frontend dependency tree: the latter introduced a high-severity transitive `tmp` audit finding in this repository.

- [x] **Step 4: Verify browser and performance checks**

  Run `npm run test:e2e` against a local production server and validate the Lighthouse configuration with Node. The pinned action runs the remote Lighthouse audit in GitHub Actions with the `preview` Environment bypass secret; no credential is needed for local tests.

- [ ] **Step 5: Commit the regression checks**

  ```powershell
  git add portfolio-project/frontend/playwright.config.ts portfolio-project/frontend/e2e/public-pages.spec.ts portfolio-project/frontend/package.json portfolio-project/frontend/package-lock.json portfolio-project/frontend/.gitignore .github/workflows/preview-quality.yml portfolio-project/frontend/lighthouserc.cjs docs/superpowers/plans/2026-07-19-portfolio-devops-hardening.md
  git commit -m "ci(frontend): add preview browser and performance checks"
  ```

---

### Task 4: Verify and document the existing Sentry release observability

**Files:**
- Modify: `portfolio-project/CI_CD_SETUP.md`

**Interfaces:**
- Consumes: the existing `withSentryConfig` setup, frontend instrumentation files, backend `init_observability`, and production environment variables.
- Produces: evidence that frontend/backend releases use deployment SHAs, source maps upload only in trusted builds, and the operator has concrete Sentry alert thresholds without exposing auth tokens.

- [ ] **Step 1: Verify the frontend release resolution chain**

  Confirm `instrumentation-client.ts`, `sentry.server.config.ts`, and `sentry.edge.config.ts` resolve `NEXT_PUBLIC_SENTRY_RELEASE`/`SENTRY_RELEASE`, then `VERCEL_GIT_COMMIT_SHA`/`GITHUB_SHA`. Confirm `next.config.mjs` sets `deleteSourcemapsAfterUpload: true` and disables upload when `SENTRY_AUTH_TOKEN` is absent.

- [ ] **Step 2: Verify the backend release resolution chain**

  Confirm `portfolio-project/backend/app/services/observability.py` resolves `SENTRY_RELEASE`, `GITHUB_SHA`, `RAILWAY_GIT_COMMIT_SHA`, `VERCEL_GIT_COMMIT_SHA`, then `settings.VERSION`, and initializes Sentry only when `SENTRY_DSN` exists.

- [ ] **Step 3: Document concrete Sentry alerts**

  Add these alert policies to `portfolio-project/CI_CD_SETUP.md`: production error count above 5 events in 5 minutes, a new issue with level error/fatal, release health regression below 95% healthy sessions, and p95 transaction latency above 1 second for 10 minutes. State that DSNs are safe for client use but `SENTRY_AUTH_TOKEN` must remain an environment secret.

- [ ] **Step 4: Verify a trusted production build**

  Run from `portfolio-project/frontend` with `SENTRY_AUTH_TOKEN` absent and confirm `npm run build` succeeds without attempting a source-map upload. In a protected CI/Vercel build with the token configured, confirm the Sentry release contains uploaded artifacts and the deployed response does not expose `.map` files.

- [ ] **Step 5: Commit the observability documentation**

  ```powershell
  git add portfolio-project/CI_CD_SETUP.md
  git commit -m "docs(observability): document Sentry release alerts"
  ```

---

### Task 5: Add scheduled active security and supply-chain checks

**Files:**
- Create: `.github/workflows/nightly-security.yml`
- Create: `trivy.yaml`
- Create: `.github/zap-baseline.conf`
- Modify: `portfolio-project/CI_CD_SETUP.md`

**Interfaces:**
- Consumes: stable staging URLs and the repository's dependency graph.
- Produces: non-blocking ZAP baseline reports, Trivy SARIF/filesystem findings, and a documented escalation path.

- [ ] **Step 1: Add nightly ZAP baseline against staging**

  Trigger at `02:13 UTC` and manually, read `vars.STAGING_FRONTEND_URL`, reject values that are not HTTPS, and run `zaproxy/action-baseline` with `fail_action: false`, `allow_issue_writing: false`, and a 30-day report artifact. Do not pass production credentials to the scan.

- [ ] **Step 2: Add Trivy filesystem and IaC scanning with SARIF artifacts**

  Run `aquasecurity/trivy-action` in `fs` mode against the repository with secret, vulnerability, misconfiguration, and license scanners; write `trivy-results.sarif`, upload it using `github/codeql-action/upload-sarif` with category `trivy-fs`, and keep the scheduled job advisory until the first baseline is reviewed. Pin both actions to immutable release SHAs.

- [ ] **Step 3: Add SBOM generation only when a release artifact exists**

  Generate SPDX or CycloneDX using Syft for the release artifact, upload the SBOM as an artifact, and use the GitHub dependency-submission format only on trusted `main`/release events with the minimum contents permission.

- [ ] **Step 4: Add artifact attestation to the release job**

  After the release artifact is created, grant only `id-token: write`, `attestations: write`, and `artifact-metadata: write`; run `actions/attest` against the exact artifact path, then verify it with `gh attestation verify` from a trusted environment. Do not attest routine test artifacts.

- [ ] **Step 5: Verify reports, permissions, and retention settings**

  Run actionlint and zizmor against the new workflow, confirm scheduled jobs do not receive production secrets, confirm SARIF categories are unique, and verify every artifact has an explicit retention period.

- [ ] **Step 6: Commit the scheduled security checks**

  ```powershell
  git add .github/workflows/nightly-security.yml trivy.yaml .github/zap-baseline.conf portfolio-project/CI_CD_SETUP.md
  git commit -m "ci(security): add scheduled web and dependency scans"
  ```

---

### Task 6: Complete, review, and publish the staged changes

**Files:**
- Modify: `docs/superpowers/plans/2026-07-19-portfolio-devops-hardening.md`

- [ ] **Step 1: Run the full proportionate local verification**

  Run `python -m pytest -q`, frontend lint/type-check/test/build, `npm audit --audit-level=high`, actionlint, and the workflow-security checks. Treat failures as unresolved work.

- [ ] **Step 2: Inspect the final diff and preserve unrelated user changes**

  Confirm `portfolio-project/frontend/next-env.d.ts` is still modified but unstaged and is absent from the diff.

- [ ] **Step 3: Push the branch and open a PR targeting `main`**

  Use a Conventional Commit PR title and include the security alert links, verification commands, and rollout/rollback notes.

- [ ] **Step 4: Verify GitHub checks and alert state**

  Confirm required checks, CodeQL, Dependency Review, workflow security, and deployment verification results from the actual PR run before claiming completion.
