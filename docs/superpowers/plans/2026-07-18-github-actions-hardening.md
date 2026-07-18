# GitHub Actions Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every repository workflow an explicit, least-privilege, fail-closed quality or operations gate, with one reliable SonarCloud analysis and added supply-chain security automation.

**Architecture:** Keep `ci.yml` as the only build/test/Sonar workflow and remove the duplicate PR Sonar workflow. Keep deployment, maintenance, and security signals as separate workflows with job-scoped permissions and explicit secret/fork behavior. Add Dependabot, CodeQL, Dependency Review, Scorecard, and zizmor without changing the Railway/Vercel production integration model.

**Tech Stack:** GitHub Actions, SonarQube Cloud Scan Action v8.2.1, Python 3.13/pytest/black/isort/flake8, Node 20/npm/Next.js, CodeQL Action v4.37.1, Dependency Review Action v5.0.0, OpenSSF Scorecard Action v2.4.3, zizmor Action v0.6.0, Dependabot.

## Global Constraints

- Preserve the user-owned modification in `portfolio-project/frontend/next-env.d.ts`; never stage or alter it.
- Pin every `uses:` reference to the full commit SHAs listed below, with a human-readable version comment.
- Keep workflow permissions explicit; do not use `pull_request_target` to execute pull-request source code.
- Missing required secrets/configuration must fail eligible trusted runs; fork PRs may skip only secret-dependent Sonar/preview deployment paths and must write a summary explaining why.
- Do not replace Railway/Vercel provider integrations, introduce OIDC, or add artifact attestation in this change.
- Use Conventional Commits in English and commit each self-contained work unit.

## Action Pin Baseline

Use these immutable references while editing existing and new workflows:

| Action | Immutable reference | Version |
| --- | --- | --- |
| `actions/checkout` | `9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0` | v7.0.0 |
| `actions/setup-python` | `ece7cb06caefa5fff74198d8649806c4678c61a1` | v6.3.0 |
| `actions/setup-node` | `820762786026740c76f36085b0efc47a31fe5020` | v7.0.0 |
| `actions/upload-artifact` | `043fb46d1a93c77aae656e7c1c64a875d1fc6a0a` | v7.0.1 |
| `actions/download-artifact` | `3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c` | v8.0.1 |
| `actions/github-script` | `d746ffe35508b1917358783b479e04febd2b8f71` | v9.0.0 |
| `actions/labeler` | `b8dd2d9be0f68b860e7dae5dae7d772984eacd6d` | v6.2.0 |
| `actions/stale` | `5bef64f19d7facfb25b37b414482c7164d639639` | v9.1.0 |
| `SonarSource/sonarqube-scan-action` | `22918119ff8e1ca75a623e15c8296b6ea4fbe28f` | v8.2.1 |
| `release-drafter/release-drafter` | `3832cfb52f98ab0f0e5b62aecf94909e334d4da6` | v7.5.1 |
| `github/codeql-action` | `bb16b9baa2ec4010b29f5c606d57d01190139edd` | v4.37.1 |
| `actions/dependency-review-action` | `a1d282b36b6f3519aa1f3fc636f609c47dddb294` | v5.0.0 |
| `ossf/scorecard-action` | `99c09fe975337306107572b4fdf4db224cf8e2f2` | v2.4.3 |
| `zizmorcore/zizmor-action` | `6599ee8b7a49aef6a770f63d261d214911a7ce02` | v0.6.0 |

---

### Task 1: Refresh existing action pins and add workflow timeouts

**Files:**
- Modify: `.github/workflows/backup-restore-drill.yml`
- Modify: `.github/workflows/ci.yml`
- Modify: `.github/workflows/deploy-production.yml`
- Modify: `.github/workflows/deploy-railway-staging.yml`
- Modify: `.github/workflows/deploy-vercel-preview.yml`
- Modify: `.github/workflows/pr-labeler.yml`
- Modify: `.github/workflows/release-drafter.yml`
- Modify: `.github/workflows/stale.yml`

**Interfaces:** Consumes existing workflow triggers and action inputs. Produces immutable action pins and bounded jobs.

