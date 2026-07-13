# Live Skills, Capability Matrix, and Tech Radar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the About page's static capability and radar item lists with localized, ordered Skills API data while preserving the existing NEXUS layout and graceful degraded states.

**Architecture:** Add pure transformations in `src/lib/skills.ts` for capability groups and radar blips. Keep localized group metadata in `site.ts`, but remove its static skill-name arrays. Make `About` the client data boundary using `useSkillsQuery(locale)`, pass transformed groups to `CapabilityMatrix`, and pass typed blips to `TechRadar`.

**Tech Stack:** Next.js App Router, React 19, TypeScript, TanStack Query, Vitest, Testing Library, existing FastAPI Skills API.

## Global Constraints

- Do not modify the backend Skills schema, endpoint, migration, or seed data.
- Use `display_order` from the public API for deterministic ordering; remove the frontend `order_index` mismatch.
- Render no capability or radar item from the old static skill-name arrays.
- Preserve the five capability domains and four radar quadrants.
- Keep loading, error/retry, and empty states localized through the existing `Locale` contract.
- Preserve user changes in `portfolio-project/frontend/app/layout.tsx` and `portfolio-project/frontend/next-env.d.ts`; do not stage or modify them.
- Use TDD for each behavior: write a failing test, verify the expected failure, implement the smallest change, verify green, then commit.

---

### Task 1: Add pure live-skill transformations

**Files:**

- Modify: `portfolio-project/frontend/src/services/types.ts`
- Modify: `portfolio-project/frontend/src/content/site.ts`
- Create: `portfolio-project/frontend/src/lib/skills.test.ts`
- Create: `portfolio-project/frontend/src/lib/skills.ts`

**Interfaces:**

- Consumes: `Skill[]` with `domain`, `ring`, `category`, `name`, and `display_order`; localized `skillGroups` metadata.
- Produces: `toCapabilityGroups(skills, locale): CapabilityGroup[]` and `toRadarBlips(skills): RadarBlip[]`.

- [ ] **Step 1: Write failing transformation tests**

Create `src/lib/skills.test.ts` with API-shaped fixtures and these assertions:

```ts
it("groups API skills by domain and sorts each group by display order", () => {
  const groups = toCapabilityGroups(
    [
      skill("late", "cloud", "Platforms", "trial", 20),
      skill("first", "cloud", "Platforms", "adopt", 1),
      skill("backend", "backend", "Backend", "assess", 5),
    ],
    "en",
  );

  expect(groups.map((group) => group.domain)).toEqual([
    "backend", "cloud", "product", "testing", "research",
  ]);
  expect(groups.find((group) => group.domain === "cloud")?.skills).toEqual([
    "first", "late",
  ]);
});

it("preserves radar rings and maps categories to deterministic quadrants", () => {
  const blips = toRadarBlips([
    skill("language", "backend", "Languages", "adopt", 1),
    skill("platform", "cloud", "Cloud & DevOps", "trial", 2),
    skill("tool", "cloud", "Tooling", "assess", 3),
    skill("method", "research", "AI & Data", "hold", 4),
  ]);

  expect(blips).toEqual([
    { name: "language", ring: "adopt", quadrant: 0 },
    { name: "platform", ring: "trial", quadrant: 1 },
    { name: "tool", ring: "assess", quadrant: 2 },
    { name: "method", ring: "hold", quadrant: 3 },
  ]);
});

it("keeps empty capability domains without inventing static skills", () => {
  const groups = toCapabilityGroups([], "tr");

  expect(groups).toHaveLength(5);
  expect(groups.every((group) => group.skills.length === 0)).toBe(true);
});
```

The fixture helper must construct `Skill` values with `display_order`, not `order_index`.

- [ ] **Step 2: Run the transformation tests and confirm the red failure**

Run:

```powershell
cd portfolio-project/frontend
npm run test -- --run src/lib/skills.test.ts
```

