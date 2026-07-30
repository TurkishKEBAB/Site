# Validation Report — Portfolio Platform (Web + Desktop) Dossier

**Project slug:** `portfolio-platform-web-desktop`
**Authoring contract:** [2026-07-25-project-dossier-authoring-design.md](2026-07-25-project-dossier-authoring-design.md) §5
**Evidence ledger:** [2026-07-25-portfolio-platform-evidence-ledger.md](2026-07-25-portfolio-platform-evidence-ledger.md)
**Run date:** 2026-07-25
**Local stack:** Postgres 15 (docker `dossier_pg` :5433) · Redis 7 (docker `dossier_redis` :6380) ·
FastAPI/uvicorn 127.0.0.1:8000 · Next.js 16 dev :3000 · Python 3.14.3 venv

## 1. What was executed

| Phase | Outcome |
|-------|---------|
| Faz 0 — evidence | Ledger compiled; 21 claims each tagged `verified`/`provided`/`pending` with source + commit/date. |
| Faz 1–2 — authoring | `seed_dossiers.py` `portfolio-platform-web-desktop` block rewritten from first-party evidence (not the seed). |
| Faz 3a — stack | Alembic `upgrade head` (5 migrations) → `seed_data.py` (5 projects) → `seed_dossiers.py --force` (dossier). Admin `yigitokur@ieee.org` seeded. |
| Faz 3b — screenshots | 10 real WebP captured via Chrome DevTools; 6 curated into the gallery. |
| Faz 3c — round-trip | Admin login → dossier editor → **Save (PUT)** → public **GET** diffed: content preserved. Gallery renders (6/6 images load). |
| Faz 4 — validation | git hashes verified, schema test + frontend dossier test + type-check + build run. |

## 2. Final validation checklist (spec §"Son doğrulama checklist'i")

