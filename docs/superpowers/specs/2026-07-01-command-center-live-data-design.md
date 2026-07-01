# Command Center Live Data + CV Content Refresh — Design Spec

**Date:** 2026-07-01
**Branch:** `feature/frontend-system-profile`
**Status:** Approved (brainstorming complete)

## 1. Problem

The new "nexus" system-profile design ships a **Command Center** section on the
home page (`src/components/nexus/CommandCenter.tsx`) whose WakaTime and GitHub
panels currently render **hardcoded placeholder data**:

- WakaTime: fake totals (`1,240h` / `18.5h` / `4.2h`) and fake language split.
- GitHub: fake counts (`32` repos / `2.4k` commits / `86` PR / `47` stars) and a
  **seeded-random** contribution heatmap (`seed = 7`).
- The home subtitle even admits it: *"Illustrative snapshot — mirrors the live
  dashboard."*

Curated content in `src/content/site.ts` and other nexus components
(`TechRadar`, `TechTicker`) is real-ish but drifted from the latest CV.

## 2. Goals / Non-goals

**Goals**
- Replace Command Center placeholder data with **live** WakaTime + GitHub data,
  refreshed every **24 hours**.
- Fetch live data in the **FastAPI backend** (secrets stay server-side on
  Railway), exposed via public GET endpoints; the Next.js server component
  consumes them with ISR (`revalidate: 86400`).
- Include the **real GitHub contribution heatmap** plus total repos / stars /
  commits / PRs (GraphQL).
- Refresh curated content (`impactMetrics`, `skillGroups`, `projectRecords`,
  `resumeText`, `TechRadar`, `TechTicker`) to match `Yigit_Okur_CV_v6`.

**Non-goals**
- No new database tables — live stats use Redis caching only (the existing
  `github_repos` DB cache is untouched and keeps serving `/github/repos`).
- No admin UI for these metrics; they are read-only, cache-driven.
- No premium-only WakaTime ranges (stick to free-plan-safe endpoints).

## 3. Architecture decisions (settled during brainstorming)

| Decision | Choice |
| --- | --- |
| Where live data is fetched | **Extend FastAPI backend** (reuses `github_service.py` + Redis cache pattern; secrets in Railway env) |
| Freshness | **24h** (matches existing `GITHUB_CACHE_HOURS`) via Redis TTL + Next.js `revalidate: 86400` |
| GitHub scope | **Full**: heatmap + total commits/PRs/stars/repos (GraphQL) |
| WakaTime range | `all_time_since_today` (total) + `stats/last_7_days` (week + daily avg + languages) — both free-plan-safe |
| WakaTime auth | **Secret API key** via Basic auth (`WAKATIME_API_KEY` env), not public share URLs |
| Commits metric | **All-time** sum via yearly `contributionsCollection` loop (once/day, cheap) |
| Fallback when live data missing | Render a muted "temporarily unavailable" state — **never** show fake numbers as real |

## 4. Part A — Backend (`portfolio-project/backend`)

### 4.1 Config (`app/config.py`, `.env.example`)
Add:
```python
# WakaTime
WAKATIME_API_KEY: Optional[str] = None
WAKATIME_CACHE_HOURS: int = 24
```
`GITHUB_API_TOKEN` / `GITHUB_USERNAME` already exist and are reused for GraphQL.

### 4.2 WakaTime service — new `app/services/wakatime_service.py`
Mirrors `GitHubService` structure (httpx + `get_cache_service()` + 24h TTL).

- **Auth:** `Authorization: Basic base64(WAKATIME_API_KEY)`.
- **`fetch_stats(force_refresh=False)`** — two calls:
  - `GET https://wakatime.com/api/v1/users/current/all_time_since_today`
    → `data.total_seconds`, `data.text`.
  - `GET https://wakatime.com/api/v1/users/current/stats/last_7_days`
    → `data.total_seconds`, `data.daily_average`,
      `data.human_readable_*`, `data.languages[]`.
  - Languages: take **top 5** by percent, aggregate the rest into `Other`.
  - Normalize and cache under Redis key `wakatime_stats` (TTL `WAKATIME_CACHE_HOURS * 3600`).
- **Resilience:** on HTTP/parse error, return last cached value if present,
  else `None`; log via loguru. If `WAKATIME_API_KEY` unset → return `None`.
- `get_cache_status()` / `clear_cache()` like the GitHub service.

Normalized shape (synthetic values):
```json
{
  "all_time_seconds": 4467600,
  "all_time_text": "1,240 hrs",
  "last_7_days_seconds": 66600,
  "last_7_days_text": "18 hrs 30 mins",
  "daily_average_seconds": 15120,
  "daily_average_text": "4 hrs 12 mins",
  "languages": [{ "name": "Python", "percent": 34.2 }, "..."],
  "updated_at": "2026-07-01T00:00:00Z"
}
```

### 4.3 GitHub service extension (`app/services/github_service.py`)
Add GraphQL methods (endpoint `POST https://api.github.com/graphql`,
`Authorization: bearer {GITHUB_API_TOKEN}`). Token is **required** for these;
without it the endpoints return `None`/empty gracefully.

- **`fetch_stats(force_refresh=False)`** → Redis key `github_stats`, TTL 24h:
  - `user.repositories(ownerAffiliations: OWNER, privacy: PUBLIC).totalCount` → public repos.
  - Sum `stargazerCount` over owned repos (first 100, paginate if needed) → total stars.
  - `user.pullRequests.totalCount` → total PRs (all-time authored).
  - All-time commits: read `user.createdAt`, then loop each year
    `contributionsCollection(from, to).totalCommitContributions`, sum.
