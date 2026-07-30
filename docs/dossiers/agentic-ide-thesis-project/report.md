# Agentic IDE — Dossier Research Report

**Research date:** 2026-07-31
**Repository:** `C:\Develop\Projects\Agentic Ide\Agentic-Ide`
**Remote:** `https://github.com/TurkishKEBAB/Agentic-Ide`
**Current state:** planning, readiness, and thesis-governance repository; no Electron/Monaco application source is present at the audited `main` HEAD.

## Executive summary

The old dossier described a working AI-native IDE with a Monaco shell, policy engine,
RAG index, local/cloud model adapters, and an approval loop. The repository supports
those as planned architecture and research scope, but does not contain the runtime
implementation or production screenshots. The dossier now presents the project as a
thesis planning artifact and publishes only repository-backed design decisions.

## Evidence ledger

| Claim | Status | Evidence |
|---|---|---|
| The repository is a safety-oriented Agentic IDE thesis project | verified | `README.md`, `PRODUCT_PLAN.md`, current `main` |
| Electron + Monaco is the selected MVP shell | verified decision | `docs/adr/ADR-001-electron-monaco-editor-shell.md`, commit `da4af95` |
| MVP uses a single-agent plan-first approval loop | verified decision | `SYSTEM_PLAN.md`, `AGENT_ARCHITECTURE_ANALYSIS.md` |
| Local retrieval is the direction; SQLite + sqlite-vec is the first candidate | verified decision | `docs/adr/ADR-003-local-retrieval-storage.md` |
| Model selection is manual, with local/cloud provider boundaries | verified decision | `docs/adr/ADR-004-manual-model-selection.md`, `ADR-005` |
| Shell execution is excluded from MVP | verified decision | `docs/adr/ADR-006-no-shell-execution-in-mvp.md` |
| There are 9 ADR files | verified | `docs/adr/ADR-001..009` |
| There are 57 non-epic backlog issues and 12 epics | verified | `github-projects/requirements-analysis.json` (69 items total) |
| There are 5 MVP scenarios | verified | `PRODUCT_PLAN.md` §0.4 and §4 |
| The benchmark target is 20 tasks | planned target | `PRODUCT_PLAN.md`, `EVALUATION_PLAN.md`; no benchmark run is claimed |
| An IDE implementation, runtime metrics, or screenshots exist | unknown / not publishable | No app source or approved production capture found |

## Current architecture

This is a design architecture, not a deployed runtime. The intended boundaries are:

- Electron + Monaco editor shell;
- a single-agent orchestrator for observe → plan → approval-gated apply;
- layered context/retrieval with a local-first storage boundary;
- explicit model-provider boundary for local Ollama-compatible and cloud
  Anthropic-compatible paths;
- workspace/path/write safety, protected-file checks, rollback, and audit evidence;
- schemas and GitHub Project seed data used to gate implementation readiness.

The repository deliberately excludes shell/process execution from the MVP and does not
claim an OS-level sandbox. The correct term is a workspace boundary.

## Metrics and milestones

The payload uses planning metrics, not runtime performance claims: 9 ADRs, 57
non-epic backlog issues, 5 MVP scenarios, and a planned 20-task benchmark. Real
engineering milestones are `caa3376` (2026-05-02), `da4af95` (2026-05-01),
`cbe238d` (2026-04-27), `ac75994` (2026-03-10), and `e6da815` (2026-01-02).

## Visual status

No gallery item is seeded. The repository contains planning diagrams and schema
contracts, but no approved Electron/Monaco shell, diff-review screen, policy test
capture, or local/cloud model screen. A conceptual render must not be presented as a
production screenshot.

## Validation

The active payload is validated through `ProjectDossierUpsert.model_validate()` in
`portfolio-project/backend/tests/test_seed_dossiers.py`. Pending items are the
application implementation, executable policy/approval evidence, benchmark results,
and real product screenshots.
