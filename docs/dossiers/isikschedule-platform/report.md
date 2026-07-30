# IsikSchedule Platform — Dossier Research Report

## 2026-07-31 re-audit addendum

The previously local-only review was extended to the public repository inventory. The
requested `https://github.com/TurkishKEBAB/isikschedule-core` repository does exist and
was inspected at `d64bd26` (2025-11-03) in a temporary read-only clone. It is a separate
Python `course_scheduler` application with its own planner, optimizer, local profiles,
file exports, and UML documentation. Neither `isikschedule-web` nor
`isikschedule-desktop` imports it. The defensible model is therefore three independent
codebases around the same scheduling problem, not a shared core.

The 2026-07-25 measurements and WebP captures remain valid for the web/desktop dossier;
the remote `isikschedule-core` codebase is included as source context but contributes no
new shared-runtime claim. The active payload continues to omit unsourced user counts,
coverage claims, and aspirational PostgreSQL/Redis/Celery topology.

Authored against `docs/superpowers/specs/2026-07-25-project-dossier-authoring-design.md`.
Payload: `dossier.json` (same folder). Evidence ledger is section B below and is
deliberately **not** part of the payload.

- **Project slug:** `isikschedule-platform`
- **Research date:** 2026-07-25
- **Sources read:** `C:\Develop\Projects\isikschedule-web` (branch `issue-22-db-model-integrity`,
  33 commits, 2026-01-02 → 2026-07-02) and `C:\Develop\Projects\isikschedule-desktop`
  (branch `master`, 19 commits, 2025-11-10 → 2026-02-21).
- **Status:** research complete, payload schema-validated, **not yet written to the API.**

---

## A. Executive summary

The seed dossier describes a product that does not exist. It claims a shared solver core
feeding a PyQt6 desktop and a Next.js web client through a FastAPI gateway backed by
PostgreSQL, Redis and Celery across six Docker services, at 86.97% coverage with ~1,000
users.

What the two repositories actually contain is **two independent products that share a
problem domain and nothing else**:

- **`isikschedule-desktop`** — a PyQt6 application with a genuine, verifiable
  13-algorithm registry (`@register_scheduler` + `AlgorithmMetadata` behind a
  `BaseScheduler` ABC) persisting to a local SQLite file.
- **`isikschedule-web`** — a FastAPI + Next.js 16 application with its **own** solver
  (`app/scheduling/solver.py`), also on SQLite. It never imports the desktop registry;
  `app/algorithms/__init__.py` is a one-line docstring that was never filled.

The single most defensible engineering story here is not "13 algorithms" — it is the web
solver itself: an **exact** depth-first search with minimum-remaining-values ordering,
degree tie-breaking, forward checking and bitmask clash detection, bounded to 100
discovered layouts and 20 returned, followed by a **quality-diversity (MMR)** re-ranking
so users get meaningfully different options rather than near-duplicates. That is a real,
uncommon design decision, and it measures well: **3,367 solve runs against the live
1,301-course catalog returned in a 1.47 ms median (p95 4.16 ms)**.

The rewritten dossier therefore drops every unverifiable marketing number, states the
two-client split honestly as ADR-001, and documents the synchronous/no-queue reality as
ADR-003 rather than hiding it behind the aspirational compose file.

**Four real screenshots were produced during this research** and written to
`portfolio-project/frontend/public/projects/` — a directory that did not previously exist,
which is why every project's gallery was broken.

---

## B. Evidence ledger

Status values follow the spec: `verified` / `provided` / `inferred` / `unknown` / `proposed`.

### B.1 Verified — safe to publish