- **`fetch_contributions(force_refresh=False)`** → Redis key `github_contributions`, TTL 24h:
  - `user.contributionsCollection.contributionCalendar { totalContributions, weeks { contributionDays { contributionCount date weekday contributionLevel } } }`.
  - Map `contributionLevel` (NONE/FIRST…FOURTH_QUARTILE) → integer level `0..4`.
  - Emit a **week-major flat array** `cells: number[]` (matches the existing
    `grid-flow-col grid-rows-7` heatmap layout) + `total_contributions`.

### 4.4 Schemas
- New `app/schemas/wakatime.py`: `WakaTimeLanguage`, `WakaTimeStats`.
- Extend `app/schemas/github.py`:
  - `GitHubStats { public_repos, total_stars, total_commits, total_pull_requests, commits_range, updated_at }`
  - `GitHubContributions { total_contributions, cells: List[int], updated_at }`

### 4.5 API routes (all **public GET**, like `/github/repos`)
- Extend `app/api/v1/github.py`:
  - `GET /github/stats` → `GitHubStats`
  - `GET /github/contributions` → `GitHubContributions`
- New `app/api/v1/wakatime.py`:
  - `GET /wakatime/stats` → `WakaTimeStats`
- Register wakatime router in `app/api/v1/__init__.py` (`prefix="/wakatime"`,
  `tags=["WakaTime"]`).

### 4.6 Tests
- New `tests/test_wakatime.py`: mock httpx responses → assert normalization,
  top-5 + Other aggregation, endpoint 200 shape, graceful null when key unset.
- Extend `tests/test_github.py`: mock GraphQL responses for `/github/stats` and
  `/github/contributions` (level mapping, all-time commit sum).
- Follow existing patterns in `tests/conftest.py`.

## 5. Part B — Frontend (`portfolio-project/frontend`)

### 5.1 Data layer — new `src/lib/systemProfile.ts`
Mirrors `src/lib/blog.ts` (`getApiBaseUrl()` from `NEXT_PUBLIC_API_BASE_URL`):
```ts
export async function fetchWakaTimeStats(): Promise<WakaTimeStats | null>
export async function fetchGitHubStats(): Promise<GitHubStats | null>
export async function fetchGitHubContributions(): Promise<GitHubContributions | null>
```
Each uses `fetch(url, { next: { revalidate: 86400 } })`, wrapped in try/catch,
returning typed data or `null` on failure. Response TypeScript types live here.

### 5.2 `CommandCenter.tsx` refactor
- Replace module-level hardcoded consts with props:
  ```ts
  interface CommandCenterProps {
    locale: Locale;
    waka: WakaTimeStats | null;
    github: GitHubStats | null;
    contributions: GitHubContributions | null;
  }
  ```
- Format helpers (seconds → `Xh`, etc.) live in the component or `systemProfile.ts`.
- When a slice is `null`, render a muted "—" / *"Veri geçici olarak yok / Data
  temporarily unavailable"* line for that panel instead of fake numbers.
- Keep the visual design (CornerFrame, bars, heatmap grid) unchanged.

### 5.3 `Home.tsx`
- Make the component **async**; fetch the three sources in parallel
  (`Promise.all`) and pass them into `<CommandCenter … />`.
- Remove the *"Illustrative snapshot"* disclaimer from the section subtitle
  (both TR and EN) — data is now real.

## 6. Part C — CV content refresh (`Yigit_Okur_CV_v6`)

Update curated content to match the CV. Key deltas found:

- **`src/content/site.ts`**
  - `siteConfig.linkedin`: fix vanity slug diacritic — the real handle URL-encodes
    `ğ` (verify the canonical form; CV footer prints `linkedin.com/in/yigit-okur-050b5b278`).
  - `skillGroups`: add **C#** (Languages), **Kubernetes/AWS EC2+S3/Vagrant/Azure
    DevOps/Celery/Maven/Gradle** where missing; keep grouping.
  - Leadership/`impactMetrics`: reflect **IEEE Işık Vice President & Project
    Coordinator**, 35+ events / 1,100+ students; add SIU 2025 & IEEEXtreme'24.
  - `projectRecords`: enrich NETAŞ/IsikSchedule/Teknofest with CV specifics
    (KKTC e-Nüfus project; Teknofest dates May 2024–May 2025; 13 named algorithms).
  - `resumeText`: sync to CV v6 (certifications, achievements: FRC Houston
    Worlds Finalist, TÜBİTAK 4009).
- **`TechRadar.tsx` / `TechTicker.tsx`**: align blips/ticker with the CV's real
  stack (add Azure DevOps, Vagrant, Celery, AWS as appropriate).

_Content-only edits; no schema/data-flow impact. Scope-bounded to matching the CV._

## 7. Secrets / setup checklist (operator: Yigit)

1. **WakaTime Secret API Key** → set `WAKATIME_API_KEY` in Railway backend env.
   Ensure WakaTime "JSON API" is enabled. **Do not paste the key in chat.**
2. **GitHub token** → `GITHUB_API_TOKEN` already used; must have `read:user`
   scope for GraphQL `contributionsCollection`. Verify it is set on Railway.
3. Local `.env`: add `WAKATIME_API_KEY=` (documented in `.env.example`).

## 8. Resilience summary

- Backend caches each source in Redis for 24h and returns stale cache when the
  upstream API errors → the public endpoints stay fast and rarely empty.
- Frontend ISR caches for 24h; on any failure the panel degrades to a muted
  "unavailable" state, so the home page never shows fabricated data as real and
  never hard-fails on backend/API downtime (preserves the repo-canonical
  resilience the public site already relies on).