- [x] **Step 1: Replace action references mechanically.** Use the immutable baseline above, preserve all inputs, and update version comments. Add `timeout-minutes: 30` to quality/security jobs, `20` to deployment verification jobs, `15` to maintenance jobs, and `10` to the backup drill unless a later task sets a stricter value.
- [x] **Step 2: Check for floating actions or mutable Docker references.** Run `rg -n "uses: .+@(v[0-9]|main|master|latest)|image: [^@\s]+:[^@\s]+$" .github/workflows`. Expected: no floating GitHub action references. Leave the PostgreSQL service tag unchanged until its intended digest is validated.
- [x] **Step 3: Validate whitespace.** Run `git diff --check`; expected exit code 0.
- [x] **Step 4: Commit.** Run `git add .github/workflows; git commit -m "ci(actions): refresh workflow action pins"`.

### Task 2: Consolidate CI and SonarCloud quality gating

**Files:**
- Modify: `.github/workflows/ci.yml`
- Delete: `.github/workflows/sonar-pr-gate.yml`

**Interfaces:** Consumes the `backend-quality` and `frontend-quality` coverage artifacts. Produces one SonarCloud quality-gate job per eligible run.

- [x] **Step 1: Add backend checks.** After dependency installation, run the baseline-safe `python -m flake8 app tests --select=E9,F63,F7,F82 --count --statistics` syntax/undefined-name check from `portfolio-project/backend`; keep migrations, OpenAPI drift, pytest coverage, and artifact upload. Full black/isort/flake8 style enforcement remains a documented follow-up because the current baseline has pre-existing style findings. Set `retention-days: 7` on the backend artifact.
- [x] **Step 2: Add frontend type-check.** After API type drift validation, run `npm run type-check` from `portfolio-project/frontend`; set `retention-days: 7` on the frontend coverage artifact.
- [x] **Step 3: Make Sonar one event-aware job.** Keep `needs: [backend-quality, frontend-quality]`, name it `SonarCloud Quality Gate`, and run it only for pushes or same-repository PRs:

```yaml
    if: >-
      ${{ github.event_name == 'push' ||
          (github.event_name == 'pull_request' &&
           github.event.pull_request.head.repo.full_name == github.repository) }}
    permissions:
      contents: read
```

The first step must fail for missing/invalid `SONAR_TOKEN` or `SONAR_ORGANIZATION`:

```yaml
      - name: Validate SonarCloud configuration
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_ORGANIZATION: ${{ vars.SONAR_ORGANIZATION }}
        run: |
          set -euo pipefail
          if [ -z "$SONAR_TOKEN" ] || [ -z "$SONAR_ORGANIZATION" ]; then
            echo "SONAR_TOKEN and SONAR_ORGANIZATION are required for this trusted run." >&2
            exit 1
          fi
          response="$(curl --fail-with-body --silent --show-error --user "${SONAR_TOKEN}:" https://sonarcloud.io/api/authentication/validate)"
          printf '%s' "$response" | grep -q '"valid":true'
```

Checkout with `fetch-depth: 0`, download both artifacts into their configured paths, and scan with `sonar.qualitygate.wait=true` plus `sonar.qualitygate.timeout=600` using `SonarSource/sonarqube-scan-action@22918119ff8e1ca75a623e15c8296b6ea4fbe28f # v8.2.1`. Add PR key/branch/base arguments only for PR events. Keep the fork exception secret-free and write a clear summary explaining that Sonar cannot run without secrets.
- [x] **Step 4: Delete the duplicate workflow.** Remove `sonar-pr-gate.yml` after confirming its useful checkout, coverage, PR metadata, and quality-wait behavior exists in `ci.yml`.
- [x] **Step 5: Check obsolete references.** Run `rg -n "sonar-pr-gate|Sonar PR Gate|SonarCloud Scan \(Push\)|enabled=false|Skipping Sonar" .github portfolio-project/CI_CD_SETUP.md`; expected: no stale names or silent-skip logic.
- [x] **Step 6: Commit.** Run `git add .github/workflows/ci.yml .github/workflows/sonar-pr-gate.yml; git commit -m "ci(sonar): consolidate quality gate into CI"`.

### Task 3: Add dependency and code-scanning workflows

**Files:**
- Create: `.github/dependabot.yml`
- Create: `.github/workflows/codeql.yml`
- Create: `.github/workflows/dependency-review.yml`
- Create: `.github/workflows/scorecard.yml`
- Create: `.github/workflows/workflow-security.yml`

**Interfaces:** Consumes repository source, lockfiles, workflow YAML, and the GitHub security-events API. Produces named checks `CodeQL`, `Dependency Review`, `OpenSSF Scorecard`, and `Workflow Security`.

