"""
Seed project dossiers (C4 / ADR / log / diagrams / gallery).

Seed content is evidence-led and loads through crud.dossier.upsert_dossier, so
it is idempotent per project; existing dossiers are skipped unless --force.
The active map is intentionally limited to projects with a verified source
package or a first-party evidence ledger. Pending project cards remain in the
project catalog without an invented architecture dossier.

Usage (inside the backend container or with DATABASE_URL exported):
    python seed_dossiers.py           # seed projects that have no dossier yet
    python seed_dossiers.py --force   # overwrite existing dossiers too

Gallery images are referenced as /projects/* and must exist in
frontend/public/projects/ to render; missing files only affect the gallery.

Research-backed payloads that must be available to the seed image live in
backend/dossier_payloads/ and are loaded by project slug below.
"""

import json
import sys
from pathlib import Path

from sqlalchemy.orm import Session

from app.crud.dossier import get_dossier_by_project_id, upsert_dossier
from app.database import SessionLocal
from app.models.project import Project
from app.schemas.dossier import ProjectDossierUpsert

# Historical payloads are retained below only as migration context. The active
# seed map is rebuilt from verified or explicitly pending-source content after
# this literal; legacy marketing claims never reach the API seed loop.
_LEGACY_DOSSIER_CONTENT: dict[str, dict] = {
    "teknofest-sarkan-uav-defense-platform": {
        "impact_en": (
            "3rd place among 700+ Teknofest projects: anti-jam telemetry and a "
            "frequency-hopping link held 99.2% uptime in contested-spectrum field "
            "tests, delivered across mechanics, electronics, and software on a "
            "200K ₺ budget."
        ),
        "impact_tr": (
            "700+ Teknofest projesi arasında 3.lük: anti-jam telemetri ve frekans "
            "atlamalı bağlantı, saha testlerinde %99,2 kesintisizlik sağladı; "
            "mekanik, elektronik ve yazılım 200 bin ₺ bütçeyle teslim edildi."
        ),
        "metrics": [
            {"value": "3rd", "label": "final rank", "note": "among 700+ projects", "display_order": 0},
            {"value": "200K ₺", "label": "budget managed", "note": "165K ₺ TÜBİTAK grant", "display_order": 1},
            {"value": "3", "label": "domains", "note": "mech · electronics · software", "display_order": 2},
            {"value": "99.2%", "label": "telemetry uptime", "note": "field tests", "display_order": 3},
        ],
        "c4": [
            {
                "label": "Context",
                "note": "operator, platform, and a hostile RF environment",
                "display_order": 0,
                "tiers": [
                    [{"kind": "person", "title": "Ground Operator", "sub": "pilots & monitors"}],
                    [{"kind": "system", "title": "Sarkan UAV", "sub": "anti-jam telemetry & control"}],
                    [{"kind": "external", "title": "RF Environment", "sub": "contested spectrum", "leaf": True}],
                ],
            },
            {
                "label": "Containers",
                "note": "software units across ground and air",
                "display_order": 1,
                "tiers": [
                    [{"kind": "container", "title": "Ground Station UI", "sub": "telemetry dashboards"}],
                    [
                        {"kind": "container", "title": "Telemetry Link", "sub": "frequency-hopping radio"},
                        {"kind": "container", "title": "Anti-jam Module", "sub": "signal scoring & fallback"},
                    ],
                    [{"kind": "container", "title": "FC Bridge", "sub": "command uplink", "leaf": True}],
                ],
            },
        ],
        "adrs": [
            {
                "id": "ADR-001",
                "title": "Frequency-hopping fallback over single-band",
                "status": "Accepted",
                "date": "2023-04",
                "context": "Judged scenarios include active jamming; a single-band link dies with the band.",
                "decision": "Score link quality continuously and hop on degradation, with a slow-but-robust fallback channel.",
                "tradeoff": "Lower peak bandwidth; hop synchronization added protocol complexity.",
                "display_order": 0,
            },
            {
                "id": "ADR-002",
                "title": "Python on the ground station",
                "status": "Accepted",
                "date": "2023-02",
                "context": "Three sub-teams iterate on dashboards and control logic under competition deadlines.",
                "decision": "Python for iteration speed; hot paths isolated behind a thin native layer.",
                "tradeoff": "Careful profiling needed to keep the telemetry loop under budget.",
                "display_order": 1,
            },
        ],
        "log": [
            {"hash": "f8a12dc", "tag": "finals", "date": "2023-09", "title": "3rd place — 700+ projects", "display_order": 0},
            {"hash": "c47e901", "date": "2023-07", "title": "Anti-jam rewrite after field loss", "note": "Link scoring tuned on real interference data.", "display_order": 1},
            {"hash": "9b3d54a", "date": "2023-05", "title": "First full-range field test", "display_order": 2},
            {"hash": "2e6f0b7", "tag": "kickoff", "date": "2023-01", "title": "Team formed · TÜBİTAK grant secured", "display_order": 3},
        ],
        "diagrams": [
            {
                "id": "seq-jam",
                "kind": "sequence",
                "title": "Sequence — jam recovery",
                "note": "link degradation to recovery, field-tested",
                "display_order": 0,
                "data": {
                    "actors": ["Ground Station", "Telemetry Link", "Anti-jam", "UAV"],
                    "messages": [
                        {"from": "Ground Station", "to": "UAV", "label": "heartbeat · 10 Hz"},
                        {"from": "UAV", "to": "Ground Station", "label": "telemetry frame", "kind": "return"},
                        {"from": "Anti-jam", "to": "Anti-jam", "label": "score link quality"},
                        {"from": "Anti-jam", "to": "Telemetry Link", "label": "quality < θ → hop"},
                        {"from": "Telemetry Link", "to": "UAV", "label": "sync channel №4"},
                        {"from": "UAV", "to": "Ground Station", "label": "resume telemetry", "kind": "return"},
                    ],
                },
            },
            {
                "id": "link-state",
                "kind": "tiers",
                "title": "State — link quality",
                "note": "fallback ladder under jamming",
                "display_order": 1,
                "data": {
                    "tiers": [
                        [{"kind": "state", "title": "locked", "sub": "full bandwidth"}],
                        [{"kind": "state", "title": "degraded", "sub": "score < θ₁"}],
                        [{"kind": "state", "title": "hopping", "sub": "channel scan"}],
                        [
                            {"kind": "final", "title": "re-locked", "via": "sync ok"},
                            {"kind": "error", "title": "fallback", "sub": "low-rate channel", "via": "scan fail"},
                        ],
                    ],
                    "notes": ["fallback keeps the command uplink alive at minimum rate", "re-locked resets the scoring window"],
                },
            },
        ],
        "gallery": [
            {"id": "sarkan-gs", "src": "/projects/sarkan-gs.png", "caption": "fig 01 — ground station · live telemetry", "display_order": 0},
            {"id": "sarkan-field", "src": "/projects/sarkan-field.png", "caption": "fig 02 — field test day", "display_order": 1},
        ],
    },
    "agentic-ide-thesis-project": {
        "impact_en": (
            "Thesis project: an AI-native IDE built on Monaco without forking "
            "VS Code — every agent change passes a human approval gate and a "
            "prohibited-command policy engine, against local and cloud LLM backends."
        ),
        "impact_tr": (
            "Tez projesi: VS Code fork'lamadan Monaco üzerine kurulan AI-native "
            "IDE — her ajan değişikliği insan onay kapısından ve yasaklı-komut "
            "politika motorundan geçiyor; yerel ve bulut LLM arka uçlarıyla çalışıyor."
        ),
        "metrics": [
            {"value": "4", "label": "loop stages", "note": "observe · plan · approve · apply", "display_order": 0},
            {"value": "0", "label": "VS Code forks", "note": "extends Monaco directly", "display_order": 1},
            {"value": "2", "label": "LLM backends", "note": "local + cloud", "display_order": 2},
            {"value": "37", "label": "requirements", "note": "v0 spec, CI-validated", "display_order": 3},
        ],
        "c4": [
            {
                "label": "Context",
                "note": "a developer, an IDE, and the models behind it",
                "display_order": 0,
                "tiers": [
                    [{"kind": "person", "title": "Developer", "sub": "reviews & approves every change"}],
                    [{"kind": "system", "title": "Agentic IDE", "sub": "AI-native editor · thesis project"}],
                    [
                        {"kind": "external", "title": "Local LLM", "sub": "on-device inference", "leaf": True},
                        {"kind": "external", "title": "Cloud LLM APIs", "sub": "heavy reasoning", "leaf": True},
                    ],
                ],
            },
            {
                "label": "Containers",
                "note": "modular pieces — no VS Code fork",
                "display_order": 1,
                "tiers": [
                    [{"kind": "client", "title": "Monaco Shell", "sub": "Electron · editor surface"}],
                    [{"kind": "container", "title": "Agent Orchestrator", "sub": "observe → plan loops"}],
                    [
                        {"kind": "container", "title": "Approval Gate", "sub": "human-in-the-loop"},
                        {"kind": "container", "title": "Policy Engine", "sub": "prohibited-command enforcement", "leaf": True},
                    ],
                    [{"kind": "store", "title": "RAG Index", "sub": "code context", "leaf": True}],
                ],
            },
        ],
        "adrs": [
            {
                "id": "ADR-001",
                "title": "Extend Monaco, don't fork VS Code",
                "status": "Accepted",
                "date": "2025-10",
                "context": "Forks inherit a huge maintenance surface and drift from upstream fast.",
                "decision": "Build a thin Electron shell around Monaco; own only the agentic layer.",
                "tradeoff": "No VS Code extension ecosystem — every integration is deliberate.",
                "display_order": 0,
            },
            {
                "id": "ADR-002",
                "title": "Approval gate before any apply",
                "status": "Accepted",
                "date": "2025-11",
                "context": "Agent edits without review are the main trust failure in AI tooling.",
                "decision": "Every plan renders as a diff the developer must approve; prohibited commands hard-blocked.",
                "tradeoff": "Slower autonomous loops — accepted, safety is the thesis.",
                "display_order": 1,
            },
        ],
        "log": [
            {"hash": "a71b3f9", "date": "2026-06", "title": "Policy engine spike", "note": "Prohibited-command rules validated in CI.", "display_order": 0},
            {"hash": "5c09d2e", "date": "2026-04", "title": "Prototype shell boots", "note": "Monaco + Electron with agent sidebar.", "display_order": 1},
            {"hash": "d3e871c", "tag": "spec", "date": "2026-02", "title": "Requirements + C4 diagrams frozen", "display_order": 2},
            {"hash": "84f2a06", "tag": "thesis", "date": "2025-10", "title": "Proposal accepted", "display_order": 3},
        ],
        "diagrams": [
            {
                "id": "loop",
                "kind": "tiers",
                "title": "Activity — agent loop",
                "note": "the thesis loop: nothing applies without approval",
                "display_order": 0,
                "data": {
                    "tiers": [
                        [{"kind": "start", "title": "observe"}],
                        [{"kind": "step", "title": "Plan", "sub": "LLM drafts change-set"}],
                        [{"kind": "step", "title": "Policy Check", "sub": "prohibited commands"}],
                        [{"kind": "decision", "title": "human approves?"}],
                        [
                            {"kind": "step", "title": "Apply", "sub": "diff patched to workspace", "via": "yes"},
                            {"kind": "error", "title": "Discard → replan", "via": "no"},
                        ],
                        [{"kind": "end", "title": "verify"}],
                    ],
                    "notes": ["verify failures feed the next observe pass"],
                },
            },
            {
                "id": "seq-approve",
                "kind": "sequence",
                "title": "Sequence — approval gate",
                "display_order": 1,
                "data": {
                    "actors": ["Developer", "Monaco UI", "Orchestrator", "LLM", "Policy"],
                    "messages": [
                        {"from": "Developer", "to": "Monaco UI", "label": "prompt"},
                        {"from": "Monaco UI", "to": "Orchestrator", "label": "task + context"},
                        {"from": "Orchestrator", "to": "LLM", "label": "plan request"},
                        {"from": "LLM", "to": "Orchestrator", "label": "change-set", "kind": "return"},
                        {"from": "Orchestrator", "to": "Policy", "label": "validate(commands)"},
                        {"from": "Policy", "to": "Orchestrator", "label": "allow / block list", "kind": "return"},
                        {"from": "Monaco UI", "to": "Developer", "label": "diff for review", "kind": "return"},
                        {"from": "Developer", "to": "Monaco UI", "label": "approve ✓"},
                    ],
                },
            },
        ],
        "gallery": [
            {"id": "aide-shell", "src": "/projects/aide-shell.png", "caption": "fig 01 — shell prototype · plan view", "display_order": 0},
            {"id": "aide-diff", "src": "/projects/aide-diff.png", "caption": "fig 02 — approval gate · diff review", "display_order": 1},
        ],
    },
    "automated-web-crawler": {
        "impact_en": (
            "Politeness-first crawler: robots.txt hard-enforced with per-domain "
            "rate budgets; eight concurrent workers sustain an 89.9% success rate "
            "behind three-tier retries with backoff and jitter."
        ),
        "impact_tr": (
            "Nezaket-öncelikli crawler: robots.txt katı biçimde uygulanır, domain "
            "başına hız bütçesi vardır; sekiz eşzamanlı işçi, backoff+jitter'lı üç "
            "kademeli yeniden deneme ile %89,9 başarı oranını korur."
        ),
        "metrics": [
            {"value": "89.9%", "label": "success rate", "note": "across runs", "display_order": 0},
            {"value": "100%", "label": "robots.txt respect", "note": "hard-enforced", "display_order": 1},
            {"value": "×8", "label": "workers", "note": "concurrent", "display_order": 2},
            {"value": "3", "label": "retry tiers", "note": "backoff + jitter", "display_order": 3},
        ],
        "c4": [
            {
                "label": "Pipeline",
                "note": "single-layer container view — request to row",
                "display_order": 0,
                "tiers": [
                    [{"kind": "container", "title": "Scheduler", "sub": "crawl frontier · rate limits"}],
                    [{"kind": "container", "title": "Worker Pool", "sub": "Scrapy · concurrent fetch"}],
                    [{"kind": "container", "title": "Parser Pipeline", "sub": "BeautifulSoup · normalize"}],
                    [{"kind": "store", "title": "PostgreSQL", "sub": "FastAPI-served store"}],
                ],
            },
        ],
        "adrs": [
            {
                "id": "ADR-001",
                "title": "Scrapy over hand-rolled asyncio",
                "status": "Accepted",
                "date": "2024-03",
                "context": "Custom fetch loops kept reinventing throttling, dedupe, and retry logic.",
                "decision": "Adopt Scrapy's scheduler/middleware model; custom code only in pipelines.",
                "tradeoff": "Framework constraints on exotic crawl patterns.",
                "display_order": 0,
            },
            {
                "id": "ADR-002",
                "title": "Politeness budget per domain",
                "status": "Accepted",
                "date": "2024-04",
                "context": "Fault tolerance is worthless if targets block the crawler.",
                "decision": "robots.txt hard-enforced + per-domain rate budgets and backoff with jitter.",
                "tradeoff": "Slower full-corpus sweeps; success rate is the metric that matters.",
                "display_order": 1,
            },
        ],
        "log": [
            {"hash": "7e4c1aa", "date": "2024-07", "title": "89.9% success across full run", "display_order": 0},
            {"hash": "3b90f5d", "date": "2024-05", "title": "Retry tiers + fault isolation", "note": "Worker crashes no longer poison the queue.", "display_order": 1},
            {"hash": "c25a8e1", "tag": "v0.1", "date": "2024-03", "title": "Scrapy skeleton + FastAPI store", "display_order": 2},
        ],
        "diagrams": [
            {
                "id": "fetch-flow",
                "kind": "tiers",
                "title": "Flowchart — fetch decision",
                "note": "politeness first: robots gate before every fetch",
                "display_order": 0,
                "data": {
                    "tiers": [
                        [{"kind": "start", "title": "frontier pop"}],
                        [{"kind": "decision", "title": "robots.txt allows?"}],
                        [
                            {"kind": "step", "title": "Fetch", "sub": "rate budget per domain", "via": "yes"},
                            {"kind": "end", "title": "skip · log", "via": "no"},
                        ],
                        [{"kind": "decision", "title": "2xx?"}],
                        [
                            {"kind": "step", "title": "Parse", "sub": "BeautifulSoup", "via": "yes"},
                            {"kind": "error", "title": "Retry tier +1", "sub": "backoff + jitter", "via": "no"},
                        ],
                        [{"kind": "store", "title": "store row"}],
                    ],
                    "notes": ["retry tier 3 exhausted → dead-letter", "new links → dedupe → frontier"],
                },
            },
            {
                "id": "erd-crawl",
                "kind": "schema",
                "title": "ERD — crawl store",
                "display_order": 1,
                "data": {
                    "tiers": [
                        [{"name": "domain", "kind": "table", "rows": ["host · pk", "robots_cache", "rate_budget"]}],
                        [{"name": "page", "kind": "table", "rows": ["url · pk", "domain · fk", "status", "content_hash"]}],
                        [
                            {"name": "fetch_log", "kind": "table", "rows": ["id · pk", "page_url · fk", "attempt", "outcome"]},
                            {"name": "link", "kind": "table", "rows": ["src · fk", "dst · fk", "rel"]},
                        ],
                    ],
                    "relations": [
                        {"from": "domain", "label": "1:N", "to": "page"},
                        {"from": "page", "label": "1:N", "to": "fetch_log"},
                        {"from": "page", "label": "N:M", "to": "link"},
                    ],
                },
            },
        ],
        "gallery": [
            {"id": "crawler-dash", "src": "/projects/crawler-dash.png", "caption": "fig 01 — run dashboard · success curve", "display_order": 0},
            {"id": "crawler-logs", "src": "/projects/crawler-logs.png", "caption": "fig 02 — worker logs · retry cascade", "display_order": 1},
        ],
    },
    "portfolio-platform-web-desktop": {
        # Re-authored from first-party evidence; see
        # docs/superpowers/specs/2026-07-25-portfolio-platform-evidence-ledger.md.
        # Gallery paths below point to the real WebP captures in
        # frontend/public/projects/; no placeholder paths are used.
        "impact_en": (
            "This portfolio ships as two independently deployed tiers: a Next.js 16 "
            "App Router frontend on Vercel and a FastAPI backend (72 route handlers, "
            "JWT/RBAC) on Railway, each released through the provider's own GitHub "
            "integration rather than a CI-driven deploy. Public pages render "
            "server-side with ISR (revalidate) so a cold backend never blanks the "
            "site, and GitHub stats sit behind a 24h Redis cache that degrades to an "
            "in-process store when Redis is absent. Every push runs a 16-workflow CI "
            "wall — tests, OpenAPI-drift, CodeQL, dependency and supply-chain audits, "
            "and an enforced SonarCloud quality gate — followed by post-deploy smoke "
            "checks that curl the live site and exercise an admin API round-trip."
        ),
        "impact_tr": (
            "Bu portfolyo, birbirinden bağımsız dağıtılan iki katman olarak yayınlanır: "
            "Vercel üzerinde Next.js 16 App Router frontend ve Railway üzerinde FastAPI "
            "backend (72 route handler, JWT/RBAC); her biri CI güdümlü deploy yerine "
            "sağlayıcının kendi GitHub entegrasyonuyla dağıtılır. Public sayfalar ISR "
            "(revalidate) ile sunucuda render edilir, böylece soğuk backend siteyi "
            "boşaltmaz; GitHub istatistikleri, Redis yoksa süreç-içi belleğe düşen 24 "
            "saatlik Redis önbelleğinin arkasındadır. Her push, 16 workflow'luk bir CI "
            "duvarını (testler, OpenAPI-drift, CodeQL, bağımlılık ve tedarik zinciri "
            "denetimleri, zorunlu SonarCloud kalite kapısı) ve ardından canlı siteyi "
            "curl'leyip admin API round-trip'i yapan post-deploy smoke check'lerini "
            "çalıştırır."
        ),
        "metrics": [
            {"value": "72", "numeric_value": 72, "label": "API endpoints", "note": "FastAPI v1 route handlers · 12 routers", "display_order": 0},
            {"value": "24h", "numeric_value": 24, "label": "GitHub cache", "note": "Redis TTL · in-memory fallback", "display_order": 1},
            {"value": "2", "numeric_value": 2, "label": "deploy targets", "note": "Vercel FE · Railway BE (provider-native)", "display_order": 2},
            {"value": "16", "numeric_value": 16, "label": "CI/CD workflows", "note": "tests · CodeQL · audits · Sonar gate", "display_order": 3},
            {"value": "5", "numeric_value": 5, "label": "DB migrations", "note": "Alembic schema versions", "display_order": 4},
        ],
        "c4": [
            {
                "label": "Context",
                "note": "visitors, an admin, and third-party services",
                "display_order": 0,
                "tiers": [
                    [
                        {"kind": "person", "title": "Visitor", "sub": "reads the public site (EN/TR)"},
                        {"kind": "person", "title": "Admin (Yiğit)", "sub": "manages content via JWT/RBAC"},
                    ],
                    [{"kind": "system", "title": "Portfolio Platform", "sub": "public site + admin surface"}],
                    [
                        {"kind": "external", "title": "GitHub API", "sub": "repo & contribution stats", "leaf": True},
                        {"kind": "external", "title": "Supabase", "sub": "file/asset storage", "leaf": True},
                        {"kind": "external", "title": "SMTP", "sub": "contact notifications", "leaf": True},
                    ],
                ],
            },
            {
                "label": "Containers",
                "note": "two tiers, deployed independently by Vercel and Railway",
                "display_order": 1,
                "tiers": [
                    [{"kind": "client", "title": "Next.js Frontend", "sub": "Vercel · App Router · ISR"}],
                    [{"kind": "container", "title": "FastAPI Backend", "sub": "Railway · 72 endpoints · JWT/RBAC"}],
                    [
                        {"kind": "store", "title": "PostgreSQL", "sub": "content, messages & dossiers", "leaf": True},
                        {"kind": "store", "title": "Redis", "sub": "24h cache · memory fallback", "leaf": True},
                    ],
                ],
            },
        ],
        "adrs": [
            {
                "id": "ADR-001",
                "title": "Provider-native deploys over CI-driven deploys",
                "status": "Accepted",
                "date": "2026-07",
                "context": "A CI-side `vercel build --prebuilt` once raced Vercel's own integration and shipped a bundle with the localhost API fallback baked in, blanking every backend-driven section. Railway also exposes no inbound deploy hooks.",
                "decision": "Let Vercel and Railway each deploy from their own GitHub integration on push to main; CI is reduced to a quality gate plus post-deploy smoke checks, not a deployer.",
                "tradeoff": "Two dashboards and two failure domains; mitigated by independent post-deploy smoke checks (frontend curl + backend admin round-trip).",
                "display_order": 0,
            },
            {
                "id": "ADR-002",
                "title": "Redis 24h cache with in-memory fallback",
                "status": "Accepted",
                "date": "2026-07",
                "context": "GitHub rate limits made live stats flaky under traffic, and a single-replica deploy cannot assume Redis is always present.",
                "decision": "Cache GitHub responses in Redis for 24h and, on any Redis connection failure, degrade to a process-local TTL cache instead of disabling caching; serve stale data if the GitHub fetch itself errors.",
                "tradeoff": "The memory backend resets on restart/deploy; acceptable for portfolio telemetry with one replica.",
                "display_order": 1,
            },
            {
                "id": "ADR-003",
                "title": "ISR (revalidate) over no-store for public reads",
                "status": "Accepted",
                "date": "2026-07",
                "context": "Server components fetching with `no-store` aborted and blanked public pages whenever the Railway backend was cold-starting.",
                "decision": "Public server-side fetches use `next: { revalidate }` so a successful response is cached and served stale-while-revalidate; a sleeping backend no longer empties the page.",
                "tradeoff": "Public content can lag by the revalidate window; correctness of live edits is traded for resilience.",
                "display_order": 2,
            },
            {
                "id": "ADR-004",
                "title": "SonarCloud quality gate consolidated and enforced in CI",
                "status": "Accepted",
                "date": "2026-07",
                "context": "The Sonar gate previously lived in a separate, skippable workflow and could pass silently without a valid token.",
                "decision": "One CI job runs the scan with `-Dsonar.qualitygate.wait=true` and hard-fails when the token/organization is missing on trusted runs; fork and Dependabot PRs get a documented safe-skip because secrets are unavailable to them.",
                "tradeoff": "Fork PRs cannot run Sonar; covered by CodeQL, dependency, and workflow-security checks that still run.",
                "display_order": 3,
            },
        ],
        "log": [
            {"hash": "ce948d7", "date": "2026-07-25", "title": "Evidence-first dossier authoring guide", "note": "Working contract to rebuild every project dossier from first-party evidence.", "display_order": 0},
            {"hash": "21df8b1", "tag": "PR #79", "date": "2026-07-25", "title": "Public frontend performance pass", "note": "Server-rendered project index and slimmer public payloads.", "display_order": 1},
            {"hash": "3e8f028", "date": "2026-07-18", "title": "SonarCloud gate consolidated into CI", "note": "Single enforced job with qualitygate.wait=true.", "display_order": 2},
            {"hash": "707906d", "date": "2026-07-13", "title": "Project dossier API + migration", "note": "ProjectDossier aggregate exposed behind admin PUT / public GET.", "display_order": 3},
            {"hash": "905d39a", "date": "2026-04-22", "title": "Public site migrated to Next.js App Router", "display_order": 4},
            {"hash": "3d00c11", "tag": "v0.0", "date": "2025-11-02", "title": "Initial commit", "display_order": 5},
        ],
        "diagrams": [
            {
                "id": "seq-public",
                "kind": "sequence",
                "title": "Sequence — public request (ISR)",
                "note": "server components fetch with revalidate; a cold backend serves stale, not blank",
                "display_order": 0,
                "data": {
                    "actors": ["Visitor", "Next (Vercel)", "FastAPI (Railway)", "PostgreSQL"],
                    "messages": [
                        {"from": "Visitor", "to": "Next (Vercel)", "label": "GET /projects"},
                        {"from": "Next (Vercel)", "to": "Next (Vercel)", "label": "ISR cache fresh?"},
                        {"from": "Next (Vercel)", "to": "FastAPI (Railway)", "label": "miss/stale → GET /api/v1/projects"},
                        {"from": "FastAPI (Railway)", "to": "PostgreSQL", "label": "query projects"},
                        {"from": "PostgreSQL", "to": "FastAPI (Railway)", "label": "rows", "kind": "return"},
                        {"from": "FastAPI (Railway)", "to": "Next (Vercel)", "label": "200 · projects", "kind": "return"},
                        {"from": "Next (Vercel)", "to": "Visitor", "label": "SSR HTML + hydrate", "kind": "return"},
                    ],
                },
            },
            {
                "id": "seq-github",
                "kind": "sequence",
                "title": "Sequence — GitHub stats cache",
                "note": "24h Redis cache shields the rate limit; stale served on fetch error",
                "display_order": 1,
                "data": {
                    "actors": ["Visitor", "Next", "FastAPI", "Redis", "GitHub API"],
                    "messages": [
                        {"from": "Visitor", "to": "Next", "label": "view Command Center"},
                        {"from": "Next", "to": "FastAPI", "label": "GET /api/v1/github/stats"},
                        {"from": "FastAPI", "to": "Redis", "label": "get github_stats"},
                        {"from": "Redis", "to": "FastAPI", "label": "hit (≤24h) → stats", "kind": "return"},
                        {"from": "FastAPI", "to": "GitHub API", "label": "miss → GraphQL fetch"},
                        {"from": "GitHub API", "to": "FastAPI", "label": "aggregate stats", "kind": "return"},
                        {"from": "FastAPI", "to": "Redis", "label": "setex 24h"},
                        {"from": "FastAPI", "to": "Next", "label": "200 · stats", "kind": "return"},
                    ],
                },
            },
            {
                "id": "authz",
                "kind": "matrix",
                "title": "Authorization Matrix",
                "note": "JWT/RBAC — require_admin on every mutating route",
                "display_order": 2,
                "data": {
                    "cols": ["visitor", "admin"],
                    "rows": [
                        {"label": "view site, projects & dossiers", "cells": ["✓", "✓"]},
                        {"label": "send contact message", "cells": ["✓", "✓"]},
                        {"label": "CRUD projects / skills / blog", "cells": ["—", "✓"]},
                        {"label": "PUT / DELETE project dossier", "cells": ["—", "✓"]},
                        {"label": "read messages inbox", "cells": ["—", "✓"]},
                        {"label": "upload assets (Supabase)", "cells": ["—", "✓"]},
                        {"label": "view admin stats & audit log", "cells": ["—", "✓"]},
                    ],
                },
            },
            {
                "id": "cicd-pf",
                "kind": "tiers",
                "title": "CI/CD — gate + provider deploys",
                "note": "CI is the quality gate and smoke checker, not the deployer",
                "display_order": 3,
                "data": {
                    "tiers": [
                        [{"kind": "start", "title": "push → main"}],
                        [{"kind": "step", "title": "CI quality wall", "sub": "flake8 · pytest · OpenAPI-drift · type-check · builds"}],
                        [{"kind": "decision", "title": "SonarCloud gate?", "sub": "qualitygate.wait=true"}],
                        [
                            {"kind": "step", "title": "Providers deploy", "sub": "Vercel + Railway native integrations", "via": "pass"},
                            {"kind": "error", "title": "blocked", "sub": "gate fails · PR annotated", "via": "fail"},
                        ],
                        [{"kind": "step", "title": "Railway release", "sub": "alembic upgrade head → uvicorn"}],
                        [{"kind": "step", "title": "Post-deploy smoke", "sub": "FE curl · BE admin login → /admin/stats"}],
                        [{"kind": "end", "title": "live"}],
                    ],
                    "notes": ["Vercel/Railway deploy on push independently of CI; the gate and smoke checks run alongside, not as a deploy step."],
                },
            },
            {
                "id": "flow-dossier",
                "kind": "tiers",
                "title": "Flow — dossier render",
                "note": "project selection → dossier API → renderer → gallery",
                "display_order": 4,
                "data": {
                    "tiers": [
                        [{"kind": "start", "title": "select project", "sub": "ProjectIndex"}],
                        [{"kind": "step", "title": "GET /dossiers/{slug}", "sub": "on-demand · cache 60s SWR 300s"}],
                        [{"kind": "decision", "title": "dossier found?"}],
                        [
                            {"kind": "step", "title": "map + synthesize C4", "sub": "toProjectDetail prepends c4 chip", "via": "200"},
                            {"kind": "error", "title": "dossier unavailable", "sub": "retry button", "via": "404 / error"},
                        ],
                        [{"kind": "step", "title": "render tabs", "sub": "overview · arch · adr · log · gallery"}],
                        [{"kind": "end", "title": "DiagramGallery + gallery"}],
                    ],
                    "notes": ["arch tab shows the synthesized C4 chip plus every diagram; gallery figures read /public/projects paths"],
                },
            },
            {
                "id": "erd",
                "kind": "schema",
                "title": "ERD — dossier data model",
                "note": "one dossier per project; children cascade on delete",
                "display_order": 5,
                "data": {
                    "tiers": [
                        [{"name": "projects", "kind": "table", "rows": ["id · pk", "slug · uniq", "title", "featured"]}],
                        [{"name": "project_dossiers", "kind": "table", "rows": ["id · pk", "project_id · fk · uniq", "impact_en", "impact_tr"]}],
                        [
                            {"name": "dossier_metrics", "kind": "table", "rows": ["value", "numeric_value", "label", "display_order"]},
                            {"name": "dossier_c4_levels", "kind": "table", "rows": ["label", "note", "display_order"]},
                            {"name": "dossier_adrs", "kind": "table", "rows": ["identifier", "status", "context", "decision"]},
                        ],
                        [
                            {"name": "dossier_c4_nodes", "kind": "table", "rows": ["level_id · fk", "kind", "title", "tier_order"]},
                            {"name": "dossier_log_entries", "kind": "table", "rows": ["commit_hash", "tag", "date", "title"]},
                            {"name": "dossier_diagrams", "kind": "table", "rows": ["identifier", "kind", "data · JSON"]},
                            {"name": "dossier_gallery_items", "kind": "table", "rows": ["identifier", "source_url", "caption"]},
                        ],
                    ],
                    "relations": [
                        {"from": "projects", "label": "1:1", "to": "project_dossiers"},
                        {"from": "project_dossiers", "label": "1:N", "to": "dossier_metrics"},
                        {"from": "project_dossiers", "label": "1:N", "to": "dossier_c4_levels"},
                        {"from": "dossier_c4_levels", "label": "1:N", "to": "dossier_c4_nodes"},
                        {"from": "project_dossiers", "label": "1:N", "to": "dossier_adrs"},
                        {"from": "project_dossiers", "label": "1:N", "to": "dossier_diagrams"},
                        {"from": "project_dossiers", "label": "1:N", "to": "dossier_gallery_items"},
                    ],
                },
            },
        ],
        "gallery": [
            {"id": "pf-home", "src": "/projects/portfolio-platform-web-desktop-home.webp", "caption": "fig 01 — public home · server-rendered system profile & command center", "display_order": 0},
            {"id": "pf-projects", "src": "/projects/portfolio-platform-web-desktop-projects.webp", "caption": "fig 02 — project index · each entry opens a full dossier", "display_order": 1},
            {"id": "pf-dossier-arch", "src": "/projects/portfolio-platform-web-desktop-dossier-arch.webp", "caption": "fig 03 — dossier · interactive C4 (context → containers)", "display_order": 2},
            {"id": "pf-dossier-cicd", "src": "/projects/portfolio-platform-web-desktop-dossier-cicd.webp", "caption": "fig 04 — dossier · CI/CD gate + provider-native deploys", "display_order": 3},
            {"id": "pf-admin-dossier", "src": "/projects/portfolio-platform-web-desktop-admin-dossier.webp", "caption": "fig 05 — admin dossier editor · JWT/RBAC PUT round-trip", "display_order": 4},
            {"id": "pf-home-mobile", "src": "/projects/portfolio-platform-web-desktop-home-mobile.webp", "caption": "fig 06 — responsive mobile layout (390px)", "display_order": 5},
        ],
    },
}

