# GitLens-First Career History Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Replace the card-heavy About experience with a complete bilingual GitLens-style career history that includes pre-university milestones and every relevant CV category.

**Architecture:** careerGraph.ts becomes the single localized source of career-history content. CareerMap and CareerLog render that same source with a shared Locale prop, while About keeps only its summary, the graph/log, and live skills views. The old dossier/card content is removed after its CV details are represented as graph nodes.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS, existing Nexus components, Vitest, Testing Library.

## Global Constraints

- Preserve all unrelated unstaged user modifications.
- Do not reintroduce AdaLab into active/public content.
- Keep the existing Nexus visual language, responsive overflow, keyboard controls, and live skills API states.
- Keep English and Turkish content synchronized for all human-facing career fields.
- Do not change backend files or archive/backup files for this frontend-only change.

---

### Task 1: Add failing coverage for the complete GitLens history

**Files:**
- Create: portfolio-project/frontend/src/content/careerGraph.test.ts
- Create: portfolio-project/frontend/src/components/nexus/CareerViews.test.tsx
- Modify: portfolio-project/frontend/src/routes/About.test.tsx

**Interfaces:**
- Consumes the current careerGraph shape and CareerViews public props.
- Produces regression expectations for localized graph data and the simplified About surface.

- [ ] **Step 1: Write the graph data regression tests**

~~~ts
import { describe, expect, it } from "vitest";

import { careerGraph } from "./careerGraph";

describe("careerGraph", () => {
  it("contains the complete pre-university through current history", () => {
    const ids = new Set(careerGraph.nodes.map((node) => node.id));

    expect(ids).toEqual(expect.arrayContaining([
      "frc-finalist",
      "high-school",
      "tubitak-research",
      "university-start",
      "isikschedule",
      "netas-start",
      "ieee-lead",
      "certifications",
      "interests",
      "head",
    ]));
    expect(careerGraph.lanes.map((lane) => lane.id)).toEqual([
      "origin",
      "main",
      "projects",
      "industry",
      "community",
      "signals",
    ]);
    expect(careerGraph.nodes.some((node) => /adalab/i.test(node.title.en))).toBe(false);
  });

  it("keeps graph links attached to real nodes", () => {
    const ids = new Set(careerGraph.nodes.map((node) => node.id));

    for (const link of careerGraph.links) {
      expect(ids.has(link.from)).toBe(true);
      expect(ids.has(link.to)).toBe(true);
    }
  });
});
~~~

- [ ] **Step 2: Write the graph/log interaction test**

Render CareerViews with locale=en, assert the graph is the default view, click the log button, and assert git log --graph --oneline --all, HEAD, and a pre-university entry are visible. Rerender with locale=tr and assert Turkish lane/title text is visible.

- [ ] **Step 3: Update About tests for the reduced surface**

Keep the existing live-skills loading/error/empty assertions. Replace dossier-card assertions with expectations that About contains Professional summary and the career view, while it does not render Current signal, What's behind the numbers, Delivery with scale, or dossier section headings.

- [ ] **Step 4: Run the focused tests and confirm they fail**

Run from portfolio-project/frontend:

~~~powershell
npm run test -- --run src/content/careerGraph.test.ts src/components/nexus/CareerViews.test.tsx src/routes/About.test.tsx
~~~

Expected: failures because the new lanes/nodes/locale prop and card-removal behavior do not exist yet.

### Task 2: Replace the career data with a localized complete history

**Files:**
- Modify: portfolio-project/frontend/src/content/careerGraph.ts
- Test: portfolio-project/frontend/src/content/careerGraph.test.ts

**Interfaces:**
- CareerLane.name, CareerNode.when, CareerNode.title, CareerNode.body, CareerNode.bullets, and optional href use LocalizedString.
- CareerNode.kind is origin | milestone | branch | head.
- CareerGraph remains { lanes, nodes, links }.

- [ ] **Step 1: Define localized graph types**