| # | Item | Status | Evidence |
|---|------|--------|----------|
| 1 | Every claim has source + status | ✅ | Evidence ledger, 21-row claims table |
| 2 | Seed↔real differences reported | ✅ | Ledger "Seed claims to correct" table (60+→72, staged→provider-native, fake hashes→real, Sonar result→`provided`) |
| 3 | `impact_en` and `impact_tr` tell the same fact | ✅ | Parallel translations verified in admin editor (both: 72 route handlers · provider-native · ISR · 16-workflow CI) |
| 4 | C4 nodes match real system boundaries | ✅ | Context: Admin/Visitor · Portfolio Platform · GitHub/Supabase/SMTP. Containers: Next.js(Vercel)/FastAPI(Railway)/Redis/PostgreSQL |
| 5 | Diagram `data.kind` == outer `kind` | ✅ | Injected in `seed_dossiers.py` loop; `test_seed_dossiers` passes |
| 6 | Sequence actor/message names real | ✅ | seq-public (ISR path), seq-github (Redis hit/miss → stale fallback) derived from `publicProjects.ts` + `github_service.py` |
| 7 | Schema relations real or `proposed` | ✅ | ERD built from `models/dossier.py` (ProjectDossier 1:N metrics/c4→nodes/adrs/log/diagrams/gallery) |
| 8 | No duplicate diagram/gallery ids | ✅ | Diagrams: seq-public, seq-github, authz, cicd-pf, flow-dossier, erd. Gallery: pf-home, pf-projects, pf-dossier-arch, pf-dossier-cicd, pf-admin-dossier, pf-home-mobile — all unique |
| 9 | ADR context/decision/tradeoff filled, status sourced | ✅ | 4 ADRs (ACCEPTED, 2026-07) rendered with full C/D/T; anchored to real incidents/commits |
| 10 | Log hash/date not fabricated | ✅ | All 6 hashes resolve in git: `ce948d7`,`21df8b1`(PR#79),`3e8f028`,`707906d`,`905d39a`,`3d00c11` with matching subjects |
| 11 | All gallery `src` actually reachable | ✅ | 6/6 images `complete && naturalWidth>0` in the running modal (5×1440×900, mobile 500×844) |
| 12 | Captions meaningful as alt text | ✅ | e.g. "fig 03 — dossier · interactive C4 (context → containers)" |
| 13 | No secrets / personal data / unpublishable detail in images | ✅ | No tokens rendered; MESSAGES=0 (no third-party content); only the owner's own already-public contact email/socials appear |
| 14 | API schema validation passed | ✅ | `test_seed_dossiers.py` → **3 passed**; `seed_dossiers.py --force` re-validates via `ProjectDossierUpsert` |
| 15 | Admin PUT → public GET returns correct dossier | ✅ | Round-trip: counts + all diagram ids + all metric numeric values preserved (see §4) |
| 16 | Frontend modal renders real content on every tab | ✅ | overview (72/impact), architecture (C4 + 6 diagrams), decisions (4 ADRs), eng·log (6 entries), gallery (6 images) |
| 17 | Relevant tests + build ran after final change | ✅ | Backend `test_seed_dossiers` 3✓; frontend `dossier.test.tsx` 9✓; `tsc --noEmit` exit 0; `next build` (see §6) |

## 3. §5 requested deliverables — coverage

**Diagram package (8 requested):** all present.
1. C4 Context ✅ · 2. C4 Containers ✅ (both as the synthesized `c4` diagram's levels) ·
3. Sequence public/ISR ✅ (`seq-public`) · 4. Sequence GitHub→Redis→fallback ✅ (`seq-github`) ·
5. Authorization matrix ✅ (`authz`) · 6. CI/CD ✅ (`cicd-pf`, corrected: CI = gate+smoke, not deployer) ·
7. Dossier flow ✅ (`flow-dossier`) · 8. Schema/ERD ✅ (`erd`).

**Requested images:**

| Requested | Status |
|-----------|--------|
| Homepage desktop + mobile | ✅ `-home.webp`, `-home-mobile.webp` |
| Projects index | ✅ `-projects.webp` |
| Projects hover/selection state | ⚠️ not captured as a distinct frame (index captured; selection immediately opens the modal, also captured) |
| Dossier modal overview/architecture/ADR/log/gallery | ✅ all tabs verified rendering; `-dossier-arch/-cicd/-erd/-adr/-log.webp` |
| Admin project/dossier editor | ✅ `-admin.webp` (dashboard) + `-admin-dossier.webp` (editor) |
| GitHub cache / API observability | ❌ **not captured** — GitHub upstream returned "Data temporarily unavailable" in the local run; per the evidence-first policy this was not faked. The 24h/in-memory-fallback claim remains verified from `config.py`/`cache_service.py`. |
| CI / Vercel preview / Sonar quality evidence | ⏭️ owner-provided (external dashboards behind the owner's accounts) — `provided`, not fabricated |

**Masking / format:** WebP only, referenced by site-relative path (no base64). No secrets/tokens/third-party message content in any frame.

## 4. Admin PUT → public GET round-trip

Method: admin login (`yigitokur@ieee.org`) → PROJECTS → Dossier editor → **Save dossier** (fires authenticated
`PUT`) → re-fetch public `GET /api/v1/dossiers/portfolio-platform-web-desktop`.

- Counts identical before/after: metrics 5 · c4 2 · adrs 4 · log 6 · diagrams 6.
- All diagram ids preserved; all metric `numeric_value`s preserved (72/24/2/16/5).
- Only observed diff: two **same-`display_order` sibling pairs** re-ordered (Admin↔Visitor, Redis↔PostgreSQL).
  Cosmetic non-determinism, **zero data loss**. Authored order restored by re-running `seed_dossiers.py --force`.

## 5. Test & build results

| Check | Result |
|-------|--------|
| `pytest tests/test_seed_dossiers.py` | 3 passed |
| `vitest run src/components/nexus/dossier.test.tsx` | 9 passed |
| `tsc --noEmit` (type-check) | exit 0 |
| `next build` | see build log (§6) |
| git hash existence (6 log entries) | 6/6 resolve |

## 6. Files changed

- `portfolio-project/backend/seed_dossiers.py` — `portfolio-platform-web-desktop` block: verified impact/metrics/C4/ADRs/log/diagrams + 6-item real gallery.
- `portfolio-project/backend/seed_data.py` — this project's `description_en`/`description_tr` corrected (60+→72, staged→provider-native) to match the dossier; keeps the modal header consistent.
- `portfolio-project/frontend/public/projects/portfolio-platform-web-desktop-*.webp` — 10 real captures (6 in gallery).
- `docs/superpowers/specs/2026-07-25-portfolio-platform-evidence-ledger.md` — evidence ledger (separate from payload).
- `docs/superpowers/specs/2026-07-25-portfolio-platform-validation-report.md` — this report.

## 7. Known limitations / notes

- **GitHub observability image** not captured (upstream unavailable locally); not fabricated.
- **CI/Vercel/Sonar dashboard images** are owner-provided (external accounts); the Sonar "Passed" *result* stays `provided`, gate *mechanism* stays `verified`.
- **Next dev data-cache artifact:** the modal's project *marketing description* line briefly showed the pre-fix "60+/staged" text from Next's fetch cache; DB, API, and `seed_data.py` all serve the corrected "72/provider-native" text (verified). Resolves on cache revalidation / fresh deploy.
- **Pre-existing seed bug (out of scope):** `seed_data.py` `clear_existing_data` leaves `projects` rows, so a re-run on a non-empty DB hits a duplicate-slug violation. First seed on a fresh DB works; this run used a targeted DB update instead of a full re-seed for the description fix.
- **Stale backend processes** from earlier sessions are listening on `:8000` (`0.0.0.0`/`[::1]`); the local frontend was pointed at `127.0.0.1:8000` to reach this run's backend deterministically. Left untouched (not started by this session).
- **bcrypt/passlib** logs a cosmetic "error reading bcrypt version" on Python 3.14; hashing/verify work (login succeeded).