# Keep only the first-party portfolio payload from the historical literal.
# Other entries are either loaded from research evidence or intentionally
# omitted until their source and visual clearance are supplied.
DOSSIER_CONTENT: dict[str, dict] = {
    "portfolio-platform-web-desktop": _LEGACY_DOSSIER_CONTENT[
        "portfolio-platform-web-desktop"
    ],
}


def _load_external_dossier_payloads() -> None:
    payload_path = Path(__file__).resolve().parent / "dossier_payloads" / "isikschedule-platform.json"
    DOSSIER_CONTENT["isikschedule-platform"] = json.loads(
        payload_path.read_text(encoding="utf-8")
    )


_load_external_dossier_payloads()

# These two records have no source repository, technical archive, or approved
# visual evidence in the audited workspaces. Keep the project cards visible,
# but do not publish the old marketing dossier as if it described a verified
# implementation. A pending-source report lives under docs/dossiers/.
for _pending_slug in (
    "teknofest-sarkan-uav-defense-platform",
    "automated-web-crawler",
):
    DOSSIER_CONTENT.pop(_pending_slug, None)

# Agentic-Ide is a real repository, but it is currently a planning/readiness
# project. Its dossier describes accepted design decisions and repository
# evidence; it does not present the proposed Electron application as shipped.
DOSSIER_CONTENT["agentic-ide-thesis-project"] = {
    "impact_en": (
        "Agentic IDE is a safety-oriented graduation-thesis repository, not a shipped IDE. "
        "It turns the problem of unsafe, opaque multi-file AI edits into a measurable plan-first "
        "workflow: a single agent observes context, proposes a change, passes policy checks, "
        "waits for human approval, and only then writes within a workspace boundary. The repository "
        "supports this direction with 9 ADRs, 57 non-epic backlog issues, 5 MVP scenarios, and a "
        "planned 20-task evaluation target; implementation results are not claimed yet."
    ),
    "impact_tr": (
        "Agentic IDE, dağıtılmış bir IDE değil; güvenlik odaklı bitirme tezi planlama reposudur. "
        "Güvensiz ve opak çok dosyalı AI değişikliklerini ölçülebilir bir plan-önce akışına dönüştürür: "
        "tek ajan bağlamı gözlemler, değişiklik önerir, politika kontrollerinden geçer, insan onayı bekler "
        "ve ancak bundan sonra workspace sınırları içinde yazar. Repo bu yönü 9 ADR, 57 epic dışı backlog "
        "issue'su, 5 MVP senaryosu ve planlanan 20 görevlik değerlendirme hedefiyle destekliyor; henüz "
        "uygulama sonucu iddia edilmiyor."
    ),
    "metrics": [
        {"value": "9", "numeric_value": 9, "label": "accepted ADRs", "note": "docs/adr/ADR-001..009; planning evidence, not runtime features", "display_order": 0},
        {"value": "57", "numeric_value": 57, "label": "non-epic backlog issues", "note": "github-projects/requirements-analysis.json; 69 total items including 12 epics", "display_order": 1},
        {"value": "5", "numeric_value": 5, "label": "MVP scenarios", "note": "PRODUCT_PLAN.md; planned evaluation surface", "display_order": 2},
        {"value": "20", "numeric_value": 20, "label": "benchmark target", "note": "planned task set in PRODUCT_PLAN.md and EVALUATION_PLAN.md; not yet executed", "display_order": 3},
    ],
    "c4": [
        {
            "label": "Context",
            "note": "Repository-defined thesis scope; no production implementation is present.",
            "display_order": 0,
            "tiers": [
                [{"kind": "person", "title": "Developer", "sub": "requests, reviews, approves or rejects changes"}],
                [{"kind": "system", "title": "Agentic IDE thesis artifact", "sub": "planned safety-oriented coding workflow"}],
                [
                    {"kind": "external", "title": "Local workspace", "sub": "files and project context inside a bounded directory", "leaf": True},
                    {"kind": "external", "title": "Local model path", "sub": "Ollama-compatible provider boundary", "leaf": True},
                    {"kind": "external", "title": "Cloud model path", "sub": "Anthropic-compatible provider boundary", "leaf": True},
                ],
            ],
        },
        {
            "label": "Planned MVP containers",
            "note": "Architecture recorded in ADRs and system plans; these are design boundaries, not shipped services.",
            "display_order": 1,
            "tiers": [
                [{"kind": "client", "title": "Electron + Monaco shell", "sub": "editor and diff surface; ADR-001"}],
                [{"kind": "container", "title": "Single-agent orchestrator", "sub": "observe → plan → approval-gated apply"}],
                [
                    {"kind": "component", "title": "Context and retrieval", "sub": "layered retrieval with SQLite + sqlite-vec candidate"},
                    {"kind": "component", "title": "Model provider boundary", "sub": "manual local/cloud selection; ADR-004/005"},
                ],
                [
                    {"kind": "component", "title": "Safety and write boundary", "sub": "path normalization, protected files, approval, rollback"},
                    {"kind": "store", "title": "Audit and benchmark artifacts", "sub": "versioned evidence contracts; planned persistence", "leaf": True},
                ],
            ],
        },
    ],
    "adrs": [
        {
            "id": "ADR-001",
            "title": "Electron + Monaco editor shell",
            "status": "Accepted",
            "date": "2026-05-01",
            "context": "The thesis needs a desktop coding surface with local file access, diff review, and a TypeScript ecosystem without inheriting the full VS Code maintenance surface.",
            "decision": "Use Electron with Monaco Editor for the MVP shell; keep the application structure minimal until implementation and evaluation begin.",
            "tradeoff": "Higher memory and bundle cost than Tauri or a browser app; renderer/main-process security boundaries become a first-class risk.",
            "display_order": 0,
        },
        {
            "id": "ADR-003",
            "title": "Local retrieval storage",
            "status": "Accepted",
            "date": "2026-05-01",
            "context": "Codebase Q&A and evidence-backed planning need local-first storage without requiring a hosted vector database.",
            "decision": "Use SQLite for local metadata and keep sqlite-vec behind a small ContextStore-style adapter candidate.",
            "tradeoff": "Portable privacy boundary is gained, but sqlite-vec maturity and multilingual retrieval remain implementation risks.",
            "display_order": 1,
        },
        {
            "id": "ADR-004",
            "title": "Manual model selection for MVP",
            "status": "Accepted",
            "date": "2026-05-01",
            "context": "Automatic routing would add another evaluation variable and could surprise users by changing privacy, cost, or latency characteristics.",
            "decision": "Let the user choose local-only, manual hybrid, or cloud-only behavior; do not add an opaque automatic router to the MVP.",
            "tradeoff": "The user carries provider-selection friction, while benchmark runs remain explainable and comparable.",
            "display_order": 2,
        },
        {
            "id": "ADR-006",
            "title": "No shell execution in the MVP",
            "status": "Accepted",
            "date": "2026-05-01",
            "context": "Terminal and arbitrary process execution would expand the safety problem beyond the thesis variable of controlled, approval-gated file changes.",
            "decision": "Limit the MVP tool surface to controlled reads, retrieval, diff generation, approval-gated writes, rollback, and explanation.",
            "tradeoff": "The agent cannot run tests or package commands automatically; a future command runner needs its own ADR and threat model.",
            "display_order": 3,
        },
    ],
    "log": [
        {"hash": "caa3376", "date": "2026-05-02", "title": "Thesis backlog governance automation", "note": "Added validation and setup automation around the requirements project seed.", "display_order": 0},
        {"hash": "da4af95", "date": "2026-05-01", "title": "Readiness validation and VDD planning", "note": "Added implementation-readiness gates, ADRs, schemas, and verification-driven planning.", "display_order": 1},
        {"hash": "cbe238d", "date": "2026-04-27", "title": "Repository governance and project seed", "note": "Introduced the structured GitHub Project requirements seed and repository automation.", "display_order": 2},
        {"hash": "ac75994", "date": "2026-03-10", "title": "Product and system planning completed", "note": "Established the research question, MVP boundary, agent loop, safety model, and evaluation plan.", "display_order": 3},
        {"hash": "e6da815", "date": "2026-01-02", "title": "Initial thesis architecture and roadmap", "note": "First repository milestone; no application implementation is claimed.", "display_order": 4},
    ],
    "diagrams": [
        {
            "id": "agent-loop",
            "kind": "tiers",
            "title": "Planned flow — observe to verify",
            "note": "Design contract from SYSTEM_PLAN.md; not an executed runtime trace.",
            "display_order": 0,
            "data": {
                "tiers": [
                    [{"kind": "start", "title": "user request"}],
                    [{"kind": "step", "title": "Observe", "sub": "active file + layered retrieval"}],
                    [{"kind": "step", "title": "Plan", "sub": "files, edits, order, risks"}],
                    [{"kind": "decision", "title": "policy check passes?"}],
                    [{"kind": "step", "title": "Request approval", "sub": "diff and rationale", "via": "yes"}, {"kind": "error", "title": "Block or replan", "via": "no"}],
                    [{"kind": "decision", "title": "developer approves?"}],
                    [{"kind": "step", "title": "Atomic apply", "sub": "workspace write boundary", "via": "yes"}, {"kind": "error", "title": "Discard", "via": "no"}],
                    [{"kind": "end", "title": "verify + audit"}],
                ],
                "notes": ["Rollback is an explicit MVP requirement; shell execution is explicitly out of scope."],
            },
        },
        {
            "id": "approval-sequence",
            "kind": "sequence",
            "title": "Planned sequence — approval gate",
            "note": "Proposed interaction boundary recorded by the repository ADRs.",
            "display_order": 1,
            "data": {
                "actors": ["Developer", "Monaco UI", "Orchestrator", "Model provider", "Safety policy", "Workspace"],
                "messages": [
                    {"from": "Developer", "to": "Monaco UI", "label": "prompt + active context"},
                    {"from": "Monaco UI", "to": "Orchestrator", "label": "start run"},
                    {"from": "Orchestrator", "to": "Model provider", "label": "request plan"},
                    {"from": "Model provider", "to": "Orchestrator", "label": "plan + change-set", "kind": "return"},
                    {"from": "Orchestrator", "to": "Safety policy", "label": "validate paths, secrets, protected files"},
                    {"from": "Safety policy", "to": "Orchestrator", "label": "allow / warning / block", "kind": "return"},
                    {"from": "Orchestrator", "to": "Monaco UI", "label": "render diff for approval", "kind": "return"},
                    {"from": "Developer", "to": "Monaco UI", "label": "approve or reject"},
                    {"from": "Monaco UI", "to": "Workspace", "label": "atomic write only after approval"},
                ],
            },
        },
        {
            "id": "safety-matrix",
            "kind": "matrix",
            "title": "MVP safety boundary",
            "note": "Repository decision surface; no shell/process executor is implemented.",
            "display_order": 2,
            "data": {
                "cols": ["MVP policy", "Evidence state"],
                "rows": [
                    {"label": "Read files inside workspace", "cells": ["allowed", "planned requirement"]},
                    {"label": "Generate retrieval context and diff", "cells": ["allowed", "planned requirement"]},
                    {"label": "Write files before human approval", "cells": ["blocked", "accepted ADR-006 boundary"]},
                    {"label": "Shell / exec / package install", "cells": ["out of scope", "accepted ADR-006"]},
                    {"label": "Rollback applied change-set", "cells": ["required", "planned evaluation evidence"]},
                ],
            },
        },
        {
            "id": "design-contracts",
            "kind": "schema",
            "title": "Design contracts — evidence chain",
            "note": "JSON schemas exist in the repository; runtime persistence is not implemented.",
            "display_order": 3,
            "data": {
                "tiers": [
                    [{"name": "Requirement", "kind": "table", "rows": ["source", "acceptance criteria", "risk"]}],
                    [{"name": "Plan", "kind": "table", "rows": ["context", "files", "proposed actions"]}, {"name": "ChangeSet", "kind": "table", "rows": ["diff", "affected paths", "policy result"]}],
                    [{"name": "Approval", "kind": "table", "rows": ["decision", "timestamp", "selected changes"]}, {"name": "AuditEvent", "kind": "table", "rows": ["event", "run id", "policy version"]}],
                    [{"name": "BenchmarkRun", "kind": "table", "rows": ["condition", "task id", "evidence", "outcome"]}],
                ],
                "relations": [
                    {"from": "Requirement", "label": "1:N", "to": "Plan"},
                    {"from": "Plan", "label": "1:1", "to": "ChangeSet"},
                    {"from": "ChangeSet", "label": "1:1", "to": "Approval"},
                    {"from": "Approval", "label": "1:N", "to": "AuditEvent"},
                    {"from": "AuditEvent", "label": "N:1", "to": "BenchmarkRun"},
                ],
            },
        },
        {
            "id": "readiness-flow",
            "kind": "tiers",
            "title": "Readiness flow — planning to implementation",
            "note": "Current repository state stops before the application scaffold.",
            "display_order": 4,
            "data": {
                "tiers": [
                    [{"kind": "start", "title": "research scope"}],
                    [{"kind": "step", "title": "ADR + threat model"}],
                    [{"kind": "step", "title": "schemas + validation CI"}],
                    [{"kind": "decision", "title": "advisor/readiness gate?"}],
                    [{"kind": "step", "title": "Electron scaffold", "via": "pass"}, {"kind": "error", "title": "revise plan", "via": "fail"}],
                    [{"kind": "end", "title": "MVP implementation queue"}],
                ],
                "notes": ["Current HEAD contains the planning and governance phases; no TypeScript application files are present."],
            },
        },
    ],
    "gallery": [],
}

# The diagram data union discriminates on `kind`, which must match the outer
# diagram kind; inject it once here instead of repeating it in every literal.
for _content in DOSSIER_CONTENT.values():
    for _diagram in _content["diagrams"]:
        _diagram["data"].setdefault("kind", _diagram["kind"])


def seed_dossiers(db: Session, force: bool = False) -> None:
    """Upsert the recovered dossier content for every known project slug."""
    for slug, content in DOSSIER_CONTENT.items():
        project = db.query(Project).filter(Project.slug == slug).first()
        if project is None:
            print(f"  ! {slug}: project not found, skipped")
            continue
        if not force and get_dossier_by_project_id(db, project.id) is not None:
            print(f"  = {slug}: dossier exists, skipped (use --force to overwrite)")
            continue
        payload = ProjectDossierUpsert.model_validate(content)
        upsert_dossier(db, project.id, payload)
        print(f"  + {slug}: dossier seeded")


def main() -> None:
    force = "--force" in sys.argv[1:]
    db = SessionLocal()
    try:
        print(f"Seeding project dossiers (force={force})...")
        seed_dossiers(db, force=force)
        print("Done.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