| # | Claim | Source | Date | Conf. |
|---|---|---|---|---|
| 1 | 13 solver classes carry `@register_scheduler`; the package eagerly imports exactly those 13 modules | `isikschedule-desktop/algorithms/__init__.py:52-66` + 13 decorated classes | 2026-07-25 | high |
| 2 | Solver names: A\*, BFS, ConstraintProgramming, DFS, Dijkstra, Genetic, Greedy, HillClimbing, HybridGA+SA, IDDFS, PSO, SimulatedAnnealing, TabuSearch | `AlgorithmMetadata(name=…)` in each module | 2026-07-25 | high |
| 3 | Desktop persists to SQLite (`courses`, `schedules`, `programs`, `program_schedules`, `transcripts`, `grades`) | `isikschedule-desktop/core/database.py:7,40,74-140` | 2026-07-25 | high |
| 4 | Desktop deps are PyQt6 / pandas / numpy / openpyxl / reportlab / matplotlib — no server stack | `isikschedule-desktop/requirements.txt` | 2026-07-25 | high |
| 5 | Web solver is `dfs_mrv_bitmask` + `quality_diversity_mmr`; bounds 100/20/5; score = 35+25+20+20 | `backend/app/scheduling/solver.py:13-28,1064-1075` | 2026-07-25 | high |
| 6 | Generation is synchronous: `run_job()` is called inline inside the POST handler | `backend/app/api/routes/generate.py:162-175` | 2026-07-25 | high |
| 7 | Job state is a module-level dict swept after 1 h; lost on restart | `generate.py:43,182-193` | 2026-07-25 | high |
| 8 | The `algorithm` request field is accepted and ignored (bound to `_algorithm`, never read) | `generate.py:49,59-66` | 2026-07-25 | high |
| 9 | Web ORM has exactly 4 tables: `users`, `saved_schedules`, `friendships`, `global_courses` | `backend/app/models/database.py` + `alembic/versions/20260701_0001_baseline_schema.py` | 2026-07-25 | high |
| 10 | `saved_schedules.user_id` is nullable (anonymous shares) | `database.py:98-102` | 2026-07-25 | high |
| 11 | Auth is HS256 bearer via python-jose; `get_current_user` / `get_current_admin` (`role != "admin"` → reject) | `backend/app/core/auth.py:11,21,65,96-98` | 2026-07-25 | high |
| 12 | Token lifetime is 7 days and **no refresh endpoint exists** | `config.py:38` (`60*24*7`); no `/refresh` route in `auth.py` | 2026-07-25 | high |
| 13 | Default DB is SQLite (`sqlite:///./data.db`) | `config.py:41` | 2026-07-25 | high |
| 14 | 28 route handlers across 8 routers | `@router.*` decorator count | 2026-07-25 | high |
| 15 | Auth matrix: generate / catalog / share are anonymous; upload, friends, `/me*` need a token; `/api/admin/*` needs admin | `Depends(...)` declarations per route | 2026-07-25 | high |
| 16 | CI = `backend-quality.yml` (pytest + ruff), `frontend-quality.yml` (npm audit + lint + build + design contract), `codeql.yml`. **No coverage gate, no Sonar step, no deploy job.** | `.github/workflows/` | 2026-07-25 | high |
| 17 | Frontend is Next.js 16.2.9 / React 19.2.7 / Tailwind 3.4 / zustand 4.5 / react-query 5.17 | `frontend/package.json` | 2026-07-25 | high |
| 18 | Alembic baseline `20260701_0001` + FK-cascade `20260702_0001` | `backend/alembic/versions/` | 2026-07-25 | high |
| 19 | **Measured:** 58 tests pass; backend coverage 74%; `solver.py` 91% | `pytest -q --cov=app` run this session | 2026-07-25 | high |
| 20 | **Measured:** 1,301 sections parsed from a real workbook into semester `2026-2027-Fall` | `POST /api/admin/upload-semester` response | 2026-07-25 | high |
| 21 | **Measured:** 3,367 solve runs — median 1.47 ms, p95 4.16 ms, max 119.51 ms | solver `elapsed_ms` metadata, this session | 2026-07-25 | high |
| 22 | **Measured:** COMP1103 + MATH1111 + MATH2201 → 48 layouts discovered, 20 returned, top score 72/100, 0 clashes, 16 ECTS | live run + screenshot fig 01 | 2026-07-25 | high |
| 23 | Real commit hashes/dates used in the log | `git log` on both repos | 2026-07-25 | high |
| 24 | Four gallery assets exist on disk as WebP | `frontend/public/projects/` | 2026-07-25 | high |

### B.2 Verified false — must be removed from the seed

