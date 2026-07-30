# Evidence Ledger — Portfolio Platform (Web + Desktop)

## 2026-07-31 re-audit addendum

The six planned gallery captures were produced and are now present at
`portfolio-project/frontend/public/projects/` as WebP files. The active seed references
those exact paths. The earlier pending-asset table below is historical authoring work;
its status is superseded for `pf-home`, `pf-home-mobile`, `pf-projects`, `pf-dossier-arch`,
`pf-dossier-cicd`, and `pf-admin-dossier`. The SonarCloud result itself remains
owner-provided/pending because the external dashboard is not part of the repository.

**Project slug:** `portfolio-platform-web-desktop`
**Dossier subject:** this repository (`c:\Develop\Projects\Site`)
**Compiled:** 2026-07-25
**Authoring contract:** [2026-07-25-project-dossier-authoring-design.md](2026-07-25-project-dossier-authoring-design.md) §5

This ledger is kept **separate from the dossier JSON payload** (per the authoring
contract). The seed in `portfolio-project/backend/seed_dossiers.py` is treated as a
research hint only; every claim below was re-derived from the current working tree,
git history, or flagged as `provided` / `pending`.

## Evidence classes

`verified` seen directly in source (path + commit/date) · `provided` owner must supply
· `inferred` derived from multiple sources · `unknown` unverifiable · `proposed` future
design, not shipped.

## Verification method

| What | How |
|------|-----|
| Endpoint count | `grep -r '@router\.(get\|post\|put\|patch\|delete)' backend/app/api/v1` → **72** across 12 routers |
| Cache TTL | read `backend/app/config.py` (`GITHUB_CACHE_HOURS = 24`) + `services/cache_service.py` + `services/github_service.py` |
| Deploy model | read `.github/workflows/deploy-production.yml` (job comments) + `git log` deploy commits |
| CI / quality gate | read `.github/workflows/ci.yml`; `ls .github/workflows/*.yml` → **16** workflows |
| Data model | read `backend/app/models/dossier.py`, `models/project.py`, `alembic/versions/*` (**5** migrations) |
| Frontend flow | read `frontend/package.json`, `app/**`, `src/lib/dossier.ts`, `src/lib/publicProjects.ts`, `src/services/api.ts`, `components/nexus/ProjectDossierModal.tsx` |
| Git milestones | `git log --date=short --pretty='%h %ad %s'` (+ `--grep`) |

## Claims ledger