Use the existing LocalizedString and Locale types from @/content/site:

~~~ts
export interface CareerNode {
  id: string;
  lane: string;
  t: number;
  when: LocalizedString;
  title: LocalizedString;
  body?: LocalizedString;
  bullets?: LocalizedString[];
  tags?: string[];
  href?: string;
  kind?: "origin" | "milestone" | "branch" | "head";
}
~~~

Add a small text(en, tr) helper local to the file so the dataset stays readable and does not duplicate the same object literal shape.

- [ ] **Step 2: Define the six lanes**

Use existing Nexus tokens and these ids/order: origin, main, projects, industry, community, signals. Give main and the current community/learning lanes ongoing=true only where the CV says the activity continues. Keep lane labels localized.

- [ ] **Step 3: Add all CV-backed nodes**

Add chronological nodes for FRC Houston, high school, TÜBİTAK 4009, Işık University, core curriculum, Portfolio Platform, IşıkSchedule, Teknofest Sarkan UAV, Automated Web Crawler, Agentic IDE thesis, CSE Student Assistant, Arch of Sigma, NETAŞ, IEEE Işık leadership, IEEEXtreme, SIU, community volunteering, certifications/continuous learning, achievements, interests, and current HEAD. Use the exact date ranges and facts already present in aboutDossier.ts; do not invent dates. Keep AdaLab absent.

- [ ] **Step 4: Add semantic branch/merge links**

Connect origin milestones into university-start, project/industry/community branches into the main trajectory, and the latest professional/project signals into head. Every link must reference an existing node and represent a real narrative connection.

- [ ] **Step 5: Run the data tests**

~~~powershell
npm run test -- --run src/content/careerGraph.test.ts
~~~

Expected: PASS.

- [ ] **Step 6: Commit the data model**

~~~powershell
git add portfolio-project/frontend/src/content/careerGraph.ts portfolio-project/frontend/src/content/careerGraph.test.ts
git commit -m "feat(frontend): expand localized career history"
~~~

### Task 3: Make graph and log render the same localized detail model

**Files:**
- Modify: portfolio-project/frontend/src/components/nexus/CareerViews.tsx
- Modify: portfolio-project/frontend/src/components/nexus/CareerMap.tsx
- Modify: portfolio-project/frontend/src/components/nexus/CareerLog.tsx
- Test: portfolio-project/frontend/src/components/nexus/CareerViews.test.tsx

**Interfaces:**
- CareerViews becomes CareerViews({ locale, graphLabel, logLabel }).
- CareerMap becomes CareerMap({ locale, lanes, nodes, links, initial, style, className }).
- CareerLog becomes CareerLog({ locale, lanes, nodes }).

- [ ] **Step 1: Add locale-aware rendering helpers**

Use getLocaleValue(value, locale) for every lane and node human-facing field. Keep ids, tags, hrefs, hashes, and numeric t values locale-independent.

- [ ] **Step 2: Make HEAD the initial selected graph node**

Initialize selection with initial, then the node whose kind is head, then the first node. Keep previous/next navigation sorted chronologically.

- [ ] **Step 3: Render detail content without cards**

In the selected graph detail panel and every log entry, render localized bullets as a compact list, tags as existing mono pills, and an external link when href exists. Add accessible link text such as Open project / Projeyi aç through localized CareerViews labels.

- [ ] **Step 4: Preserve GitLens visual language and responsive behavior**

Keep the current colored rails, branch curves, short hashes, lane refs, selected-node glow, keyboard buttons, and horizontal graph overflow. Use real buttons and accessible labels; do not replace the graph with hover-only UI.

- [ ] **Step 5: Complete the interaction test**

Assert graph default, log toggle, HEAD, pre-university content, localized Turkish content, and the external-link/details path. Run:

~~~powershell
npm run test -- --run src/components/nexus/CareerViews.test.tsx
~~~

Expected: PASS.

- [ ] **Step 6: Commit the renderer update**