| # | Seed claim | Reality | Source |
|---|---|---|---|
| 25 | "shared solver core", "same 13 algorithms everywhere" | Two independent implementations; web never imports the desktop registry; `app/algorithms/__init__.py` is an empty docstring | both repos |
| 26 | PostgreSQL is the primary store | Both products use SQLite | `config.py:41`, `core/database.py:7` |
| 27 | Celery workers run async solves | No Celery app (`app/tasks/__init__.py` is one docstring), no `celery` in `requirements.txt`; `celery -A app.tasks worker` cannot start | `backend/` |
| 28 | Redis is cache + broker | `REDIS_URL` is a config string with **zero** call sites | `config.py:44` |
| 29 | "6 services" | `docker-compose.yml` declares **5**, and 2 of them (celery, db) cannot boot against the real dependency set | `docker-compose.yml` |
| 30 | ERD of `course`/`section`/`room`/`time_slot`/`schedule`/`schedule_item` | None of these tables exist in either repo | `database.py`, alembic |
| 31 | External systems "University SIS" and "SMTP" | No SIS integration and no SMTP anywhere; the only ingest is an admin Excel upload | grep, both repos |
| 32 | ADR-002 "Celery + Redis … Accepted 2025-03" | Never implemented — cannot be `Accepted` | `backend/` |
| 33 | ADR-003 "short expiry + refresh flow" | 7-day token, no refresh endpoint | `config.py:38`, `auth.py` |
| 34 | Log hashes `e41c7a2`, `b93f0d8`, `7d20c4e`, `31a9be5` with tags `v1.0/v0.9/v0.6/v0.1` | Not present in either repo; **neither repo has a single git tag** | `git log --all`, `git tag` |
| 35 | CI "86.97% coverage floor" + "SonarQube quality gate" + "docker build 6 images" + "compose deploy" | No coverage threshold, no Sonar step, no docker build and no deploy job in any workflow | `.github/workflows/` |
| 36 | Gallery `isik-desktop.png`, `isik-web.png`, `isik-gate.png` | Never existed — `frontend/public/projects/` itself was absent until this session | filesystem |

### B.3 Unknown — cannot be published as fact

| # | Claim | Why it stays unknown | What would settle it |
|---|---|---|---|
| 37 | "~1,000 desktop users" | No analytics, telemetry, release-download record or README statement in either repo; nothing found by grep | A download/installer count, an app-store/release page, or the owner's written attestation |
| 38 | "86.97% coverage" | SonarQube ran **locally** on 2026-02-21 (`.scannerwork/report-task.txt`, `serverUrl=http://localhost:9000`) and stores no percentage; the server is not reachable and no `coverage.xml`/`htmlcov` artifact was committed | A Sonar export, a committed coverage report, or a CI run publishing coverage |
| 39 | Which repo the 86.97% referred to | Both repos were scanned the same day under different project keys | same as above |

**Replacement:** metric #19 (74%, web backend, 58 tests, measured 2026-07-25) is used
instead of #38. The desktop suite (126 test functions) was **not** executed — PyQt6 is not
installed in this environment — so no desktop coverage figure is claimed.

### B.4 Proposed — future design, not current architecture

| # | Item | Note |
|---|---|---|
| 40 | PostgreSQL + Redis + Celery topology | Exists only in `docker-compose.yml`/README as intent. `MAINTENANCE_PLAN.md` decision **K1** makes sync-first official and schedules the rework as Phase 2.1. Recorded in ADR-003 as the rejected alternative — **not** drawn as a live component. |

### B.5 Source-package reconciliation

The requested `https://github.com/TurkishKEBAB/isikschedule-core` repository exists remotely
and was inspected at commit `d64bd26` in a temporary read-only clone. It is a standalone
Python `course_scheduler` application with its own planner, optimizer, local profiles, file
exports, and UML documentation. The desktop and web repositories do not import it, so it is
source context for the scheduling problem rather than a shared runtime dependency. The
desktop source was also read from `isikschedule-desktop` (`origin =
https://github.com/TurkishKEBAB/isikschedule-desktop.git`).

---

## C. Verified current architecture

**Ingest.** An admin uploads one `.xlsx` to `POST /api/admin/upload-semester?semester=…`.
`app/core/excel_loader.py` parses it, the whole catalog is stored as a JSON blob in
`global_courses.courses_json`, and any previously active semester is deactivated. Students
read it anonymously via `GET /api/courses/global`.

**Generation.** `POST /api/generate` validates 1–15 `main_code`s, loads the catalog, and
calls `generate_schedule_result()` **inline**. The solver groups each course's sections into
lecture/lab/PS *layout choices*, allocates one bit per distinct time slot, then runs DFS
where the next course is chosen by fewest surviving candidates (degree breaks ties), pruning
on clash count, ECTS ceiling and a forward check. Up to 100 complete layouts are collected;
each is scored 0-100 (clashes 35, coverage 25, free days 20, compactness 20) and the best 20
are chosen by MMR at 0.65 quality / 0.35 distance, with user preferences applied as a soft
ordering penalty that never alters the displayed score. The response carries `schedules`,
a `diagnosis` explaining any empty result, and `metadata` with timing and prune counters.

