// Stable profile metadata for the live WakaTime / GitHub detail panels.
// Dynamic activity values come from the backend response and are never stored here.

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

export interface GitHubDetail {
  profile: Array<[string, string]>;
}

export const githubDetail: GitHubDetail = {
  profile: [
    ["handle", "@TurkishKEBAB"],
    ["member since", "2021"],
    ["location", "Istanbul · TR"],
    ["focus", "backend · cloud · devops"],
    ["affiliation", "Işık University · IEEE"],
  ],
};