| # | Claim | Status | Source | Commit / date | Conf. | In dossier? |
|---|-------|--------|--------|---------------|-------|-------------|
| 1 | Frontend is **Next.js 16 App Router** (React 19), not a Vite SPA | verified | `frontend/package.json` (`next ^16.2.11`, `react ^19`); `app/(public\|admin\|auth)/` route groups | `905d39a` 2026-04-22 (migrate to app router) | high | yes |
| 2 | Backend is **FastAPI**, **72** v1 route handlers across 12 routers | verified | `grep @router` in `backend/app/api/v1` | current tree | high | yes (metric) |
| 3 | **PostgreSQL** primary store (Railway in prod) | verified | `config.py` `DATABASE_URL`; `models/*`; `alembic/versions` | current tree | high | yes |
| 4 | **Redis** cache, **24h** GitHub TTL, **graceful in-memory fallback** when Redis absent | verified | `config.py` `GITHUB_CACHE_HOURS=24`; `cache_service.py` (`backend` prop, `_memory` store) | `2daf48e` 2026-07-14 | high | yes (metric+ADR) |
| 5 | GitHub API integration serves **stale cache on fetch error** | verified | `services/github_service.py` `fetch_stats`/`fetch_contributions` return `stale` | current tree | high | yes (ADR) |
| 6 | **Supabase** asset storage; disabled gracefully w/o creds | verified | `services/storage_service.py` `create_client(SUPABASE_URL, SUPABASE_KEY)` | current tree | high | yes (C4) |
| 7 | **SMTP** contact notifications | verified | `config.py` `SMTP_*`; `services/email_service.py` | current tree | high | yes (C4) |
| 8 | **JWT/RBAC** admin (HS256, `ADMIN_EMAILS`) | verified | `config.py`; `api/deps.require_admin`; `api/v1/auth.py` | current tree | high | yes (matrix) |
| 9 | **Deploy = Vercel (FE) + Railway (BE) via each provider's native GitHub integration**; CI does NOT build/deploy | verified | `deploy-production.yml` job comments (no deploy-backend/deploy-frontend jobs on purpose) | `6ff7ca0` 2026-07-14; `15bc89a` (drop phantom Railway hook) | high | yes (metric+ADR+CI diagram) |
| 10 | Railway start command runs `alembic upgrade head` before uvicorn | verified | `deploy-production.yml` comment (lines ~95–98) | current tree | med-high | yes (CI diagram) |
| 11 | Frontend proxies `api.yigitokur.me` → Railway via Vercel rewrite | verified | commit subject | `c9256a1` 2026-07-14 | med | context only |
| 12 | Public pages use **ISR (`next: { revalidate }`)**, not `no-store` — to survive backend cold starts | verified | `src/lib/publicProjects.ts`, `lib/blog.ts` (comment), `lib/systemProfile.ts` | `d5b4d4d` 2026-07-15 | high | yes (sequence+ADR) |
| 13 | Public dossier GET sets `Cache-Control: public, max-age=60, stale-while-revalidate=300` | verified | `api/v1/dossiers.py` `get_public_dossier` | current tree | high | yes (sequence) |
| 14 | CI quality gate: flake8, pip-audit, alembic upgrade, OpenAPI drift, pytest+cov; FE eslint, server-boundary check, api-types drift, type-check, vitest cov, npm audit, next build | verified | `.github/workflows/ci.yml` | current tree | high | yes (CI diagram) |
| 15 | **SonarCloud gate mechanism**: dedicated CI job, `-Dsonar.qualitygate.wait=true`, hard-fails if `SONAR_TOKEN`/org missing on trusted runs; fork/dependabot get a documented safe-skip | verified | `ci.yml` `sonarcloud` + `sonarcloud-secret-restricted-note` jobs | `3e8f028` 2026-07-18 | high | yes (ADR) |
| 16 | SonarCloud gate **currently "Passed"** (result value) | provided | SonarCloud dashboard is external; not observable from repo | — | n/a | only if owner supplies |
| 17 | **16** GitHub Actions workflows (CI, CodeQL, dependency-review, scorecard, supply-chain, deploy-verify, maintenance) | verified | `ls .github/workflows/*.yml` | current tree | high | yes (metric) |
| 18 | Dossier is a first-class feature: migration + API + FE editor/loader + seed | verified | `models/dossier.py`; `api/v1/dossiers.py`; `alembic 20260713_0005` | `51b9b0d`/`707906d` 2026-07-13; `8166812` 2026-07-14 | high | yes (log+flow) |
| 19 | Dossier model: `ProjectDossier` 1:1 `Project`, children metrics/c4(→nodes)/adrs/log/diagrams/gallery, `ON DELETE CASCADE` | verified | `models/dossier.py`, `models/project.py` (`dossier` uselist=False) | current tree | high | yes (schema) |
| 20 | FE dossier flow: select in `ProjectIndex` → `GET /dossiers/{slug}` → `toProjectDetail` **synthesizes a `c4` diagram from the `c4` field** → modal tabs (overview/arch/adr/log/gallery) | verified | `services/api.ts` (`/dossiers/${slug}`), `lib/dossier.ts` (c4 prepend), `ProjectDossierModal.tsx` | current tree | high | yes (flow diagram) |
| 21 | `numeric_value` metrics coverage / backend test count | pending → verified in Faz 4 | `pytest` run output | to be measured | — | yes (metric) after run |

## Seed claims to correct or remove (authoring output §D)