**Job handling.** The result is stored in the in-process `JOBS` dict under a UUID and is
already `completed` when the POST returns. `GET /api/jobs/{id}` serves it and sweeps entries
older than one hour. There is no queue, no worker and no persistence — a restart loses
everything.

**Persistence.** SQLite, four tables, Alembic-versioned since 2026-07-01.
`saved_schedules.user_id` is nullable so anonymous share links work.

**Security.** HS256 bearer tokens; two roles; slowapi rate limiting (uploads at 20/min);
CORS narrowed in production; a global exception handler that logs the traceback and returns
a stable `{error, message}`; `/health/ready` probing database, upload directory and critical
config. `config.py` refuses to boot in production while `SECRET_KEY` or admin credentials
sit at their documented placeholder values.

**Desktop.** Independent PyQt6 app, own SQLite, 13-solver registry with shared
`AlgorithmMetadata`, plus `algorithm_selector`, `benchmark`, `conflict_manager`,
`constraints`, `evaluator`, `heuristics` and `parallel_executor` support modules.

---

## D. Claims removed or corrected

Rows 25-36 of the ledger are removed outright. The three that most change the story:

1. **"One scheduling core, two clients" → "Two independent clients."** ADR-001 now records
   the real decision and names the cost (duplicated logic, no shared regression suite).
2. **"Celery + Redis for long-running solves" → "Synchronous with an in-memory job map."**
   ADR-003 records what was actually chosen and why the measured 1.47 ms median justifies it,
   and names the real limitation (no horizontal scale, state lost on restart).
3. **Seed ERD → real ERD.** The invented six-table academic schema is replaced by the four
   tables that exist.

Also corrected: the C4 context loses SIS and SMTP and gains the Excel workbook as the only
external dependency; the CI diagram loses its fictional coverage floor, Sonar gate, image
build and deploy stage.

---

## E. Diagram plan (6 diagrams, all in the payload)

| id | kind | Purpose | Grounding |
|---|---|---|---|
| `solve-sequence` | sequence | The end-to-end request, showing the POST returning an already-finished job | `generate.py`, `solver.py` |
| `web-erd` | schema | The four real tables and their FKs, incl. the nullable owner | `database.py`, alembic baseline |
| `desktop-solver-uml` | schema | The 13 solvers grouped by family behind `BaseScheduler` + registry | `algorithms/` |
| `search-flow` | tiers | Inside one solve, incl. the four real `diagnosis` codes | `solver.py` |
| `rbac-matrix` | matrix | Anonymous / user / admin against real route scopes | `Depends(...)` per route |
| `ci-pipeline` | tiers | The three workflows that gate `master` | `.github/workflows/` |

C4 Context / Containers / Components ship in the payload's `c4` field (not duplicated as a
`c4` diagram). Every `diagram.kind` equals its `data.kind`; verified programmatically.

---

## F. Visual plan (4 real assets, produced this session)

All four are genuine screenshots of the running application — backend on `:8000`, frontend
on `:3000`, real catalog loaded — converted to WebP at quality 88 and written to
`portfolio-project/frontend/public/projects/`.

| File | KB | What it proves |
|---|---|---|
| `isikschedule-platform-results.webp` | 53 | 20 ranked conflict-free timetables from the live catalog; Program #1 at 72/100, 16 ECTS, real section codes |
| `isikschedule-platform-scheduler.webp` | 46 | Catalog browser, weekly grid, and the preference controls that become solver parameters |
| `isikschedule-platform-admin.webp` | 28 | Admin-only surface behind the role check; 1,301 sections in the active term |
| `isikschedule-platform-landing.webp` | 45 | Public landing page |

**Sensitivity review.** No secrets, tokens or personal data appear. The only address visible
is `admin@example.com`, the documented non-functional placeholder in `config.py`. Course
codes and instructor-facing catalog data are public university information. The landing
page embeds an **illustrative marketing preview** (placeholder codes MAT101/CS201/…), so its
caption says so explicitly and points to fig 01 for real solver output.

**Not obtained:** a desktop timetable screenshot (PyQt6 is not installed here) and a
SonarQube gate screenshot (the local server is not running). Both are listed as pending in
section K.

---

## G. ADRs

Four, all traceable (`dossier.json → adrs`):

1. **ADR-001** Two independent clients instead of a shared solver package — *Accepted, 2026-01*
2. **ADR-002** One exact bounded search instead of porting the 13 metaheuristics — *Accepted, 2026-06*
3. **ADR-003** Synchronous generation with an in-memory job map — *Accepted, 2026-06*
4. **ADR-004** Bearer JWT with a two-role check, and anonymous generation — *Accepted, 2026-04*

