// Project dossiers — deep content for the tabbed ProjectDossierModal.
// Ported from the YO.sys design system (templates/portfolio-site/data.js).
// EN-only, structural/tool-heavy content. TODO(yigit): replace the plausible
// placeholder numbers/dates/decisions with real values before shipping.

export type C4NodeKind =
  | "person"
  | "system"
  | "client"
  | "container"
  | "component"
  | "store"
  | "queue"
  | "external";

export interface C4Node {
  kind: C4NodeKind;
  title: string;
  sub?: string;
  leaf?: boolean;
}

export interface C4Level {
  label: string;
  note?: string;
  tiers: C4Node[][];
}

export interface Adr {
  id: string;
  title: string;
  status: string;
  date?: string;
  context: string;
  decision: string;
  tradeoff?: string;
}

export interface LogEntry {
  hash: string;
  tag?: string;
  date: string;
  title: string;
  note?: string;
}

export interface SequenceMessage {
  from: string;
  to: string;
  label: string;
  kind?: "return";
}

export interface SequenceData {
  actors: string[];
  messages: SequenceMessage[];
}

export interface Entity {
  name: string;
  kind?: "table" | "class" | "abstract" | "interface" | "enum";
  rows?: string[];
}

export interface SchemaRelation {
  from: string;
  label: string;
  to: string;
}

export interface SchemaData {
  tiers: Entity[][];
  relations?: SchemaRelation[];
}

export type FlowKind =
  | "start"
  | "end"
  | "state"
  | "final"
  | "step"
  | "decision"
  | "error"
  | "store";

export interface FlowNode {
  kind: FlowKind;
  title: string;
  sub?: string;
  via?: string;
}

export interface TiersData {
  tiers: FlowNode[][];
  notes?: string[];
}

export interface MatrixRow {
  label: string;
  cells: string[];
}

export interface MatrixData {
  cols: string[];
  rows: MatrixRow[];
}

export type Diagram =
  | { id: string; kind: "c4"; title: string; note?: string; data: C4Level[] }
  | { id: string; kind: "sequence"; title: string; note?: string; data: SequenceData }
  | { id: string; kind: "schema"; title: string; note?: string; data: SchemaData }
  | { id: string; kind: "tiers"; title: string; note?: string; data: TiersData }
  | { id: string; kind: "matrix"; title: string; note?: string; data: MatrixData };

export interface DossierMetric {
  value: string;
  label: string;
  note?: string;
}

export interface GalleryItem {
  id: string;
  /** Served from /public — drop the file at `public${src}`. */
  src: string;
  caption: string;
  hint?: string;
}

export interface ProjectDetail {
  metrics: DossierMetric[];
  c4: C4Level[];
  adrs: Adr[];
  log: LogEntry[];
  diagrams: Diagram[];
  gallery: GalleryItem[];
}