| Seed claim (`seed_dossiers.py`) | Verdict | Correction |
|----------------------------------|---------|------------|
| CI/CD tiers diagram: `push → Lint+tests → Sonar gate → **Vercel build** → **Railway deploy** → health checks` | **wrong** | CI does **not** build/deploy. Real flow: push→main triggers (a) CI quality+Sonar gate **and, in parallel,** (b) Vercel + Railway **native integrations** build & deploy; then **post-deploy smoke checks** verify live FE (curl) + BE (admin login → `/admin/stats`). Rebuild the diagram. |
| Metric `60+ API endpoints` | conservative/true | Replace with verified **72** (grep count), keep as measurable. |
| Metric `SonarQube quality gate: Passed` | unverifiable result | Gate **mechanism** is verified (wait=true, enforced). "Passed" value → `provided`; do not assert without owner's dashboard evidence. Reframe metric around the enforced gate or the 16-workflow surface. |
| Log hashes `b6d20e4 / f19c73b / 48a5d0f / 90e14cc` | fabricated placeholders | Replace with real hashes from `git log` (see below). |
| ADR-001 "Staged deploys" / ADR-002 "24h cache" (generic) | thin | Keep the ideas but re-anchor to real incidents/commits (localhost-bundle race; in-memory fallback; ISR cold-start; Sonar consolidation). |
| C4 Redis node "24h GitHub cache" | true but incomplete | Add the in-memory fallback nuance (Redis is not a hard dependency). |

## Real engineering-log milestones (newest → oldest)

| hash | date | title | source |
|------|------|-------|--------|
| `ce948d7` | 2026-07-25 | Evidence-first dossier authoring guide | `git log` |
| `21df8b1` | 2026-07-25 | Frontend performance pass (server-rendered project index, slimmer public payloads) — PR #79 | `git log` (`14ee331`,`859e7db`) |
| `3e8f028` | 2026-07-18 | SonarCloud quality gate consolidated into CI (enforced) | `git log --grep sonar` |
| `707906d` | 2026-07-13 | Project dossier API + migration shipped | `git log --grep dossier` (`51b9b0d`) |
| `905d39a` | 2026-04-22 | Public site migrated to Next.js App Router | `git log --grep next` |
| `3d00c11` | 2025-11-02 | Initial commit | `git log --reverse` |

## Metric measurement ledger (payload has no source field — recorded here)

| value | label | method | date | status |
|-------|-------|--------|------|--------|
| 72 | API endpoints | `grep -c @router` across `api/v1` (12 files) | 2026-07-25 | verified |
| 24h | GitHub cache TTL | `config.py GITHUB_CACHE_HOURS=24` | 2026-07-25 | verified |
| 2 | deploy targets | Vercel FE + Railway BE (native integrations) | 2026-07-25 | verified |
| 16 | CI/CD & security workflows | `ls .github/workflows/*.yml` | 2026-07-25 | verified |
| _tbd_ | backend coverage / test count | `pytest -q` (Faz 4) | pending | pending |

## Gallery evidence plan (real assets only — no placeholders)

Target dir `frontend/public/projects/` does **not** exist yet; all gallery `src`
values are **pending** until captured. Naming: `/projects/pf-<id>.webp`.

| id | asset | capture method | status |
|----|-------|----------------|--------|
| pf-home | public home (desktop) | run stack → chrome-devtools screenshot → WebP | pending (I capture) |
| pf-home-mobile | public home (mobile viewport) | resize_page 390×844 → screenshot | pending (I capture) |
| pf-projects | Projects index + hover/selection | screenshot | pending (I capture) |
| pf-dossier | dossier modal (arch tab, diagram gallery) | open modal → screenshot | pending (I capture) |
| pf-admin | admin project/dossier editor | admin login → screenshot | pending (I capture) |
| pf-cache | GitHub cache/observability output | `/api/v1/github` cache-status JSON or Command Center | pending (I capture if reachable) |
| pf-ci / pf-sonar | CI run / Vercel preview / SonarCloud gate | external dashboards behind owner's accounts | **provided** (owner supplies; masked) |

**Masking rule:** secrets, tokens, e-mail addresses, and personal contact-message
content must be masked in every screenshot; export WebP/AVIF, never base64-inline.

## Items requiring human review / owner input

- Item 16 (Sonar "Passed") and `pf-ci`/`pf-sonar` gallery: external dashboards → owner-provided, or captured from owner's authenticated session.
- Real production numbers (uptime, visitor counts) are intentionally **omitted** — no verifiable source in-repo; not fabricated.