Expected: FAIL because `src/lib/skills.ts` does not exist and the current Skill type does not expose `display_order`.

- [ ] **Step 3: Implement the API type and pure transformations**

Change `Skill` in `src/services/types.ts` from `order_index` to `display_order`.

Reduce `site.ts` `SkillGroup` and `skillGroups` to the five localized title/summary definitions; remove every static skill-name array from those records.

Create `src/lib/skills.ts` with `DOMAIN_ORDER = ["backend", "cloud", "product", "testing", "research"]`, `RadarQuadrant = 0 | 1 | 2 | 3`, and `RadarBlip = { name, ring, quadrant }`. `toCapabilityGroups` must return all five domains, use localized metadata, filter by domain, sort by `display_order` then name, and map API names. `toRadarBlips` must copy the API ring, sort by the same order, and map normalized categories: language/programming → `0`; cloud/devops/frontend/database/platform → `1`; tool/tooling → `2`; all other categories → `3`.

- [ ] **Step 4: Run the transformation tests and confirm green**

Run the same command from Step 2. Expected: all transformation tests pass with no static skill names in the output.

- [ ] **Step 5: Commit the transformation unit**

```powershell
git add portfolio-project/frontend/src/services/types.ts portfolio-project/frontend/src/content/site.ts portfolio-project/frontend/src/lib/skills.ts portfolio-project/frontend/src/lib/skills.test.ts
git commit -m "feat(frontend): add live skill transformations"
```

---

### Task 2: Replace the static TechRadar blips with a typed input

**Files:**

- Modify: `portfolio-project/frontend/src/components/nexus/TechRadar.tsx`
- Create: `portfolio-project/frontend/src/components/nexus/TechRadar.test.tsx`
- Consume: `portfolio-project/frontend/src/lib/skills.ts`

**Interfaces:**

- Consumes: `RadarBlip[]` with `name`, `ring`, and `quadrant`.
- Produces: the same SVG ring/quadrant layout with only the supplied blips.

- [ ] **Step 1: Write the failing component test**

Create a test that renders `blips={[{ name: "Admin-created skill", ring: "trial", quadrant: 1 }]}` with `locale="en"`, asserts the supplied label exists with an ancestor `g.blip-r1`, and asserts the old `Java` label is absent.

- [ ] **Step 2: Run the component test and confirm the red failure**

```powershell
cd portfolio-project/frontend
npm run test -- --run src/components/nexus/TechRadar.test.tsx
```

Expected: FAIL because the component currently owns the static `blips` array and does not accept/render the supplied prop.

- [ ] **Step 3: Implement the typed TechRadar input**

Import `RadarBlip`, change props to `{ locale: Locale; blips: RadarBlip[] }`, remove the module-level static blip array, and rename internal placement fields from `n` to `name` and `quad` to `quadrant`. Extract placement into a local function that iterates quadrants `0` through `3`, filters supplied blips, preserves their input order within each quadrant, and calculates the existing positions using `ringMid`. Render `b.name` and keep `blip-r${b.ring}` unchanged.

- [ ] **Step 4: Run the component test and confirm green**

Run the same test command. Expected: the supplied skill is visible with `blip-r1`, and the old `Java` label is absent.

- [ ] **Step 5: Commit the TechRadar unit**

```powershell
git add portfolio-project/frontend/src/components/nexus/TechRadar.tsx portfolio-project/frontend/src/components/nexus/TechRadar.test.tsx
git commit -m "feat(frontend): render live skills in tech radar"
```

---

### Task 3: Wire live Skills and UI states into About

**Files:**

- Modify: `portfolio-project/frontend/src/routes/About.tsx`
- Create: `portfolio-project/frontend/src/routes/About.test.tsx`
- Modify: `portfolio-project/frontend/src/test/public-routes.ssr.test.tsx`
- Modify: `portfolio-project/frontend/src/hooks/usePublicData.test.tsx`

**Interfaces:**

