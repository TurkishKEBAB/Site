// Command-center deep-dive data for the WakaTime / GitHub expand modals.
// Ported from the YO.sys design system (templates/portfolio-site/data.js).
// EN-only, structural. TODO(yigit): wire streak/profile to the live GitHub
// API and refresh the WakaTime snapshot.

export interface TelemetryStat {
  value: string;
  unit?: string;
  label: string;
  note?: string;
}

export interface NamedPercent {
  name: string;
  percent: number;
  color?: string;
}

export interface WakaProject {
  name: string;
  time: string;
  meta: string;
}

export interface WakaDetail {
  total7d: string;
  overview: TelemetryStat[];
  ai: TelemetryStat[];
  agents: NamedPercent[];
  editors: NamedPercent[];
  languages7d: NamedPercent[];
  projects: WakaProject[];
  machine: string;
}

export interface GitHubDetail {
  contributionsYear: string;
  streak: { current: string; longest: string; last: string };
  topLanguages: NamedPercent[];
  profile: Array<[string, string]>;
}

export const wakaDetail: WakaDetail = {
  total7d: "6h 31m",
  overview: [
    { value: "0s", label: "Current day", note: "today" },
    { value: "1h 37m", label: "Daily average", note: "over 4 days" },
    { value: "Mon Jul 6", label: "Most active", note: "top day" },
  ],
  ai: [
    { value: "100%", label: "AI-driven" },
    { value: "2.8K", label: "AI lines" },
    { value: "0", label: "Human lines" },
    { value: "95.3M", label: "Tokens", note: "94.9M in · 395.4K out" },
    { value: "59", label: "AI prompts" },
    { value: "15", label: "Sessions" },
  ],
  agents: [
    { name: "GPT", percent: 75 },
    { name: "Opus", percent: 22.8 },
    { name: "Fable", percent: 2.2 },
  ],
  editors: [
    { name: "VS Code", percent: 88.6 },
    { name: "Claude Code", percent: 11.4 },
  ],
  languages7d: [
    { name: "Markdown", percent: 30.3 },
    { name: "Python", percent: 24.5 },
    { name: "Other", percent: 18.1 },
    { name: "TypeScript", percent: 12 },
    { name: "JSON", percent: 5.9 },
    { name: "TOML", percent: 4.9 },
  ],
  projects: [
    { name: "site", time: "3h 52m", meta: "29 prompts · 52.2M tokens" },
    { name: "isikschedule-web", time: "1h 51m", meta: "27 prompts · 21.3M tokens" },
    { name: "agentic-ide", time: "46m", meta: "3 prompts · 21.7M tokens" },
  ],
  machine: "DESKTOP-3ARPVF0",
};

export const githubDetail: GitHubDetail = {
  contributionsYear: "1,847",
  streak: { current: "14", longest: "47", last: "today" },
  topLanguages: [
    { name: "Java", percent: 34, color: "var(--primary-400)" },
    { name: "Python", percent: 26, color: "var(--syn-fn)" },
    { name: "TypeScript", percent: 21, color: "var(--syn-keyword)" },
    { name: "C#", percent: 9, color: "var(--primary-700)" },
    { name: "Other", percent: 10, color: "var(--dark-500)" },
  ],
  profile: [
    ["handle", "@TurkishKEBAB"],
    ["member since", "2021"],
    ["location", "Istanbul · TR"],
    ["focus", "backend · cloud · devops"],
    ["affiliation", "Isik University · IEEE"],
  ],
};