Each dates to the commit that implements it (ADR-001 → `de99109`; ADR-002 → `c5830c7`;
ADR-003 → same code state; ADR-004 → `9bd8906` security hardening). Every `tradeoff` names a
cost actually visible in the code — the ignored `algorithm` field, the lost job state, the
non-revocable 7-day token.

---

## H. Engineering log

Six entries, newest first, **all real hashes from `git log`**:

| hash | date | title |
|---|---|---|
| `adf58ec` | 2026-07-02 | Account data export and deletion |
| `c5a9e19` | 2026-07-01 | Alembic migration baseline |
| `aeda87e` | 2026-06-29 | CI quality gates |
| `edbff94` | 2026-06-28 | KVKK consent flow |
| `c5830c7` | 2026-06-14 | Exact solver lands |
| `de99109` | 2026-01-02 | Web application starts |

No tags are claimed, because neither repository has any. The desktop origin
(`29b3cdb`, 2025-11-10) is referenced inside the note on the oldest entry rather than as a
separate row, since it belongs to the other repository.

---

## I. Metrics and measurement evidence

| Value | Label | How it was measured |
|---|---|---|
| 1.47 ms | median solve | 3,367 runs over real 3-5 course combinations against the live catalog; solver's own `elapsed_ms`. p95 4.16, max 119.51 |
| 1,301 | courses parsed | Upload response + `GET /api/courses/global` count |
| 74% | backend coverage | `pytest -q --cov=app` → 58 passed, 1,586 statements; `solver.py` 91% |
| 13 | desktop solvers | Static count of `@register_scheduler` classes, cross-checked against the registry's eager imports |
| 20 / 100 | schedules returned | `MAX_RETURNED_SCHEDULES` / `MAX_DISCOVERED_LAYOUTS` constants, confirmed live (48 discovered → 20 returned) |
| 28 | REST endpoints | `@router.*` decorator count across 8 routers |

Every note carries its measurement date. No marketing figure survives without a source.

---

## K. Validation report

**Sources read.** `isikschedule-web`: `main.py`, all 8 route modules, `config.py`,
`core/auth.py`, `core/excel_loader.py`, `models/database.py`, `scheduling/solver.py`,
`alembic/versions/*`, `.github/workflows/*`, `docker-compose.yml`, `sonar-project.properties`,
`.scannerwork/`, `frontend/package.json`, `frontend/app/`, `requirements.txt`, git history.
`isikschedule-desktop`: `algorithms/*` (all 23 modules), `core/database.py`,
`requirements.txt`, `setup.cfg`, `pytest.ini`, `sonar-project.properties`, `.scannerwork/`,
`docs/`, git history.

**Definitively verified.** Ledger rows 1-24 and the falsifications in rows 25-36.

**Still pending.** Rows 37-39 (user count, 86.97% coverage and which repo it described) —
these need the owner or a Sonar export and are absent from the payload.

**Images.** Four assets referenced; all four verified to exist on disk at the exact paths in
the payload. Two further images (desktop client, Sonar gate) remain **pending assets** and
are not referenced by a placeholder path.

**JSON schema validation.** `ProjectDossierUpsert.model_validate()` against
`portfolio-project/backend/app/schemas/dossier.py` → **PASS**. 6 metrics, 3 C4 levels,
4 ADRs, 6 log entries, 6 diagrams, 4 gallery items. All `diagram.kind == data.kind`; no
duplicate ids; no empty C4 tier; every gallery `src` site-relative; all lengths within limits.

**Needs human review.**
1. The brief's `isikschedule-core` URL is wrong — confirm `isikschedule-desktop` is the
   intended repository and correct the brief.
2. Decide whether the "~1,000 users" claim can be sourced or should stay dropped.
3. Confirm the ADR dates, which were anchored to implementing commits rather than to
   written decision records (none exist).
4. Only remote `master` was not consulted; if the deployed product differs from these local
   working copies, re-verify before publishing.

**Not executed.** No `PUT /api/v1/dossiers/projects/{project_id}` was issued. Per the
spec's step 10 the existing dossier must not be overwritten without approval, so the payload
is on disk awaiting a decision.

**Local side effects of this research.** The dev database `data.db` (gitignored) gained the
`2026-2027-Fall` semester with 1,301 courses so the app could be screenshotted; the previously
absent `portfolio-project/frontend/public/projects/` directory was created and now holds four
`.webp` files. Both repositories' tracked files are otherwise untouched.