- Consumes: `useSkillsQuery(locale)`, `toCapabilityGroups`, and `toRadarBlips`.
- Produces: localized About rendering with no API-independent capability/radar item list.

- [ ] **Step 1: Write failing About state and success tests**

Create `About.test.tsx` with a mocked `useSkillsQuery` and cases for API skill rendering, loading status, error/retry, and empty response. The success assertion must require the API skill name in both matrix and radar output:

```tsx
expect(screen.getAllByText("Admin-created skill").length).toBeGreaterThanOrEqual(2);
```

The error case must click a `/try again/i` button and assert the mocked `refetch` call; the empty case must assert `/no skills found/i`.

- [ ] **Step 2: Run About tests and confirm the red failure**

```powershell
cd portfolio-project/frontend
npm run test -- --run src/routes/About.test.tsx
```

Expected: FAIL because About currently maps `skillGroups` static arrays, does not call `useSkillsQuery`, and does not render query states.

- [ ] **Step 3: Implement the About data boundary**

Add `"use client"` to `About.tsx`, call `const { data, isError, isLoading, refetch } = useSkillsQuery(locale)`, and derive:

```ts
const skills = data ?? [];
const capabilityGroups = toCapabilityGroups(skills, locale);
const radarBlips = toRadarBlips(skills);
```

Remove the `skillGroups.map` item transformation. In the existing capability/radar sections, render a localized status while loading, an alert with retry on error, an empty message for a successful zero-record response, and the matrix/radar only for non-empty success. Keep all other About sections unchanged.

- [ ] **Step 4: Update route and query regression tests**

Extend the existing `usePublicData` fixture to use `display_order`. Extend the public route mock for `@/hooks/usePublicData` with `useSkillsQuery` returning one API-shaped skill, then assert that skill name in the About HTML while retaining the existing Current signal, Career map, Tech radar, and Delivery with scale assertions.

- [ ] **Step 5: Run About and public route tests and confirm green**

```powershell
npm run test -- --run src/routes/About.test.tsx src/test/public-routes.ssr.test.tsx src/hooks/usePublicData.test.tsx
```

Expected: all selected tests pass, including loading/error/empty/retry and API skill rendering.

- [ ] **Step 6: Commit the About integration**

```powershell
git add portfolio-project/frontend/src/routes/About.tsx portfolio-project/frontend/src/routes/About.test.tsx portfolio-project/frontend/src/test/public-routes.ssr.test.tsx portfolio-project/frontend/src/hooks/usePublicData.test.tsx
git commit -m "feat(frontend): connect live skills to about page"
```

---

### Task 4: Verify Phase 3 and update project tracking

**Files:**

- Modify: `docs/superpowers/plans/2026-07-13-admin-driven-harmony.md`

- [ ] **Step 1: Run the complete frontend and backend verification gates**

```powershell
cd portfolio-project/frontend
npm run test -- --run
npm run lint
npm run type-check
npm run check:api-types
npm run build

cd ..
$env:PYTHONPATH='backend'
python -m pytest -q --no-cov
```

Expected: frontend tests pass, lint/type-check/API drift check/build exit 0, and backend tests pass with no failures.

- [ ] **Step 2: Update the master plan with Phase 3 evidence**

Mark Task 3.1 and Task 3.2 complete in `docs/superpowers/plans/2026-07-13-admin-driven-harmony.md`, record exact verification counts, and note that the backend contract remained unchanged.

- [ ] **Step 3: Commit the Phase 3 tracking update**

```powershell
git add docs/superpowers/plans/2026-07-13-admin-driven-harmony.md
git commit -m "docs(portfolio): record phase 3 completion"
```

- [ ] **Step 4: Inspect final status and preserve unrelated changes**

Run:

```powershell
git status --short --branch
git diff --check
```

Expected: only the two pre-existing user files remain modified (`frontend/app/layout.tsx` and `frontend/next-env.d.ts`); no user file is staged.
