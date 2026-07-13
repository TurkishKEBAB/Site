# YO.sys — Project Dossier + Full Parity Pass

**Date:** 2026-07-11
**Branch:** `feature/frontend-yosys-dossier`
**Source design system:** "YO.sys Design System" (claude.ai/design project `a76f7b1a-…`), reverse-engineered from this repo's `portfolio-project/frontend/`.

## Context

The YO.sys design system was extracted *from* this codebase, so most of it (Home hero, telemetry, command center, system map, capability matrix, tech radar, terminal, ticker, blog, contact) already ships in code 1:1. Implementing it back verbatim would mostly churn correct code.

The genuinely **net-new** design work is:

1. A full project **dossier** experience on the Projects page (the design's modal grew from a compact description card into a 1080px tabbed dossier).
2. A **CareerMap** git-graph on the About page (replacing the plain timeline list).
3. A **parity sweep** to fix any drift between the formalized spec (`guidelines/recreation-notes.md`) and current code.

### Approved scope decisions

- **Dossier data:** port the design's plausible placeholder content **as-is for all 5 projects** (user edits real numbers later).
- **Gallery:** replace the design's localStorage drag-drop uploader with **real images served from `/public`** (empty-state until files are added).
- **About:** **adopt the new CareerMap git-graph** (net-new component).
- **Approach:** introduce a **semantic CSS-variable token layer** and port the components near-verbatim (rather than rewriting each into Tailwind `dark:` utilities).

## Goals / Non-goals

**Goals**
- Ship the tabbed project dossier (overview / architecture / decisions / eng·log / gallery) for all 5 projects.
- Ship the CareerMap on About.
- Bring the design's diagram renderers (C4, flow/state, sequence, schema, matrix) into the repo as reusable TSX.
- Fix real drift found in a parity audit against `recreation-notes.md`.
- Keep the site green: lint, type-check, build, and Vitest all pass; both themes render correctly.

**Non-goals**
- No redesign of already-matching pages (Home/Blog/Contact chrome) beyond drift fixes.
- No backend/API changes; dossier content is static content data.
- No full localization of dossier deep content (see i18n below).
- Not wiring gallery images to the backend/Supabase — plain `/public` assets only.

## Architecture

### 1. Semantic token layer (`src/index.css`)

The repo boots `<html class="dark">` by default (`themeScript` in `app/layout.tsx`) and uses Tailwind `darkMode:'class'`. Add the design's semantic variables so ported inline-style components resolve correctly in both themes. Define **light values on `:root`, dark overrides on `.dark`** (matches Tailwind's model). Hardcoded cyan tints (`rgba(0,212,255,…)` glows/washes) stay literal — the existing site already does this.

| Variable | light (`:root`) | dark (`.dark`) | source palette |
|---|---|---|---|
| `--text-1` | `#0f172a` | `#e8e8f0` | gray-900 / dark-50 |
| `--text-body` | `#334155` | `#d0d0e0` | slate-700 / dark-100 |
| `--text-muted` | `#4b5563` | `#8888a8` | gray-600 / dark-300 |
| `--text-faint` | `#9ca3af` | `#5a5a80` | gray-400 / dark-400 |
| `--accent-text` | `#0099cc` | `#00d4ff` | primary-600 / primary-400 |
| `--border-1` | `#e5e7eb` | `#1e1e3e` | gray-200 / dark-600 |
| `--surface-card` | `rgba(255,255,255,.8)` | `rgba(18,18,42,.6)` | white/80 / dark-800/60 |
| `--surface-card-solid` | `#ffffff` | `#0a0a14` | white / dark-900 |
| `--bg-page` | `#f4f4f8` | `#06060e` | page / dark-950 |
| `--gold-400` | `#f0b400` | `#f0b400` | amber-400 |
| `--status-green` | `#10b981` | `#34d399` | emerald-500/400 |
| `--syn-keyword` | `#7c3aed` | `#c792ea` | purple |
| `--syn-fn` | `#2563eb` | `#82aaff` | blue |
| `--syn-err` | `#dc2626` | `#ff9a9a` | red |
| `--primary-300` / `-400` / `-700` | `#83e8ff` / `#00d4ff` / `#007aa3` | same | theme-independent |
| `--dark-500` | `#3a3a60` | `#3a3a60` | dark-500 |

Fonts reuse existing `--font-display` / `--font-sans` / `--font-mono` (already provided via `next/font`). `.panel` / `.panel-hover` already exist and match the design's usage.

### 2. New components (`src/components/nexus/`)

