"""
Seed project dossiers (C4 / ADR / log / diagrams / gallery).

Content recovered from the YO.sys design port that used to live in
frontend/src/content/projectDetails.ts (removed in ba357e3 when dossiers
moved behind the API). Loads through crud.dossier.upsert_dossier, so it is
idempotent per project; existing dossiers are skipped unless --force.

Usage (inside the backend container or with DATABASE_URL exported):
    python seed_dossiers.py           # seed projects that have no dossier yet
    python seed_dossiers.py --force   # overwrite existing dossiers too

Gallery images are referenced as /projects/*.png and must exist in
frontend/public/projects/ to render; missing files only affect the gallery.
"""

import sys

from sqlalchemy.orm import Session

from app.crud.dossier import get_dossier_by_project_id, upsert_dossier
from app.database import SessionLocal
from app.models.project import Project
from app.schemas.dossier import ProjectDossierUpsert

DOSSIER_CONTENT: dict[str, dict] = {
    "isikschedule-platform": {
        "impact_en": (
            "Dual-platform scheduling system with a shared solver core: 13 "
            "optimization algorithms serve ~1,000 desktop users and a JWT/RBAC "
            "web release, running as six Dockerized services."
        ),
        "impact_tr": (
            "Ortak çözücü çekirdekli çift platformlu ders programı sistemi: 13 "
            "optimizasyon algoritması ~1.000 masaüstü kullanıcısına ve JWT/RBAC "
            "korumalı web sürümüne hizmet ediyor; altı Docker servisi olarak çalışıyor."
        ),
        "metrics": [
            {"value": "86.97%", "label": "coverage", "note": "SonarQube gate", "display_order": 0},
            {"value": "13", "label": "algorithms", "note": "registered solvers", "display_order": 1},
            {"value": "~1,000", "label": "active users", "note": "desktop release", "display_order": 2},
            {"value": "6", "label": "services", "note": "Dockerized runtime", "display_order": 3},
        ],
        "c4": [
            {
                "label": "Context",
                "note": "who touches the system, and what it talks to",
                "display_order": 0,
                "tiers": [
                    [
                        {"kind": "person", "title": "Student", "sub": "builds a conflict-free timetable"},
                        {"kind": "person", "title": "Dept. Coordinator", "sub": "curates course data"},
                    ],
                    [{"kind": "system", "title": "IsikSchedule", "sub": "scheduling platform · desktop + web"}],
                    [
                        {"kind": "external", "title": "University SIS", "sub": "course & section source", "leaf": True},
                        {"kind": "external", "title": "SMTP", "sub": "notifications", "leaf": True},
                    ],
                ],
            },
            {
                "label": "Containers",
                "note": "deployable units inside the platform",
                "display_order": 1,
                "tiers": [
                    [
                        {"kind": "client", "title": "Desktop", "sub": "PyQt6 · ~1,000 users"},
                        {"kind": "client", "title": "Web", "sub": "Next.js · JWT"},
                    ],
                    [{"kind": "container", "title": "FastAPI Gateway", "sub": "REST · JWT / RBAC"}],
                    [
                        {"kind": "container", "title": "Scheduling Engine", "sub": "13 algorithms"},
                        {"kind": "container", "title": "Celery Workers", "sub": "async solves", "leaf": True},
                    ],
                    [
                        {"kind": "store", "title": "PostgreSQL", "sub": "primary store", "leaf": True},
                        {"kind": "store", "title": "Redis", "sub": "cache · broker", "leaf": True},
                    ],
                ],
            },
            {
                "label": "Components",
                "note": "inside the scheduling engine",
                "display_order": 2,
                "tiers": [
                    [{"kind": "component", "title": "Algorithm Registry", "sub": "one interface · 13 solvers"}],
                    [
                        {"kind": "component", "title": "Constraint Solver", "sub": "hard/soft constraint passes"},
                        {"kind": "component", "title": "Conflict Validator", "sub": "overlap & capacity checks"},
                    ],
                    [
                        {"kind": "component", "title": "Timetable Builder", "sub": "assembles the final schedule"},
                        {"kind": "component", "title": "Persistence Adapter", "sub": "results → PostgreSQL"},
                    ],
                ],
            },
        ],
        "adrs": [
            {
                "id": "ADR-001",
                "title": "One scheduling core, two clients",
                "status": "Accepted",
                "date": "2024-11",
                "context": "Desktop (PyQt6) shipped first; a web product was planned without doubling maintenance.",
                "decision": "Extract the engine into a shared package both clients consume — the same 13 algorithms everywhere.",
                "tradeoff": "Stricter interface discipline; engine changes now version against two release trains.",
                "display_order": 0,
            },
            {
                "id": "ADR-002",
                "title": "Celery + Redis for long-running solves",
                "status": "Accepted",
                "date": "2025-03",
                "context": "Large solves can take minutes; running them inside FastAPI request workers starved the API.",
                "decision": "Queue solves through Celery with Redis as broker; the API returns a job handle and clients poll.",
                "tradeoff": "More moving parts in Docker Compose; retries had to be made idempotent.",
                "display_order": 1,
            },
            {
                "id": "ADR-003",
                "title": "JWT/RBAC from day one on web",
                "status": "Accepted",
                "date": "2025-06",
                "context": "The web release adds multi-user semantics the single-user desktop never had.",
                "decision": "Role-based access enforced at the gateway; stateless tokens instead of server sessions.",
                "tradeoff": "Token invalidation handled via short expiry + refresh flow.",
                "display_order": 2,
            },
        ],
        "log": [
            {"hash": "e41c7a2", "tag": "v1.0", "date": "2026-05", "title": "Dockerized multi-service release", "note": "PostgreSQL, Redis, Celery, API, web — one compose up.", "display_order": 0},
            {"hash": "b93f0d8", "tag": "v0.9", "date": "2026-01", "title": "Web beta behind JWT/RBAC", "display_order": 1},
            {"hash": "7d20c4e", "tag": "v0.6", "date": "2025-08", "title": "Algorithm registry lands", "note": "13 solvers behind one interface; coverage pushed to 86.97%.", "display_order": 2},
            {"hash": "31a9be5", "tag": "v0.1", "date": "2024-10", "title": "PyQt6 desktop prototype", "note": "First conflict-free timetable generated end-to-end.", "display_order": 3},
        ],
        "diagrams": [
            {
                "id": "class",
                "kind": "schema",
                "title": "Class — solver core",
                "note": "UML class view · 13 algorithms share one base",
                "display_order": 0,
                "data": {
                    "tiers": [
                        [{"name": "SolverBase", "kind": "abstract", "rows": ["+ solve(sections): Timetable", "+ score(t): float", "# constraints: Constraint[]"]}],
                        [
                            {"name": "GeneticSolver", "kind": "class", "rows": ["population: 200", "mutate(rate = 0.02)"]},
                            {"name": "BacktrackingSolver", "kind": "class", "rows": ["prune(branch): bool"]},
                            {"name": "…11 more", "kind": "class", "rows": ["via AlgorithmRegistry"]},
                        ],
                        [
                            {"name": "Constraint", "kind": "interface", "rows": ["+ check(assign): bool", "hard: bool"]},
                            {"name": "Timetable", "kind": "class", "rows": ["slots: Slot[]", "+ conflicts(): Conflict[]"]},
                        ],
                    ],
                    "relations": [
                        {"from": "GeneticSolver", "label": "extends", "to": "SolverBase"},
                        {"from": "SolverBase", "label": "uses 1..*", "to": "Constraint"},
                        {"from": "SolverBase", "label": "produces", "to": "Timetable"},
                    ],
                },
            },
            {
                "id": "erd",
                "kind": "schema",
                "title": "ERD — scheduling data",
                "note": "core relational model (PostgreSQL)",
                "display_order": 1,
                "data": {
                    "tiers": [
                        [
                            {"name": "course", "kind": "table", "rows": ["code · pk", "title", "credits"]},
                            {"name": "room", "kind": "table", "rows": ["id · pk", "capacity", "building"]},
                        ],
                        [
                            {"name": "section", "kind": "table", "rows": ["id · pk", "course_code · fk", "instructor", "capacity"]},
                            {"name": "time_slot", "kind": "table", "rows": ["id · pk", "day", "start · end"]},
                        ],
                        [
                            {"name": "schedule", "kind": "table", "rows": ["id · pk", "user_id · fk", "algorithm", "score"]},
                            {"name": "schedule_item", "kind": "table", "rows": ["schedule_id · fk", "section_id · fk", "room_id · fk", "slot_id · fk"]},
                        ],
                    ],
                    "relations": [
                        {"from": "course", "label": "1:N", "to": "section"},
                        {"from": "schedule", "label": "1:N", "to": "schedule_item"},
                        {"from": "section", "label": "N:M via items", "to": "time_slot"},
                    ],
                },
            },
            {
                "id": "seq-solve",
                "kind": "sequence",
                "title": "Sequence — solve request",
                "note": "async job flow · the API never blocks on a solve",
                "display_order": 2,
                "data": {
                    "actors": ["Web", "API", "Redis", "Worker", "Engine", "PostgreSQL"],
                    "messages": [
                        {"from": "Web", "to": "API", "label": "POST /solve"},
                        {"from": "API", "to": "Redis", "label": "enqueue(job)"},
                        {"from": "API", "to": "Web", "label": "202 · job_id", "kind": "return"},
                        {"from": "Worker", "to": "Redis", "label": "dequeue"},
                        {"from": "Worker", "to": "Engine", "label": "run(algorithm)"},
                        {"from": "Engine", "to": "Engine", "label": "constraint passes ×N"},
                        {"from": "Engine", "to": "PostgreSQL", "label": "persist(timetable)"},
                        {"from": "Web", "to": "API", "label": "GET /jobs/:id · poll"},
                        {"from": "API", "to": "Web", "label": "200 · timetable", "kind": "return"},
                    ],
                },
            },
            {
                "id": "auth",
                "kind": "tiers",
                "title": "Flow — JWT auth",
                "note": "login → token → role-gated resources",
                "display_order": 3,
                "data": {
                    "tiers": [
                        [{"kind": "start", "title": "login"}],
                        [{"kind": "step", "title": "Credential Check", "sub": "hash verify"}],
                        [{"kind": "decision", "title": "valid?"}],
                        [
                            {"kind": "step", "title": "Issue JWT", "sub": "role claims · short expiry", "via": "yes"},
                            {"kind": "error", "title": "401 Unauthorized", "sub": "rate-limited retry", "via": "no"},
                        ],
                        [{"kind": "step", "title": "Gateway RBAC", "sub": "role ⊇ route scope"}],
                        [{"kind": "end", "title": "resource"}],
                    ],
                    "notes": ["expired token → POST /refresh → new JWT", "role mismatch → 403 · logged"],
                },
            },
            {
                "id": "job-state",
                "kind": "tiers",
                "title": "State — solve job",
                "note": "lifecycle of one scheduling job",
                "display_order": 4,
                "data": {
                    "tiers": [
                        [{"kind": "state", "title": "queued"}],
                        [{"kind": "state", "title": "running", "sub": "worker locked"}],
                        [{"kind": "state", "title": "validating", "sub": "conflict checks"}],
                        [
                            {"kind": "final", "title": "done", "via": "ok"},
                            {"kind": "error", "title": "failed", "via": "error"},
                        ],
                    ],
                    "notes": ["failed → retry ×3 (backoff) → queued", "cancel → aborted, from any state"],
                },
            },
            {
                "id": "cicd",
                "kind": "tiers",
                "title": "CI/CD Pipeline",
                "note": "every push walks the full gate",
                "display_order": 5,
                "data": {
                    "tiers": [
                        [{"kind": "start", "title": "git push"}],
                        [{"kind": "step", "title": "pytest", "sub": "86.97% coverage floor"}],
                        [{"kind": "decision", "title": "quality gate?", "sub": "SonarQube"}],
                        [
                            {"kind": "step", "title": "docker build", "sub": "6 images", "via": "pass"},
                            {"kind": "error", "title": "blocked", "sub": "PR annotated", "via": "fail"},
                        ],
                        [{"kind": "end", "title": "compose deploy"}],
                    ],
                },
            },
        ],
        "gallery": [
            {"id": "isik-desktop", "src": "/projects/isik-desktop.png", "caption": "fig 01 — desktop client · timetable view", "display_order": 0},
            {"id": "isik-web", "src": "/projects/isik-web.png", "caption": "fig 02 — web client · solver run", "display_order": 1},
            {"id": "isik-gate", "src": "/projects/isik-gate.png", "caption": "fig 03 — SonarQube quality gate", "display_order": 2},
        ],
    },
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
        "impact_en": (
            "This site: 60+ FastAPI endpoints behind JWT/RBAC, a Next.js frontend, "
            "staged Vercel + Railway deploys, a SonarQube quality gate, and a 24h "
            "GitHub cache shielding rate limits."
        ),
        "impact_tr": (
            "Bu site: JWT/RBAC arkasında 60+ FastAPI endpoint'i, Next.js frontend, "
            "kademeli Vercel + Railway dağıtımları, SonarQube kalite kapısı ve hız "
            "limitlerini koruyan 24 saatlik GitHub önbelleği."
        ),
        "metrics": [
            {"value": "60+", "label": "API endpoints", "note": "FastAPI backend", "display_order": 0},
            {"value": "24h", "label": "GitHub cache", "note": "rate-limit shield", "display_order": 1},
            {"value": "2", "label": "deploy targets", "note": "Vercel + Railway", "display_order": 2},
            {"value": "Passed", "label": "quality gate", "note": "SonarQube Cloud", "display_order": 3},
        ],
        "c4": [
            {
                "label": "Context",
                "note": "visitors, an admin, and third-party services",
                "display_order": 0,
                "tiers": [
                    [
                        {"kind": "person", "title": "Visitor", "sub": "reads the public site"},
                        {"kind": "person", "title": "Admin (Yiğit)", "sub": "manages content"},
                    ],
                    [{"kind": "system", "title": "Portfolio Platform", "sub": "public site + admin surface"}],
                    [
                        {"kind": "external", "title": "GitHub API", "sub": "repo & activity data", "leaf": True},
                        {"kind": "external", "title": "Supabase", "sub": "asset storage", "leaf": True},
                        {"kind": "external", "title": "SMTP", "sub": "contact notifications", "leaf": True},
                    ],
                ],
            },
            {
                "label": "Containers",
                "note": "staged deploys — frontend and backend ship separately",
                "display_order": 1,
                "tiers": [
                    [{"kind": "client", "title": "Next.js Frontend", "sub": "Vercel · EN/TR"}],
                    [{"kind": "container", "title": "FastAPI Backend", "sub": "Railway · 60+ endpoints · JWT/RBAC"}],
                    [
                        {"kind": "store", "title": "PostgreSQL", "sub": "content & messages", "leaf": True},
                        {"kind": "store", "title": "Redis", "sub": "24h GitHub cache", "leaf": True},
                    ],
                ],
            },
        ],
        "adrs": [
            {
                "id": "ADR-001",
                "title": "Staged deploys: Vercel FE / Railway BE",
                "status": "Accepted",
                "date": "2025-09",
                "context": "One platform for both tiers forced compromises on build tooling and pricing.",
                "decision": "Frontend on Vercel, backend + Postgres + Redis on Railway, wired by CI/CD stages.",
                "tradeoff": "Two dashboards, two failure domains — mitigated with health checks.",
                "display_order": 0,
            },
            {
                "id": "ADR-002",
                "title": "24h GitHub cache over live calls",
                "status": "Accepted",
                "date": "2025-11",
                "context": "GitHub rate limits made live stats flaky exactly when traffic spiked.",
                "decision": "Cache GitHub responses in Redis for 24h; degrade to cached data on API failure.",
                "tradeoff": "Stats can lag a day — acceptable for portfolio telemetry.",
                "display_order": 1,
            },
        ],
        "log": [
            {"hash": "b6d20e4", "date": "2026-06", "title": "Security hotspot remediation", "note": "Last gate before public release.", "display_order": 0},
            {"hash": "f19c73b", "tag": "gate", "date": "2026-03", "title": "SonarQube Quality Gate passes", "display_order": 1},
            {"hash": "48a5d0f", "date": "2025-12", "title": "Admin RBAC + 60th endpoint", "display_order": 2},
            {"hash": "90e14cc", "tag": "v0.1", "date": "2025-09", "title": "Monorepo scaffold · staged CI/CD", "display_order": 3},
        ],
        "diagrams": [
            {
                "id": "seq-rest",
                "kind": "sequence",
                "title": "Sequence — GitHub stats",
                "note": "the 24h cache shields the rate limit",
                "display_order": 0,
                "data": {
                    "actors": ["Visitor", "Next.js", "FastAPI", "Redis", "GitHub API"],
                    "messages": [
                        {"from": "Visitor", "to": "Next.js", "label": "view /home"},
                        {"from": "Next.js", "to": "FastAPI", "label": "GET /api/github"},
                        {"from": "FastAPI", "to": "Redis", "label": "cache lookup"},
                        {"from": "Redis", "to": "FastAPI", "label": "hit (≤24h) → stats", "kind": "return"},
                        {"from": "FastAPI", "to": "GitHub API", "label": "miss → fetch + store"},
                        {"from": "FastAPI", "to": "Next.js", "label": "200 · stats", "kind": "return"},
                    ],
                },
            },
            {
                "id": "authz",
                "kind": "matrix",
                "title": "Authorization Matrix",
                "note": "JWT role claims → route scopes",
                "display_order": 1,
                "data": {
                    "cols": ["visitor", "admin"],
                    "rows": [
                        {"label": "view site & projects", "cells": ["✓", "✓"]},
                        {"label": "send contact message", "cells": ["✓", "✓"]},
                        {"label": "CRUD projects / skills", "cells": ["—", "✓"]},
                        {"label": "read messages inbox", "cells": ["—", "✓"]},
                        {"label": "upload assets (Supabase)", "cells": ["—", "✓"]},
                        {"label": "trigger deploy hooks", "cells": ["—", "✓"]},
                    ],
                },
            },
            {
                "id": "cicd-pf",
                "kind": "tiers",
                "title": "CI/CD — staged deploys",
                "display_order": 2,
                "data": {
                    "tiers": [
                        [{"kind": "start", "title": "push → main"}],
                        [{"kind": "step", "title": "Lint + tests"}],
                        [{"kind": "decision", "title": "SonarQube gate?"}],
                        [
                            {"kind": "step", "title": "Vercel build", "sub": "frontend · preview → prod", "via": "pass"},
                            {"kind": "error", "title": "blocked", "via": "fail"},
                        ],
                        [{"kind": "step", "title": "Railway deploy", "sub": "API + Postgres + Redis"}],
                        [{"kind": "end", "title": "health checks"}],
                    ],
                },
            },
        ],
        "gallery": [
            {"id": "pf-home", "src": "/projects/pf-home.png", "caption": "fig 01 — public site · home", "display_order": 0},
            {"id": "pf-admin", "src": "/projects/pf-admin.png", "caption": "fig 02 — admin · messages table", "display_order": 1},
        ],
    },
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