- [x] **Step 1: Create Dependabot configuration.** Add weekly Monday updates for `github-actions` at `/`, npm at `/portfolio-project/frontend`, and pip at `/portfolio-project/backend`, with `chore(deps)` prefixes, relevant labels, groups for frontend runtime/tooling, and a 10-PR limit.
- [x] **Step 2: Create CodeQL.** Trigger on push/PR to `main`, weekly schedule, and dispatch. Use top-level `permissions: {}`, job permissions `actions: read`, `contents: read`, `security-events: write`, and a non-failing matrix for `javascript-typescript` and `python`. Use pinned `github/codeql-action/init` and `analyze` v4.37.1 with `build-mode: none`.
- [x] **Step 3: Create Dependency Review.** Trigger on PRs targeting `main`, use `contents: read`, checkout with the pinned SHA, and `actions/dependency-review-action@a1d282b36b6f3519aa1f3fc636f609c47dddb294 # v5.0.0` with `fail-on-severity: high`. PR comments are intentionally disabled (`comment-summary-in-pr: never`) so the required gate does not need `pull-requests: write`.
- [x] **Step 4: Create Scorecard.** Trigger on push to `main`, weekly schedule, and dispatch. Use `actions: read`, `contents: read`, `id-token: write`, and `security-events: write`; run `ossf/scorecard-action@99c09fe975337306107572b4fdf4db224cf8e2f2 # v2.4.3` with SARIF output and publication, upload SARIF with the pinned CodeQL action, and retain the result artifact 30 days.
- [x] **Step 5: Create workflow security analysis.** The required PR job runs local/offline zizmor audits with `advanced-security: false`; push/schedule/dispatch runs additionally use a separate online SARIF-upload job. Both use `persona: auditor`, `min-severity: medium`, and `version: v1.21.0` with pinned action references.
- [x] **Step 6: Validate and commit.** Run `rg -n "uses: .+@" .github/workflows; git diff --check`; verify every `uses:` reference has a 40-character SHA, then commit with `git add .github/dependabot.yml .github/workflows/codeql.yml .github/workflows/dependency-review.yml .github/workflows/scorecard.yml .github/workflows/workflow-security.yml; git commit -m "ci(security): add supply chain analysis workflows"`.

### Task 4: Harden deployment, backup, and maintenance workflows

**Files:**
- Modify: `.github/workflows/deploy-production.yml`
- Modify: `.github/workflows/deploy-railway-staging.yml`
- Modify: `.github/workflows/deploy-vercel-preview.yml`
- Modify: `.github/workflows/backup-restore-drill.yml`
- Modify: `.github/workflows/pr-labeler.yml`
- Modify: `.github/workflows/release-drafter.yml`
- Modify: `.github/workflows/stale.yml`

**Interfaces:** Consumes existing provider secrets/variables and external integrations. Produces explicit verification names, branch-aware configuration failures, least-privilege maintenance jobs, and bounded external calls.

- [x] **Step 1: Rename production semantics.** Change display name to `Production Verification`; rename quality jobs accordingly; remove the unnecessary `CI_SECRET_KEY` secret fallback and use the existing non-production `ci-secret-key`; keep smoke jobs behind `environment: production`, add job-level `permissions: {}`, and use bounded curl retries only for transient GET/readiness calls.
- [x] **Step 2: Fail closed for staging.** Keep feature-branch skips, but fail when the event is manual dispatch or the ref is `main`/`develop` and the Railway hook is missing. Make optional health-check skips visible in `$GITHUB_STEP_SUMMARY`.
- [x] **Step 3: Remove PR deployment secrets.** Remove the `pull_request` trigger and PR comment from custom Vercel preview deployment; retain trusted branch push/manual deployment only, `contents: read`, and document that provider integration owns PR previews.
- [x] **Step 4: Bound operational workflows.** Set the backup timeout to 10 minutes, artifact retention to 30 days, and validate restored `users` row count; set maintenance job timeouts to 15 minutes. Release Drafter uses `pull-requests: write` because its configured autolabeler requires it, and the job is restricted to trusted same-repository PRs.
- [x] **Step 5: Review policy output.** Run `rg -n "pull_request_target|pull-requests: write|contents: write|Skipping|not configured|timeout-minutes|environment:" .github/workflows` and inspect each write permission and skip against the approved policy.
- [x] **Step 6: Commit.** Run `git add .github/workflows/deploy-production.yml .github/workflows/deploy-railway-staging.yml .github/workflows/deploy-vercel-preview.yml .github/workflows/backup-restore-drill.yml .github/workflows/pr-labeler.yml .github/workflows/release-drafter.yml .github/workflows/stale.yml; git commit -m "ci(workflows): harden deployment and maintenance gates"`.