All ported to TSX with prop types; inline styles retained for fidelity. CDN-Feather `<Icon name>` calls are preserved via a thin repo wrapper.

- **`Icon.tsx`** — small name→`react-icons/fi` map so ported components keep `<Icon name="…" size={n} />`. Needed names → Fi:
  `arrow-right`→`FiArrowRight`, `download`→`FiDownload`, `github`→`FiGithub`, `linkedin`→`FiLinkedin`, `mail`→`FiMail`, `maximize-2`→`FiMaximize2`, `zoom-in`→`FiZoomIn`, `zoom-out`→`FiZoomOut`, `x`→`FiX`, `image`→`FiImage`, `minus`→`FiMinus`, `layers`→`FiLayers`, `git-branch`→`FiGitBranch`, `activity`→`FiActivity`, `database`→`FiDatabase`, `grid`→`FiGrid`, `box`→`FiBox`.
- **`Tag.tsx`** — chip with default (cyan-tint) and `gold` variants (repo has none today).
- **`C4Diagram.tsx`** — semantic-zoom C4: breadcrumbs (`C1·Context › C2·Containers …`), zoom in/out buttons, drillable node cards (`leaf` nodes not drillable), per-level `note`/`focus`, kind legend. `nx-c4-in`/`nx-c4-out` keyframes added to CSS.
- **`DiagramGallery.tsx`** — mono chip picker over five renderers, each a subcomponent:
  - `c4` → `C4Diagram`
  - `tiers` → flow/pipeline/state machine (`FlowNode`: start/end/state/final pills, step/decision/error/store cards, `via` labels, `notes`)
  - `sequence` → UML lifelines + messages (self-messages, return dashed, arrow heads)
  - `schema` → class/ERD entity cards + relations
  - `matrix` → authz/risk table
- **`ProjectDossierModal.tsx`** — 1080px modal (compact 660px fallback when a project has no `details`). Tabs built from present data: overview always; architecture if `diagrams`/`c4`; decisions if `adrs`; eng·log if `log`; gallery if `gallery`. Keeps focus-to-close-button, body scroll-lock, Escape-to-close, overlay-click-close, `role="dialog" aria-modal`. Overview shows localized description + metrics grid + impact box + tech tags.
- **`ProjectIndex.tsx`** — numbered `nx-row` grid (`64px 1fr auto`): index number, title + gold Featured tag, summary, right tech list + arrow chip. Hover: cyan wash, `padding-left` shift, arrow rotates −45°, number → cyan. (`nx-index-*` hover rules added to CSS.)
- **`CareerMap.tsx`** — git-graph: SVG rails + branch/merge Bézier curves (behind), HTML overlay of lane names, nodes (circle; `head`=rotated square; `start`=outlined), date labels; detail panel with prev/next steppers.
- **`GallerySlot` → `/public` image** — inside the modal's gallery tab: render `<img src={item.src}>` with `onError` fallback to a dashed empty-state showing the expected path (`public/projects/<id>.(png|jpg)`). No localStorage.

### 3. Content data (`src/content/`)

- **`projectDetails.ts`** — typed port of `window.SITE_DATA.projectDetails` for all 5 slugs. Interfaces:
  - `C4Node { kind: 'person'|'system'|'client'|'container'|'component'|'store'|'queue'|'external'; title; sub?; leaf? }`
  - `C4Level { label; note?; tiers: C4Node[][] }`
  - `Adr { id; title; status; date?; context; decision; tradeoff? }`
  - `LogEntry { hash; tag?; date; title; note? }`
  - `Diagram` = discriminated union on `kind` (`c4` → `C4Level[]`; `sequence` → `{actors; messages}`; `schema`|`tiers` → `{tiers; relations?; notes?}`; `matrix` → `{cols; rows}`)
  - `GalleryItem { id; src?; caption; hint? }`
  - `ProjectDetail { metrics; c4; adrs; log; diagrams; gallery }`
  - `projectDetails: Record<string, ProjectDetail>`
  - Replicate the design's post-processing: prepend the C4 model as the first `diagrams` entry (`{id:'c4', kind:'c4', title:'C4 Model', note:'semantic zoom…', data: c4}`).
  - `gallery` items get `src: "/projects/<id>.png"`.
- **`careerGraph.ts`** — typed port of `window.SITE_DATA.careerGraph`: `CareerLane { id; name; color; ongoing? }`, `CareerNode { id; lane; t; when; title; body?; kind? }`, `CareerLink { from; to }`, `careerGraph: { lanes; nodes; links }`.

### 4. Integration