const details: Record<string, ProjectDetail> = {
  "isikschedule-platform": {
    metrics: [
      { value: "86.97%", label: "coverage", note: "SonarQube gate" },
      { value: "13", label: "algorithms", note: "registered solvers" },
      { value: "~1,000", label: "active users", note: "desktop release" },
      { value: "6", label: "services", note: "Dockerized runtime" },
    ],
    c4: [
      {
        label: "Context",
        note: "who touches the system, and what it talks to",
        tiers: [
          [
            { kind: "person", title: "Student", sub: "builds a conflict-free timetable" },
            { kind: "person", title: "Dept. Coordinator", sub: "curates course data" },
          ],
          [{ kind: "system", title: "IsikSchedule", sub: "scheduling platform · desktop + web" }],
          [
            { kind: "external", title: "University SIS", sub: "course & section source", leaf: true },
            { kind: "external", title: "SMTP", sub: "notifications", leaf: true },
          ],
        ],
      },
      {
        label: "Containers",
        note: "deployable units inside the platform",
        tiers: [
          [
            { kind: "client", title: "Desktop", sub: "PyQt6 · ~1,000 users" },
            { kind: "client", title: "Web", sub: "Next.js · JWT" },
          ],
          [{ kind: "container", title: "FastAPI Gateway", sub: "REST · JWT / RBAC" }],
          [
            { kind: "container", title: "Scheduling Engine", sub: "13 algorithms" },
            { kind: "container", title: "Celery Workers", sub: "async solves", leaf: true },
          ],
          [
            { kind: "store", title: "PostgreSQL", sub: "primary store", leaf: true },
            { kind: "store", title: "Redis", sub: "cache · broker", leaf: true },
          ],
        ],
      },
      {
        label: "Components",
        note: "inside the scheduling engine",
        tiers: [
          [{ kind: "component", title: "Algorithm Registry", sub: "one interface · 13 solvers" }],
          [
            { kind: "component", title: "Constraint Solver", sub: "hard/soft constraint passes" },
            { kind: "component", title: "Conflict Validator", sub: "overlap & capacity checks" },
          ],
          [
            { kind: "component", title: "Timetable Builder", sub: "assembles the final schedule" },
            { kind: "component", title: "Persistence Adapter", sub: "results → PostgreSQL" },
          ],
        ],
      },
    ],
    adrs: [
      {
        id: "ADR-001",
        title: "One scheduling core, two clients",
        status: "Accepted",
        date: "2024-11",
        context: "Desktop (PyQt6) shipped first; a web product was planned without doubling maintenance.",
        decision: "Extract the engine into a shared package both clients consume — the same 13 algorithms everywhere.",
        tradeoff: "Stricter interface discipline; engine changes now version against two release trains.",
      },
      {
        id: "ADR-002",
        title: "Celery + Redis for long-running solves",
        status: "Accepted",
        date: "2025-03",
        context: "Large solves can take minutes; running them inside FastAPI request workers starved the API.",
        decision: "Queue solves through Celery with Redis as broker; the API returns a job handle and clients poll.",
        tradeoff: "More moving parts in Docker Compose; retries had to be made idempotent.",
      },
      {
        id: "ADR-003",
        title: "JWT/RBAC from day one on web",
        status: "Accepted",
        date: "2025-06",
        context: "The web release adds multi-user semantics the single-user desktop never had.",
        decision: "Role-based access enforced at the gateway; stateless tokens instead of server sessions.",
        tradeoff: "Token invalidation handled via short expiry + refresh flow.",
      },
    ],
    log: [
      { hash: "e41c7a2", tag: "v1.0", date: "2026-05", title: "Dockerized multi-service release", note: "PostgreSQL, Redis, Celery, API, web — one compose up." },
      { hash: "b93f0d8", tag: "v0.9", date: "2026-01", title: "Web beta behind JWT/RBAC" },
      { hash: "7d20c4e", tag: "v0.6", date: "2025-08", title: "Algorithm registry lands", note: "13 solvers behind one interface; coverage pushed to 86.97%." },
      { hash: "31a9be5", tag: "v0.1", date: "2024-10", title: "PyQt6 desktop prototype", note: "First conflict-free timetable generated end-to-end." },
    ],
    diagrams: [
      {
        id: "class",
        kind: "schema",
        title: "Class — solver core",
        note: "UML class view · 13 algorithms share one base",
        data: {
          tiers: [
            [{ name: "SolverBase", kind: "abstract", rows: ["+ solve(sections): Timetable", "+ score(t): float", "# constraints: Constraint[]"] }],
            [
              { name: "GeneticSolver", kind: "class", rows: ["population: 200", "mutate(rate = 0.02)"] },
              { name: "BacktrackingSolver", kind: "class", rows: ["prune(branch): bool"] },
              { name: "…11 more", kind: "class", rows: ["via AlgorithmRegistry"] },
            ],
            [
              { name: "Constraint", kind: "interface", rows: ["+ check(assign): bool", "hard: bool"] },
              { name: "Timetable", kind: "class", rows: ["slots: Slot[]", "+ conflicts(): Conflict[]"] },
            ],
          ],
          relations: [
            { from: "GeneticSolver", label: "extends", to: "SolverBase" },
            { from: "SolverBase", label: "uses 1..*", to: "Constraint" },
            { from: "SolverBase", label: "produces", to: "Timetable" },
          ],
        },
      },
      {
        id: "erd",
        kind: "schema",
        title: "ERD — scheduling data",
        note: "core relational model (PostgreSQL)",
        data: {
          tiers: [
            [
              { name: "course", kind: "table", rows: ["code · pk", "title", "credits"] },
              { name: "room", kind: "table", rows: ["id · pk", "capacity", "building"] },
            ],
            [
              { name: "section", kind: "table", rows: ["id · pk", "course_code · fk", "instructor", "capacity"] },
              { name: "time_slot", kind: "table", rows: ["id · pk", "day", "start · end"] },
            ],
            [
              { name: "schedule", kind: "table", rows: ["id · pk", "user_id · fk", "algorithm", "score"] },
              { name: "schedule_item", kind: "table", rows: ["schedule_id · fk", "section_id · fk", "room_id · fk", "slot_id · fk"] },
            ],
          ],
          relations: [
            { from: "course", label: "1:N", to: "section" },
            { from: "schedule", label: "1:N", to: "schedule_item" },
            { from: "section", label: "N:M via items", to: "time_slot" },
          ],
        },
      },
      {
        id: "seq-solve",
        kind: "sequence",
        title: "Sequence — solve request",
        note: "async job flow · the API never blocks on a solve",
        data: {
          actors: ["Web", "API", "Redis", "Worker", "Engine", "PostgreSQL"],
          messages: [
            { from: "Web", to: "API", label: "POST /solve" },
            { from: "API", to: "Redis", label: "enqueue(job)" },
            { from: "API", to: "Web", label: "202 · job_id", kind: "return" },
            { from: "Worker", to: "Redis", label: "dequeue" },
            { from: "Worker", to: "Engine", label: "run(algorithm)" },
            { from: "Engine", to: "Engine", label: "constraint passes ×N" },
            { from: "Engine", to: "PostgreSQL", label: "persist(timetable)" },
            { from: "Web", to: "API", label: "GET /jobs/:id · poll" },
            { from: "API", to: "Web", label: "200 · timetable", kind: "return" },
          ],
        },
      },
      {
        id: "auth",
        kind: "tiers",
        title: "Flow — JWT auth",
        note: "login → token → role-gated resources",
        data: {
          tiers: [
            [{ kind: "start", title: "login" }],
            [{ kind: "step", title: "Credential Check", sub: "hash verify" }],
            [{ kind: "decision", title: "valid?" }],
            [
              { kind: "step", title: "Issue JWT", sub: "role claims · short expiry", via: "yes" },
              { kind: "error", title: "401 Unauthorized", sub: "rate-limited retry", via: "no" },
            ],
            [{ kind: "step", title: "Gateway RBAC", sub: "role ⊇ route scope" }],
            [{ kind: "end", title: "resource" }],
          ],
          notes: ["expired token → POST /refresh → new JWT", "role mismatch → 403 · logged"],
        },
      },
      {
        id: "job-state",
        kind: "tiers",
        title: "State — solve job",
        note: "lifecycle of one scheduling job",
        data: {
          tiers: [
            [{ kind: "state", title: "queued" }],
            [{ kind: "state", title: "running", sub: "worker locked" }],
            [{ kind: "state", title: "validating", sub: "conflict checks" }],
            [
              { kind: "final", title: "done", via: "ok" },
              { kind: "error", title: "failed", via: "error" },
            ],
          ],
          notes: ["failed → retry ×3 (backoff) → queued", "cancel → aborted, from any state"],
        },
      },
      {
        id: "cicd",
        kind: "tiers",
        title: "CI/CD Pipeline",
        note: "every push walks the full gate · TODO(yigit): real stage timings",
        data: {
          tiers: [
            [{ kind: "start", title: "git push" }],
            [{ kind: "step", title: "pytest", sub: "86.97% coverage floor" }],
            [{ kind: "decision", title: "quality gate?", sub: "SonarQube" }],
            [
              { kind: "step", title: "docker build", sub: "6 images", via: "pass" },
              { kind: "error", title: "blocked", sub: "PR annotated", via: "fail" },
            ],
            [{ kind: "end", title: "compose deploy" }],
          ],
        },
      },
    ],
    gallery: [
      { id: "isik-desktop", src: "/projects/isik-desktop.png", caption: "fig 01 — desktop client · timetable view" },
      { id: "isik-web", src: "/projects/isik-web.png", caption: "fig 02 — web client · solver run" },
      { id: "isik-gate", src: "/projects/isik-gate.png", caption: "fig 03 — SonarQube quality gate" },
    ],
  },

  "teknofest-sarkan-uav-defense-platform": {
    metrics: [
      { value: "3rd", label: "final rank", note: "among 700+ projects" },
      { value: "200K ₺", label: "budget managed", note: "165K ₺ TÜBİTAK grant" },
      { value: "3", label: "domains", note: "mech · electronics · software" },
      { value: "99.2%", label: "telemetry uptime", note: "field tests" },
    ],
    c4: [
      {
        label: "Context",
        note: "operator, platform, and a hostile RF environment",
        tiers: [
          [{ kind: "person", title: "Ground Operator", sub: "pilots & monitors" }],
          [{ kind: "system", title: "Sarkan UAV", sub: "anti-jam telemetry & control" }],
          [{ kind: "external", title: "RF Environment", sub: "contested spectrum", leaf: true }],
        ],
      },
      {
        label: "Containers",
        note: "software units across ground and air",
        tiers: [
          [{ kind: "container", title: "Ground Station UI", sub: "telemetry dashboards" }],
          [
            { kind: "container", title: "Telemetry Link", sub: "frequency-hopping radio" },
            { kind: "container", title: "Anti-jam Module", sub: "signal scoring & fallback" },
          ],
          [{ kind: "container", title: "FC Bridge", sub: "command uplink", leaf: true }],
        ],
      },
    ],
    adrs: [
      {
        id: "ADR-001",
        title: "Frequency-hopping fallback over single-band",
        status: "Accepted",
        date: "2023-04",
        context: "Judged scenarios include active jamming; a single-band link dies with the band.",
        decision: "Score link quality continuously and hop on degradation, with a slow-but-robust fallback channel.",
        tradeoff: "Lower peak bandwidth; hop synchronization added protocol complexity.",
      },
      {
        id: "ADR-002",
        title: "Python on the ground station",
        status: "Accepted",
        date: "2023-02",
        context: "Three sub-teams iterate on dashboards and control logic under competition deadlines.",
        decision: "Python for iteration speed; hot paths isolated behind a thin native layer.",
        tradeoff: "Careful profiling needed to keep the telemetry loop under budget.",
      },
    ],
    log: [
      { hash: "f8a12dc", tag: "finals", date: "2023-09", title: "3rd place — 700+ projects" },
      { hash: "c47e901", date: "2023-07", title: "Anti-jam rewrite after field loss", note: "Link scoring tuned on real interference data." },
      { hash: "9b3d54a", date: "2023-05", title: "First full-range field test" },
      { hash: "2e6f0b7", tag: "kickoff", date: "2023-01", title: "Team formed · TÜBİTAK grant secured" },
    ],
    diagrams: [
      {
        id: "seq-jam",
        kind: "sequence",
        title: "Sequence — jam recovery",
        note: "link degradation to recovery, field-tested",
        data: {
          actors: ["Ground Station", "Telemetry Link", "Anti-jam", "UAV"],
          messages: [
            { from: "Ground Station", to: "UAV", label: "heartbeat · 10 Hz" },
            { from: "UAV", to: "Ground Station", label: "telemetry frame", kind: "return" },
            { from: "Anti-jam", to: "Anti-jam", label: "score link quality" },
            { from: "Anti-jam", to: "Telemetry Link", label: "quality < θ → hop" },
            { from: "Telemetry Link", to: "UAV", label: "sync channel №4" },
            { from: "UAV", to: "Ground Station", label: "resume telemetry", kind: "return" },
          ],
        },
      },
      {
        id: "link-state",
        kind: "tiers",
        title: "State — link quality",
        note: "fallback ladder under jamming",
        data: {
          tiers: [
            [{ kind: "state", title: "locked", sub: "full bandwidth" }],
            [{ kind: "state", title: "degraded", sub: "score < θ₁" }],
            [{ kind: "state", title: "hopping", sub: "channel scan" }],
            [
              { kind: "final", title: "re-locked", via: "sync ok" },
              { kind: "error", title: "fallback", sub: "low-rate channel", via: "scan fail" },
            ],
          ],
          notes: ["fallback keeps the command uplink alive at minimum rate", "re-locked resets the scoring window"],
        },
      },
    ],
    gallery: [
      { id: "sarkan-gs", src: "/projects/sarkan-gs.png", caption: "fig 01 — ground station · live telemetry" },
      { id: "sarkan-field", src: "/projects/sarkan-field.png", caption: "fig 02 — field test day" },
    ],
  },

  "agentic-ide-thesis-project": {
    metrics: [
      { value: "4", label: "loop stages", note: "observe · plan · approve · apply" },
      { value: "0", label: "VS Code forks", note: "extends Monaco directly" },
      { value: "2", label: "LLM backends", note: "local + cloud" },
      { value: "37", label: "requirements", note: "v0 spec, CI-validated" },
    ],
    c4: [
      {
        label: "Context",
        note: "a developer, an IDE, and the models behind it",
        tiers: [
          [{ kind: "person", title: "Developer", sub: "reviews & approves every change" }],
          [{ kind: "system", title: "Agentic IDE", sub: "AI-native editor · thesis project" }],
          [
            { kind: "external", title: "Local LLM", sub: "on-device inference", leaf: true },
            { kind: "external", title: "Cloud LLM APIs", sub: "heavy reasoning", leaf: true },
          ],
        ],
      },
      {
        label: "Containers",
        note: "modular pieces — no VS Code fork",
        tiers: [
          [{ kind: "client", title: "Monaco Shell", sub: "Electron · editor surface" }],
          [{ kind: "container", title: "Agent Orchestrator", sub: "observe → plan loops" }],
          [
            { kind: "container", title: "Approval Gate", sub: "human-in-the-loop" },
            { kind: "container", title: "Policy Engine", sub: "prohibited-command enforcement", leaf: true },
          ],
          [{ kind: "store", title: "RAG Index", sub: "code context", leaf: true }],
        ],
      },
    ],
    adrs: [
      {
        id: "ADR-001",
        title: "Extend Monaco, don't fork VS Code",
        status: "Accepted",
        date: "2025-10",
        context: "Forks inherit a huge maintenance surface and drift from upstream fast.",
        decision: "Build a thin Electron shell around Monaco; own only the agentic layer.",
        tradeoff: "No VS Code extension ecosystem — every integration is deliberate.",
      },
      {
        id: "ADR-002",
        title: "Approval gate before any apply",
        status: "Accepted",
        date: "2025-11",
        context: "Agent edits without review are the main trust failure in AI tooling.",
        decision: "Every plan renders as a diff the developer must approve; prohibited commands hard-blocked.",
        tradeoff: "Slower autonomous loops — accepted, safety is the thesis.",
      },
    ],
    log: [
      { hash: "a71b3f9", date: "2026-06", title: "Policy engine spike", note: "Prohibited-command rules validated in CI." },
      { hash: "5c09d2e", date: "2026-04", title: "Prototype shell boots", note: "Monaco + Electron with agent sidebar." },
      { hash: "d3e871c", tag: "spec", date: "2026-02", title: "Requirements + C4 diagrams frozen" },
      { hash: "84f2a06", tag: "thesis", date: "2025-10", title: "Proposal accepted" },
    ],
    diagrams: [
      {
        id: "loop",
        kind: "tiers",
        title: "Activity — agent loop",
        note: "the thesis loop: nothing applies without approval",
        data: {
          tiers: [
            [{ kind: "start", title: "observe" }],
            [{ kind: "step", title: "Plan", sub: "LLM drafts change-set" }],
            [{ kind: "step", title: "Policy Check", sub: "prohibited commands" }],
            [{ kind: "decision", title: "human approves?" }],
            [
              { kind: "step", title: "Apply", sub: "diff patched to workspace", via: "yes" },
              { kind: "error", title: "Discard → replan", via: "no" },
            ],
            [{ kind: "end", title: "verify" }],
          ],
          notes: ["verify failures feed the next observe pass"],
        },
      },
      {
        id: "seq-approve",
        kind: "sequence",
        title: "Sequence — approval gate",
        data: {
          actors: ["Developer", "Monaco UI", "Orchestrator", "LLM", "Policy"],
          messages: [
            { from: "Developer", to: "Monaco UI", label: "prompt" },
            { from: "Monaco UI", to: "Orchestrator", label: "task + context" },
            { from: "Orchestrator", to: "LLM", label: "plan request" },
            { from: "LLM", to: "Orchestrator", label: "change-set", kind: "return" },
            { from: "Orchestrator", to: "Policy", label: "validate(commands)" },
            { from: "Policy", to: "Orchestrator", label: "allow / block list", kind: "return" },
            { from: "Monaco UI", to: "Developer", label: "diff for review", kind: "return" },
            { from: "Developer", to: "Monaco UI", label: "approve ✓" },
          ],
        },
      },
    ],
    gallery: [
      { id: "aide-shell", src: "/projects/aide-shell.png", caption: "fig 01 — shell prototype · plan view" },
      { id: "aide-diff", src: "/projects/aide-diff.png", caption: "fig 02 — approval gate · diff review" },
    ],
  },

  "automated-web-crawler": {
    metrics: [
      { value: "89.9%", label: "success rate", note: "across runs" },
      { value: "100%", label: "robots.txt respect", note: "hard-enforced" },
      { value: "×8", label: "workers", note: "concurrent" },
      { value: "3", label: "retry tiers", note: "backoff + jitter" },
    ],
    c4: [
      {
        label: "Pipeline",
        note: "single-layer container view — request to row",
        tiers: [
          [{ kind: "container", title: "Scheduler", sub: "crawl frontier · rate limits" }],
          [{ kind: "container", title: "Worker Pool", sub: "Scrapy · concurrent fetch" }],
          [{ kind: "container", title: "Parser Pipeline", sub: "BeautifulSoup · normalize" }],
          [{ kind: "store", title: "PostgreSQL", sub: "FastAPI-served store" }],
        ],
      },
    ],
    adrs: [
      {
        id: "ADR-001",
        title: "Scrapy over hand-rolled asyncio",
        status: "Accepted",
        date: "2024-03",
        context: "Custom fetch loops kept reinventing throttling, dedupe, and retry logic.",
        decision: "Adopt Scrapy's scheduler/middleware model; custom code only in pipelines.",
        tradeoff: "Framework constraints on exotic crawl patterns.",
      },
      {
        id: "ADR-002",
        title: "Politeness budget per domain",
        status: "Accepted",
        date: "2024-04",
        context: "Fault tolerance is worthless if targets block the crawler.",
        decision: "robots.txt hard-enforced + per-domain rate budgets and backoff with jitter.",
        tradeoff: "Slower full-corpus sweeps; success rate is the metric that matters.",
      },
    ],
    log: [
      { hash: "7e4c1aa", date: "2024-07", title: "89.9% success across full run" },
      { hash: "3b90f5d", date: "2024-05", title: "Retry tiers + fault isolation", note: "Worker crashes no longer poison the queue." },
      { hash: "c25a8e1", tag: "v0.1", date: "2024-03", title: "Scrapy skeleton + FastAPI store" },
    ],
    diagrams: [
      {
        id: "fetch-flow",
        kind: "tiers",
        title: "Flowchart — fetch decision",
        note: "politeness first: robots gate before every fetch",
        data: {
          tiers: [
            [{ kind: "start", title: "frontier pop" }],
            [{ kind: "decision", title: "robots.txt allows?" }],
            [
              { kind: "step", title: "Fetch", sub: "rate budget per domain", via: "yes" },
              { kind: "end", title: "skip · log", via: "no" },
            ],
            [{ kind: "decision", title: "2xx?" }],
            [
              { kind: "step", title: "Parse", sub: "BeautifulSoup", via: "yes" },
              { kind: "error", title: "Retry tier +1", sub: "backoff + jitter", via: "no" },
            ],
            [{ kind: "store", title: "store row" }],
          ],
          notes: ["retry tier 3 exhausted → dead-letter", "new links → dedupe → frontier"],
        },
      },
      {
        id: "erd-crawl",
        kind: "schema",
        title: "ERD — crawl store",
        data: {
          tiers: [
            [{ name: "domain", kind: "table", rows: ["host · pk", "robots_cache", "rate_budget"] }],
            [{ name: "page", kind: "table", rows: ["url · pk", "domain · fk", "status", "content_hash"] }],
            [
              { name: "fetch_log", kind: "table", rows: ["id · pk", "page_url · fk", "attempt", "outcome"] },
              { name: "link", kind: "table", rows: ["src · fk", "dst · fk", "rel"] },
            ],
          ],
          relations: [
            { from: "domain", label: "1:N", to: "page" },
            { from: "page", label: "1:N", to: "fetch_log" },
            { from: "page", label: "N:M", to: "link" },
          ],
        },
      },
    ],
    gallery: [
      { id: "crawler-dash", src: "/projects/crawler-dash.png", caption: "fig 01 — run dashboard · success curve" },
      { id: "crawler-logs", src: "/projects/crawler-logs.png", caption: "fig 02 — worker logs · retry cascade" },
    ],
  },

  "portfolio-platform-web-desktop": {
    metrics: [
      { value: "60+", label: "API endpoints", note: "FastAPI backend" },
      { value: "24h", label: "GitHub cache", note: "rate-limit shield" },
      { value: "2", label: "deploy targets", note: "Vercel + Railway" },
      { value: "Passed", label: "quality gate", note: "SonarQube Cloud" },
    ],
    c4: [
      {
        label: "Context",
        note: "visitors, an admin, and third-party services",
        tiers: [
          [
            { kind: "person", title: "Visitor", sub: "reads the public site" },
            { kind: "person", title: "Admin (Yiğit)", sub: "manages content" },
          ],
          [{ kind: "system", title: "Portfolio Platform", sub: "public site + admin surface" }],
          [
            { kind: "external", title: "GitHub API", sub: "repo & activity data", leaf: true },
            { kind: "external", title: "Supabase", sub: "asset storage", leaf: true },
            { kind: "external", title: "SMTP", sub: "contact notifications", leaf: true },
          ],
        ],
      },
      {
        label: "Containers",
        note: "staged deploys — frontend and backend ship separately",
        tiers: [
          [{ kind: "client", title: "Next.js Frontend", sub: "Vercel · EN/TR" }],
          [{ kind: "container", title: "FastAPI Backend", sub: "Railway · 60+ endpoints · JWT/RBAC" }],
          [
            { kind: "store", title: "PostgreSQL", sub: "content & messages", leaf: true },
            { kind: "store", title: "Redis", sub: "24h GitHub cache", leaf: true },
          ],
        ],
      },
    ],
    adrs: [
      {
        id: "ADR-001",
        title: "Staged deploys: Vercel FE / Railway BE",
        status: "Accepted",
        date: "2025-09",
        context: "One platform for both tiers forced compromises on build tooling and pricing.",
        decision: "Frontend on Vercel, backend + Postgres + Redis on Railway, wired by CI/CD stages.",
        tradeoff: "Two dashboards, two failure domains — mitigated with health checks.",
      },
      {
        id: "ADR-002",
        title: "24h GitHub cache over live calls",
        status: "Accepted",
        date: "2025-11",
        context: "GitHub rate limits made live stats flaky exactly when traffic spiked.",
        decision: "Cache GitHub responses in Redis for 24h; degrade to cached data on API failure.",
        tradeoff: "Stats can lag a day — acceptable for portfolio telemetry.",
      },
    ],
    log: [
      { hash: "b6d20e4", date: "2026-06", title: "Security hotspot remediation", note: "Last gate before public release." },
      { hash: "f19c73b", tag: "gate", date: "2026-03", title: "SonarQube Quality Gate passes" },
      { hash: "48a5d0f", date: "2025-12", title: "Admin RBAC + 60th endpoint" },
      { hash: "90e14cc", tag: "v0.1", date: "2025-09", title: "Monorepo scaffold · staged CI/CD" },
    ],
    diagrams: [
      {
        id: "seq-rest",
        kind: "sequence",
        title: "Sequence — GitHub stats",
        note: "the 24h cache shields the rate limit",
        data: {
          actors: ["Visitor", "Next.js", "FastAPI", "Redis", "GitHub API"],
          messages: [
            { from: "Visitor", to: "Next.js", label: "view /home" },
            { from: "Next.js", to: "FastAPI", label: "GET /api/github" },
            { from: "FastAPI", to: "Redis", label: "cache lookup" },
            { from: "Redis", to: "FastAPI", label: "hit (≤24h) → stats", kind: "return" },
            { from: "FastAPI", to: "GitHub API", label: "miss → fetch + store" },
            { from: "FastAPI", to: "Next.js", label: "200 · stats", kind: "return" },
          ],
        },
      },
      {
        id: "authz",
        kind: "matrix",
        title: "Authorization Matrix",
        note: "JWT role claims → route scopes",
        data: {
          cols: ["visitor", "admin"],
          rows: [
            { label: "view site & projects", cells: ["✓", "✓"] },
            { label: "send contact message", cells: ["✓", "✓"] },
            { label: "CRUD projects / skills", cells: ["—", "✓"] },
            { label: "read messages inbox", cells: ["—", "✓"] },
            { label: "upload assets (Supabase)", cells: ["—", "✓"] },
            { label: "trigger deploy hooks", cells: ["—", "✓"] },
          ],
        },
      },
      {
        id: "cicd-pf",
        kind: "tiers",
        title: "CI/CD — staged deploys",
        note: "TODO(yigit): confirm stage order & timings",
        data: {
          tiers: [
            [{ kind: "start", title: "push → main" }],
            [{ kind: "step", title: "Lint + tests" }],
            [{ kind: "decision", title: "SonarQube gate?" }],
            [
              { kind: "step", title: "Vercel build", sub: "frontend · preview → prod", via: "pass" },
              { kind: "error", title: "blocked", via: "fail" },
            ],
            [{ kind: "step", title: "Railway deploy", sub: "API + Postgres + Redis" }],
            [{ kind: "end", title: "health checks" }],
          ],
        },
      },
    ],
    gallery: [
      { id: "pf-home", src: "/projects/pf-home.png", caption: "fig 01 — public site · home" },
      { id: "pf-admin", src: "/projects/pf-admin.png", caption: "fig 02 — admin · messages table" },
    ],
  },
};

// Every dossier opens its diagram gallery with the C4 model first.
for (const detail of Object.values(details)) {
  if (detail.c4.length) {
    detail.diagrams = [
      { id: "c4", kind: "c4", title: "C4 Model", note: "semantic zoom — click nodes to descend", data: detail.c4 },
      ...detail.diagrams,
    ];
  }
}

export const projectDetails: Record<string, ProjectDetail> = details;
