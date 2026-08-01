# GitLens-First Career History Design

## Goal

Make the About page tell Yiğit Okur’s complete story as one GitLens-style career history. The timeline must begin before university, retain the full CV history, and replace the current collection of repeated About cards with one coherent graph/log experience.

## User intent

- The current graph starts at Işık University in September 2023 and hides the formative period before university.
- The CV dossier, “now” cards, proof-point cards, and impact cards make About feel fragmented.
- The previous GitLens-like graph/log treatment is the preferred visual language.
- No AdaLab content may return to the active/public experience.

## Chosen approach

Use the career graph as the primary About narrative. `CareerMap` remains the visual overview and `CareerLog` remains the readable, detailed view of the same data. Both consume one localized career-history model so no information is duplicated between cards and timeline content.

The About page keeps only:

- one professional summary panel;
- the GitLens graph/log history;
- the live skills capability matrix;
- the live technology radar.

The following repeated card sections are removed from About:

- the `CvDossier` card grid;
- current `nowCards`;
- recent proof-point cards;
- impact metric cards.

The content is not discarded. CV details become timeline entries with localized descriptions, bullets, tags, and links where appropriate.

## Career lanes

The graph uses six chronological lanes:

1. `origin · foundation` — FRC Houston finalist, Anatolian high school, and TÜBİTAK 4009 research.
2. `main · software engineering` — Işık University, core curriculum, thesis, and current HEAD.
3. `projects · shipped systems` — Portfolio Platform, IşıkSchedule, Teknofest Sarkan UAV platform, Automated Web Crawler, and Agentic IDE.
4. `industry · professional delivery` — Işık CSE student assistant, Arch of Sigma, and NETAŞ.
5. `community · leadership` — IEEE Işık, IEEEXtreme, SIU, and community volunteering.
6. `signals · learning` — certifications, continuous learning, achievements, and interests.

The earliest nodes connect into the university `main` lane. Project, industry, community, and learning branches connect to the main history at the point where they became part of the engineering trajectory. The current HEAD remains on `main` and is visually distinct.

## Data model

Extend the career content model so human-facing fields support English and Turkish consistently:

- lane names are localized;
- `when`, `title`, `body`, and optional bullets are localized;
- nodes may include `tags` and `href`;
- node `kind` distinguishes the origin, normal milestones, branch points, and HEAD;
- graph links describe branch/merge relationships, not decorative order.

The graph and log sort by the numeric timeline position. The log shows newest-first entries with a deterministic short hash, lane ref, date, title, body, bullets, tags, and external link when available. The graph remains horizontally scrollable on narrow screens and the selected node detail panel remains keyboard accessible.

## About layout

The section sequence becomes:

1. page header and professional summary;
2. `Career map` with graph/log toggle;
3. live `Technical system` capability matrix;
4. live `Tech radar`.

The section numbers and Turkish/English labels will be updated to match the shorter page. The existing API-backed skills behavior, loading/error/empty states, and responsive Nexus styling remain intact.

## Accessibility and responsive behavior

- Graph nodes remain real buttons with accessible names and pressed state.
- The selected detail panel exposes the active lane, date, title, and content without relying on hover.
- Previous/next controls remain keyboard accessible.
- The log view provides all timeline information without requiring SVG interpretation.
- The graph uses horizontal overflow rather than compressing dates and labels into unreadable collisions.
- Existing reduced-motion behavior and animation primitives are preserved.

## Validation

- Unit tests assert pre-university nodes, university nodes, NETAŞ, projects, community, learning, and both locales.
- About render tests assert the removed card sections are absent and the GitLens graph/log content is present.
- Tests assert AdaLab is absent from active/public About, Home, career graph, and Open Graph output.
- Frontend test, type-check, lint, and build commands are run after implementation.
- Existing user modifications outside this scope remain untouched.