~~~powershell
git add portfolio-project/frontend/src/components/nexus/CareerViews.tsx portfolio-project/frontend/src/components/nexus/CareerMap.tsx portfolio-project/frontend/src/components/nexus/CareerLog.tsx portfolio-project/frontend/src/components/nexus/CareerViews.test.tsx
git commit -m "feat(frontend): render localized GitLens career views"
~~~

### Task 4: Remove redundant About card sections

**Files:**
- Modify: portfolio-project/frontend/src/routes/About.tsx
- Modify: portfolio-project/frontend/src/routes/About.test.tsx
- Modify: portfolio-project/frontend/src/test/public-routes.ssr.test.tsx
- Delete: portfolio-project/frontend/src/components/nexus/CvDossier.tsx
- Delete: portfolio-project/frontend/src/content/aboutDossier.ts

**Interfaces:**
- About keeps AboutPageProps, useSkillsQuery, CapabilityMatrix, TechRadar, and CareerViews.
- About passes locale to CareerViews.

- [ ] **Step 1: Remove dossier/card-only imports and declarations**

Remove CvDossier, AnimatedSection, getLocaleValue, impactMetrics, nowCards, and the JSX for dossier, current-signal, proof-point, and impact sections. Preserve pre-existing Turkish text and user edits in all overlapping hunks.

- [ ] **Step 2: Re-number and reorder the compact About page**

Keep the professional summary as section 01, career graph/log as section 02, capability matrix as section 03, and radar as section 04. Pass the current locale to CareerViews and keep its English/Turkish labels.

- [ ] **Step 3: Remove dead dossier files**

Delete CvDossier.tsx and aboutDossier.tsx only after all content needed by the graph has been moved into careerGraph.ts. Confirm no imports remain with:

~~~powershell
rg -n "CvDossier|aboutDossier" portfolio-project/frontend
~~~

- [ ] **Step 4: Update render tests**

Assert the compact section set, complete GitLens content, both locales, no AdaLab, and preserved live skill states. Assert the removed card headings do not appear.

- [ ] **Step 5: Run focused About/SSR tests**

~~~powershell
npm run test -- --run src/routes/About.test.tsx src/test/public-routes.ssr.test.tsx src/components/nexus/CareerViews.test.tsx
~~~

Expected: PASS.

- [ ] **Step 6: Commit the About simplification**

~~~powershell
git add portfolio-project/frontend/src/routes/About.tsx portfolio-project/frontend/src/routes/About.test.tsx portfolio-project/frontend/src/test/public-routes.ssr.test.tsx
git rm portfolio-project/frontend/src/components/nexus/CvDossier.tsx portfolio-project/frontend/src/content/aboutDossier.ts
git commit -m "refactor(frontend): make About GitLens-first"
~~~

### Task 5: Full verification and PR update

**Files:**
- Modify only if verification exposes a scoped regression in files from Tasks 2–4.

- [ ] **Step 1: Run the frontend suite and static checks**

~~~powershell
cd portfolio-project/frontend
npm run test
npm run type-check
npm run lint
npm run build
~~~

- [ ] **Step 2: Verify runtime invariants**

~~~powershell
rg -n -i "adalab|resumeText" src app --glob '!**/*.test.*'
~~~

Expected: no runtime matches. Confirm existing resume PDF and resume route tests remain intact.

- [ ] **Step 3: Inspect the final diff**

~~~powershell
cd ../..
git diff --check origin/main...HEAD
git status --short --branch
~~~

Expected: only intended commits are ahead; unrelated pre-existing user modifications remain unstaged and are not added.

- [ ] **Step 4: Commit any scoped verification fix**

Use a focused Conventional Commit such as fix(frontend): correct localized career rendering only when a scoped test failure requires it.

- [ ] **Step 5: Push and update the existing PR**

~~~powershell
git push
gh pr view 95 --json url,state,isDraft,headRefName,baseRefName
~~~

The existing PR #95 must contain the new commits and still target main.
