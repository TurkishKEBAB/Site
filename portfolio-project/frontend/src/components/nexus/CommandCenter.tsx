import { FiGithub } from "react-icons/fi";

import { CornerFrame } from "@/components/ui";
import { siteConfig, type Locale } from "@/content/site";

interface CommandCenterProps {
  locale: Locale;
}

const githubHandle = "TurkishKEBAB";

const wakaStats = (locale: Locale) => [
  { value: "1,240", unit: "h", label: locale === "tr" ? "Toplam takip" : "Total tracked" },
  { value: "18.5", unit: "h", label: locale === "tr" ? "Bu hafta" : "This week" },
  { value: "4.2", unit: "h", label: locale === "tr" ? "Gunluk ortalama" : "Daily average" },
];

const wakaLangs: Array<[string, number]> = [
  ["Python", 34],
  ["Java", 27],
  ["TypeScript", 19],
  ["Bash", 8],
  ["Other", 12],
];

const githubStats = (locale: Locale) => [
  { value: "32", label: locale === "tr" ? "Public repo" : "Public repos" },
  { value: "2.4k", label: locale === "tr" ? "Commit" : "Commits" },
  { value: "86", label: locale === "tr" ? "Pull request" : "Pull requests" },
  { value: "47", label: locale === "tr" ? "Yildiz" : "Stars earned" },
];

// Deterministic 51-week contribution grid (seeded — identical on server + client).
const heatmapCells = (() => {
  let seed = 7;
  const rng = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const cells: number[] = [];
  for (let week = 0; week < 51; week += 1) {
    for (let day = 0; day < 7; day += 1) {
      cells.push(Math.floor(Math.pow(rng(), 1.7) * 5));
    }
  }
  return cells;
})();

const heatOpacity = [0, 0.22, 0.42, 0.65, 0.92];

export default function CommandCenter({ locale }: CommandCenterProps) {
  return (
    <div className="grid gap-5 md:grid-cols-[1fr,1.25fr]">
      <CornerFrame accent className="panel p-6 md:p-7">
        <span className="sys-label flex items-center gap-2">
          <span className="text-primary-500 dark:text-primary-400">//</span> WakaTime
        </span>
        <div className="mt-5 flex flex-wrap gap-x-8 gap-y-4">
          {wakaStats(locale).map((stat) => (
            <div key={stat.label}>
              <div className="font-display text-3xl font-bold tracking-tight text-gray-900 dark:text-dark-50">
                <span className="text-primary-500 dark:text-primary-400">{stat.value}</span>
                {stat.unit}
              </div>
              <div className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-gray-400 dark:text-dark-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-3">
          {wakaLangs.map(([name, pct]) => (
            <div key={name}>
              <div className="mb-1.5 flex items-center justify-between font-mono text-[11px] text-gray-600 dark:text-dark-300">
                <span>{name}</span>
                <span className="text-primary-500 dark:text-primary-400">{pct}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-dark-600">
                <div className="h-full rounded-full bg-primary-400" style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </CornerFrame>

      <CornerFrame accent className="panel p-6 md:p-7">
        <div className="flex items-center justify-between gap-3">
          <span className="sys-label flex items-center gap-2">
            <span className="text-primary-500 dark:text-primary-400">//</span> GitHub
          </span>
          <a
            href={siteConfig.github}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-gray-200 px-2.5 py-1 font-mono text-xs text-gray-500 transition-colors hover:border-primary-400/40 hover:text-primary-600 dark:border-dark-600 dark:text-dark-300 dark:hover:text-primary-400"
          >
            <span className="inline-flex items-center gap-1.5">
              <FiGithub size={12} aria-hidden="true" />@{githubHandle}
            </span>
          </a>
        </div>
        <div className="mt-5 flex flex-wrap gap-x-8 gap-y-4">
          {githubStats(locale).map((stat) => (
            <div key={stat.label}>
              <div className="font-display text-3xl font-bold tracking-tight text-gray-900 dark:text-dark-50">
                <span className="text-primary-500 dark:text-primary-400">{stat.value}</span>
              </div>
              <div className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-gray-400 dark:text-dark-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-flow-col grid-rows-7 gap-[3px]" aria-hidden="true">
          {heatmapCells.map((level, index) => (
            <span
              key={`heat-${index}`}
              className={`aspect-square rounded-[2px] ${level === 0 ? "bg-gray-200 dark:bg-dark-600" : ""}`}
              style={level === 0 ? undefined : { backgroundColor: `rgba(0,212,255,${heatOpacity[level]})` }}
            />
          ))}
        </div>
        <div className="mt-3 flex items-center justify-end gap-1.5 font-mono text-[10px] text-gray-400 dark:text-dark-400">
          <span>{locale === "tr" ? "Az" : "Less"}</span>
          {heatOpacity.map((opacity, index) => (
            <span
              key={`legend-${index}`}
              className={`h-2.5 w-2.5 rounded-[2px] ${index === 0 ? "bg-gray-200 dark:bg-dark-600" : ""}`}
              style={index === 0 ? undefined : { backgroundColor: `rgba(0,212,255,${opacity})` }}
            />
          ))}
          <span>{locale === "tr" ? "Cok" : "More"}</span>
        </div>
      </CornerFrame>
    </div>
  );
}