- **`src/routes/Projects.tsx`** — replace `ProjectExplorer` usage with `ProjectIndex` + `ProjectDossierModal`. Build a `localizedProject` view (title/summary/description/impact/technologies from `site.ts`) merged with EN-only `projectDetails[slug]` as `details`. Update index subtitle to *"…the full dossier — architecture, decisions, log, gallery."* Remove `ProjectExplorer.tsx` (and its test) if no longer referenced.
- **`src/routes/About*.tsx`** — add a `Career map` section (`NxSectionHead` + `CareerMap`) sourced from `careerGraph`. Keep or fold the existing textual timeline per parity audit (default: CareerMap becomes the primary career visualization; keep the proof-point panels).

### 5. i18n handling

Dossier deep content (C4/ADR/log/diagrams/metrics) and career node stories ship **EN-only** — structural, tool-heavy text. Localized:
- Modal chrome: tab labels (`overview`/`architecture`/`decisions`/`eng·log`/`gallery`), section headings (`Impact`, `Technology stack`), `Featured`/`Project`/`dossier`.
- Header title/summary/description/impact come from the already-localized `site.ts` project records.
- Section heads on Projects/About use existing localized `NxSectionHead` copy.

Stated as a known, accepted simplification consistent with "port placeholders as-is."

## Parity audit (Work Package F)

Audit each page against `guidelines/recreation-notes.md`, **verifying against current code** (MEMORY.md flags may be stale). For each candidate, confirm drift then fix; otherwise record as already-correct. Candidates:

- `src/services/api.ts` — 403 must NOT clear auth (only 401 does).
- `src/routes/About*.tsx` — internal nav uses `<Link>` not `<a href>`.
- `src/components/Navigation.tsx` — language dropdown click-outside (`mousedown`) + Escape dismiss.
- `src/components/Toast.tsx` — timer IDs tracked for cleanup on early close.
- Keyboard a11y on interactive rows/cards (Enter/Space, focus rings).
- Token/spacing/copy spot-checks against `recreation-notes.md` per page.

Deliverable: a short findings list (drifted → fixed vs already-correct). Scope limited to items in `recreation-notes.md`; no unrelated refactors.

## Testing / Verification

- Add Vitest tests (`@testing-library/react`, with `afterEach(cleanup)`):
  - `ProjectDossierModal` — opens on select, renders tabs present in data, tab switch changes panel, Escape closes.
  - `C4Diagram` — zoom-in advances level/breadcrumb; zoom-out returns; leaf node not drillable.
  - `DiagramGallery` — chip switch swaps renderer; renders each kind without crashing.
  - `CareerMap` — node click updates detail panel; steppers move selection.
  - `ProjectIndex` — renders numbered rows; select fires with the project.
- Run `npm run lint`, `npm run type-check`, `npm run build`, `npm run test` — all green.
- Drive Projects + About in the browser (both themes) to confirm dossier tabs, diagram rendering, and the career graph.

## Work packages

| WP | Deliverable | Acceptance |
|---|---|---|
| **A** | Semantic token layer + `nx-c4-*` / `nx-index-*` keyframes in `src/index.css` | vars resolve in light & dark; no visual regression on existing pages |
| **B** | `Icon`, `Tag`, `C4Diagram`, `DiagramGallery`, `ProjectDossierModal`, `ProjectIndex` (TSX) | type-check clean; unit tests pass; render in isolation |
| **C** | `projectDetails.ts` (typed, all 5, C4-first diagrams, `/public` gallery src) | typed; no `any`; matches design content |
| **D** | Projects page integration; retire `ProjectExplorer` | clicking a row opens the dossier; 5 dossiers render; index subtitle updated |
| **E** | `CareerMap.tsx` + `careerGraph.ts` + About integration | career graph renders; node/stepper interaction works |
| **F** | Parity audit + drift fixes | findings list produced; confirmed drift fixed; green |
| **G** | Full verification | lint + type-check + build + tests green; browser check both themes |

Order: A → B → C → D → E → F → G. A–D deliver the dossier; E adds the career map; F is the parity sweep; G verifies.

## Risks / caveats

- **Inline-style + token approach** deviates from the repo's Tailwind idiom for these leaf components (accepted trade-off for fidelity/low-risk; documented here).
- **Placeholder content** is marked `TODO(yigit)` in data files — real numbers/dates/decisions to be confirmed before shipping publicly.
- **Gallery images** show empty-state until PNGs are dropped into `public/projects/`.
- **`ProjectExplorer` removal** must not break existing tests/imports — sweep references first.