### Task 5: Update CI/CD documentation and required-check contract

**Files:**
- Modify: `portfolio-project/CI_CD_SETUP.md`

**Interfaces:** Consumes final workflow names/triggers/permissions. Produces one accurate operational guide and a staged DevOps roadmap.

- [x] **Step 1: Replace stale descriptions.** Document `CI` as the source of truth, `SonarCloud Quality Gate` as the consolidated job, and `Production Verification` as post-deploy verification. Remove the obsolete `Sonar PR Gate (fork-safe pull_request_target)` and custom PR secret-deployment claims.
- [x] **Step 2: Document security automation.** Add Dependabot ecosystems, CodeQL languages, Dependency Review threshold, Scorecard SARIF behavior, zizmor Advanced Security requirements, and the intentional fork limitation. Recommend required checks only after each has a successful first run: `Backend Quality`, `Frontend Quality`, `SonarCloud Quality Gate`, both CodeQL matrix checks, `Dependency Review`, and `Workflow Security`.
- [x] **Step 3: Add the DevOps roadmap.** Record reusable-workflow extraction after interfaces stabilize; GitHub Environment approvals; OIDC after provider support is confirmed; SBOM/attestation after an artifact destination is selected; and SLSA/provenance consumption after deployment integration is ready.
- [x] **Step 4: Validate and commit.** Run `rg -n "Sonar PR Gate|pull_request_target|SonarCloud Scan \(Push\)|Deploy Production|Production Verification|Workflow Security|Dependency Review|CodeQL|Scorecard|Dependabot" portfolio-project/CI_CD_SETUP.md; git diff --check`; commit with `git add portfolio-project/CI_CD_SETUP.md; git commit -m "docs(ci): document workflow security gates"`.

### Task 6: Full local verification and completion audit

**Files:** Verify all `.github/workflows/*.yml`, `.github/dependabot.yml`, the design spec, the plan, and `portfolio-project/CI_CD_SETUP.md`.

- [x] **Step 1: Parse YAML.** Run `python -c "import yaml, pathlib; files=list(pathlib.Path('.github').rglob('*.yml')); [yaml.safe_load(p.read_text(encoding='utf-8')) for p in files]; print(f'parsed {len(files)} YAML files')"`; expected: all files parse. If PyYAML is unavailable, run the equivalent in the workflow-security environment without modifying project dependencies.
- [x] **Step 2: Verify pins, permissions, and diff hygiene.** Run `rg -n "uses:|permissions:|pull_request_target|secrets\\." .github/workflows; git diff --check; git status --short --branch`; verify full SHAs, justified write permissions, and that the unrelated `next-env.d.ts` change remains unstaged.
- [x] **Step 3: Run backend checks.** From `portfolio-project`, run `python -m pytest -q` and `python -m flake8 backend/app backend/tests --select=E9,F63,F7,F82 --count --statistics`; record the local Passlib/bcrypt environment failure separately rather than weakening gates.
- [x] **Step 4: Run frontend checks.** From `portfolio-project/frontend`, run `npm run lint`, `npm run type-check`, `npm run check:server-boundaries`, `npm run check:api-types`, `npm run test:coverage`, `npm run build`, and separately `npm audit --audit-level=high`.
- [x] **Step 5: Audit the final diff.** Run `git diff origin/main...HEAD --stat`, `git diff origin/main...HEAD -- .github docs/superpowers/specs/2026-07-18-github-actions-hardening-design.md docs/superpowers/plans/2026-07-18-github-actions-hardening.md portfolio-project/CI_CD_SETUP.md`, and `git status --short --branch`; verify only approved changes are staged/committed and the user file is untouched.
- [x] **Step 6: Completion gate.** Map every validation criterion in the design spec to direct command/file evidence. The workflow implementation and local/remote checks are complete; the current PR remains blocked only by the pre-existing invalid SonarCloud repository secret, which must be rotated outside the repository.
