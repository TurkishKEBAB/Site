// Server-side data layer for the home-page Command Center.
// Pulls live WakaTime + GitHub stats from the FastAPI backend and caches
// them with a short ISR window (15m). Every call degrades to `null` on failure so the
// UI can render a muted "unavailable" state instead of fabricated data.

export interface WakaTimeLanguage {
  name: string;
  percent: number;
}

export interface WakaTimeBreakdown extends WakaTimeLanguage {
  seconds: number;
  text: string;
}

export interface WakaTimeDay {
  date: string;
  seconds: number;
  text: string;
}

export interface WakaTimeStats {
  all_time_seconds: number;
  all_time_text: string;
  last_7_days_seconds: number;
  last_7_days_text: string;
  daily_average_seconds: number;
  daily_average_text: string;
  languages: WakaTimeLanguage[];
  projects: WakaTimeBreakdown[];
  editors: WakaTimeBreakdown[];
  most_active_day: WakaTimeDay | null;
  range: string;
}

export interface GitHubLanguage {
  name: string;
  percent: number;
}

export interface GitHubStats {
  public_repos: number;
  total_stars: number;
  total_pull_requests: number;
  total_commits: number;
  commits_range: string;
  languages: GitHubLanguage[];
}

export interface GitHubContributions {
  total_contributions: number;
  cells: number[];
  current_streak: number;
  longest_streak: number;
  last_contribution: string | null;
}

const REVALIDATE_SECONDS = 900; // 15m; backend keeps upstream calls at a 1h TTL

const getApiBaseUrl = () =>
  (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1").replace(/\/$/, "");

async function fetchJson<T>(pathname: string): Promise<T | null> {
  try {
    const response = await fetch(`${getApiBaseUrl()}${pathname}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error(`Failed to fetch ${pathname}`, error);
    return null;
  }
}

export const fetchWakaTimeStats = (): Promise<WakaTimeStats | null> =>
  fetchJson<WakaTimeStats>("/wakatime/stats");

export const fetchGitHubStats = (): Promise<GitHubStats | null> =>
  fetchJson<GitHubStats>("/github/stats");

export const fetchGitHubContributions = (): Promise<GitHubContributions | null> =>
  fetchJson<GitHubContributions>("/github/contributions");
