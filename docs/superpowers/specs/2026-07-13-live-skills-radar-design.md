# Live Skills, Capability Matrix, and Tech Radar

## Goal

Replace the About page's static capability and radar item lists with the existing public Skills API while preserving the current NEXUS visual language, localized group labels, five capability domains, four radar quadrants, and graceful loading/error/empty states.

## Scope

### In scope

- Fetch public skills through the existing `useSkillsQuery(language)` hook and `skillService.getSkills(language)` contract.
- Transform API `Skill` records into the existing `CapabilityGroup` shape.
- Transform the same records into typed TechRadar blips.
- Preserve API-provided `domain`, `ring`, and `display_order` semantics.
- Keep localized capability group titles and summaries, but remove static skill-name arrays from the public rendering path.
- Add loading, error, retry, and empty states to the About capability/radar section.
- Add focused transformation, route, component, and regression tests.

### Out of scope

- No backend model, schema, endpoint, migration, or seed-data changes.
- No new admin Skills CRUD; Phase 1 already provides the admin editor and the API contract.
- No change to the static experience, impact metric, or career content in About.
- No redesign of the existing CapabilityMatrix or TechRadar layout.

## Existing contracts

The public endpoint `GET /api/v1/skills/` returns a `SkillListResponse` containing `Skill[]` records. The frontend `Skill` type provides:

```ts
interface Skill {
  id: string;
  name: string;
  category: string;
  domain: "backend" | "cloud" | "product" | "testing" | "research";
  ring: "adopt" | "trial" | "assess" | "hold";
  icon?: string;
  display_order: number;
}
```

The current API response uses `display_order`; the frontend type will be aligned to that response field as part of this phase without changing the backend contract. The existing query hook already passes the active locale to `skillService.getSkills(language)`, and the backend applies translated skill names/categories with English fallback.

## Transformation design

Create `frontend/src/lib/skills.ts` with focused, pure transformations:

```ts
export type RadarQuadrant = 0 | 1 | 2 | 3;

export interface RadarBlip {
  name: string;
  ring: SkillRing;
  quadrant: RadarQuadrant;
}

export function toCapabilityGroups(
  skills: Skill[],
  locale: Locale,
): CapabilityGroup[];

export function toRadarBlips(skills: Skill[]): RadarBlip[];
```

`toCapabilityGroups` uses the fixed domain order `backend`, `cloud`, `product`, `testing`, `research`. Group numbers remain `/01` through `/05`; titles and summaries come from localized group metadata in `site.ts`; item names come only from API skills. Within each group, records are sorted by `display_order` and then by name for deterministic output. Empty domains remain representable so the UI can distinguish a valid empty response from a failed request.

`toRadarBlips` carries each API skill's `ring` unchanged. It sorts skills by `display_order` and maps categories to a stable quadrant using normalized category text:

- `Languages` or categories containing `language`/`programming` → quadrant `0` (Languages)
- Cloud, DevOps, Frontend, Database, Platform, or categories containing those terms → quadrant `1` (Platforms)
- Tooling, Tools, or categories containing `tool` → quadrant `2` (Tools)
- Backend, Architecture, Testing, AI/Data, Research, and all unknown categories → quadrant `3` (Methods)

This mapping is deterministic, keeps all four quadrants usable, and gives admin-created skills a predictable radar position without adding a new database field. It is covered by unit tests so future category changes are intentional.

## Component and data flow

`About` becomes the client data boundary because it owns the capability/radar loading state:

```text
LanguageContext locale
        ↓
useSkillsQuery(locale)
        ↓
Skill[] ──┬── toCapabilityGroups ── CapabilityMatrix
          └── toRadarBlips ──────── TechRadar
```

`CapabilityMatrix` keeps its current `groups` prop and renders API-derived skill names. `TechRadar` changes from a module-level static `blips` array to a required typed `blips` prop and retains its existing SVG rings, quadrant labels, placement algorithm, and visual classes.

The static `skillGroups` data is reduced to localized group metadata only; its skill-name arrays are removed. No public capability or radar item is rendered from checked-in static content.

## UI states

The About capability/radar section will render:

- Loading: a compact status message while the first query is pending.
- Error: a localized error message and retry button using the query's `refetch` callback; no stale static skill list is shown.
- Empty: a localized no-skills message when the API returns zero records; the capability/radar item areas remain empty.
- Success: the capability matrix and radar receive the transformed API records.

The rest of the About page remains available in every state, including current signal, proof points, career map, and impact metrics.

## Testing strategy

- `frontend/src/lib/skills.test.ts`: verify fixed domain grouping, API-only names, `display_order` sorting, empty domains, ring preservation, category-to-quadrant mapping, and deterministic radar ordering.
- `frontend/src/routes/About.test.tsx`: verify loading, error/retry, empty, and success rendering with the query hook mocked at the data boundary.
- `frontend/src/test/public-routes.ssr.test.tsx`: mock the public skills query and assert that an API skill appears in the rendered About output, preserving existing static route assertions.
- Existing `frontend/src/hooks/usePublicData.test.tsx`: retain coverage that the active locale reaches `skillService.getSkills`.
- Backend `backend/tests/test_skills.py`: run existing public/admin skill endpoint coverage unchanged because this phase does not alter the API.
- Final checks: frontend full Vitest suite, lint, type-check, API type drift check, production build, and backend full no-coverage suite.

## Acceptance criteria

1. An admin-created skill returned by `GET /api/v1/skills/` appears in the matching CapabilityMatrix domain.
2. The same skill appears in the TechRadar ring specified by its API `ring` value and in the deterministic quadrant derived from its category.
3. Changing the active locale requests translated skill names and the localized group labels remain correct.
4. The About page has loading, error/retry, and empty states without falling back to the old static item list.
5. Existing About layout and unrelated static content remain intact.
6. All listed verification commands pass without API schema changes.
