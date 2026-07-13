"use client";

import { useState } from "react";
import { FiGithub } from "react-icons/fi";

import { ExpandChip, GitHubDetailView, TelemetryModal, WakaDetailView } from "@/components/nexus/TelemetryDashboard";
import { CornerFrame } from "@/components/ui";
import { siteConfig, type Locale } from "@/content/site";
import { githubDetail, wakaDetail } from "@/content/telemetryDetail";
import type {
  GitHubContributions,
  GitHubStats,
  WakaTimeStats,
} from "@/lib/systemProfile";

interface CommandCenterProps {
  locale: Locale;
  waka: WakaTimeStats | null;
  github: GitHubStats | null;
  contributions: GitHubContributions | null;
}

const githubHandle = "TurkishKEBAB";
const heatOpacity = [0, 0.22, 0.42, 0.65, 0.92];

/** Seconds → hours, formatted with grouping (e.g. 4467600 → "1,241"). */
const toHours = (seconds: number, digits = 0) =>
  (seconds / 3600).toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

/** Large counts → compact form (e.g. 2400 → "2.4k"). */
const compact = (value: number) =>
  value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value);

const unavailableText = (locale: Locale) =>
  locale === "tr" ? "Veri gecici olarak yok" : "Data temporarily unavailable";

function Unavailable({ locale }: { locale: Locale }) {
  return (
    <p className="mt-5 font-mono text-[11px] text-gray-400 dark:text-dark-400">
      — {unavailableText(locale)}
    </p>
  );
}

export default function CommandCenter({ locale, waka, github, contributions }: CommandCenterProps) {
  const tr = locale === "tr";
  const [expanded, setExpanded] = useState<null | "waka" | "github">(null);
  const expandLabel = tr ? "genislet" : "expand";

  const wakaStats = waka
    ? [
        { value: toHours(waka.all_time_seconds), unit: "h", label: tr ? "Toplam takip" : "Total tracked" },
        { value: toHours(waka.last_7_days_seconds, 1), unit: "h", label: tr ? "Bu hafta" : "This week" },
        { value: toHours(waka.daily_average_seconds, 1), unit: "h", label: tr ? "Gunluk ortalama" : "Daily average" },
      ]
    : [];

  const githubStats = github
    ? [
        { value: compact(github.public_repos), label: tr ? "Public repo" : "Public repos" },
        { value: compact(github.total_commits), label: tr ? "Commit" : "Commits" },
        { value: compact(github.total_pull_requests), label: tr ? "Pull request" : "Pull requests" },
        { value: compact(github.total_stars), label: tr ? "Yildiz" : "Stars earned" },
      ]
    : [];

  return (
    <>
      <div className="grid gap-5 md:grid-cols-[1fr,1.25fr]">
      <CornerFrame accent className="panel p-6 md:p-7">
        <div className="flex items-center justify-between gap-3">
          <span className="sys-label flex items-center gap-2">
            <span className="text-primary-600 dark:text-primary-400">//</span> WakaTime
          </span>
          <ExpandChip onClick={() => setExpanded("waka")} label={expandLabel} />
        </div>
        {waka ? (
          <>
            <div className="mt-5 flex flex-wrap gap-x-8 gap-y-4">
              {wakaStats.map((stat) => (
                <div key={stat.label}>
                  <div className="font-display text-3xl font-bold tracking-tight text-gray-900 dark:text-dark-50">
                    <span className="text-primary-600 dark:text-primary-400">{stat.value}</span>
                    {stat.unit}
                  </div>
                  <div className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-gray-400 dark:text-dark-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-3">
              {waka.languages.map((lang) => (
                <div key={lang.name}>
                  <div className="mb-1.5 flex items-center justify-between font-mono text-[11px] text-gray-600 dark:text-dark-300">
                    <span>{lang.name}</span>
                    <span className="text-primary-600 dark:text-primary-400">{lang.percent}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-dark-600">
                    <div className="h-full rounded-full bg-primary-400" style={{ width: `${lang.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <Unavailable locale={locale} />
        )}
      </CornerFrame>

      <CornerFrame accent className="panel p-6 md:p-7">
        <div className="flex items-center justify-between gap-3">
          <span className="sys-label flex items-center gap-2">
            <span className="text-primary-600 dark:text-primary-400">//</span> GitHub
          </span>
          <div className="flex items-center gap-2">
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
            <ExpandChip onClick={() => setExpanded("github")} label={expandLabel} />
          </div>
        </div>

        {github ? (
          <div className="mt-5 flex flex-wrap gap-x-8 gap-y-4">
            {githubStats.map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-3xl font-bold tracking-tight text-gray-900 dark:text-dark-50">
                  <span className="text-primary-600 dark:text-primary-400">{stat.value}</span>
                </div>
                <div className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-gray-400 dark:text-dark-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Unavailable locale={locale} />
        )}

        {contributions ? (
          <>
            <div className="mt-6 grid grid-flow-col grid-rows-7 gap-[3px]" aria-hidden="true">
              {contributions.cells.map((level, index) => (
                <span
                  key={`heat-${index}`}
                  className={`aspect-square rounded-[2px] ${level === 0 ? "bg-gray-200 dark:bg-dark-600" : ""}`}
                  style={level === 0 ? undefined : { backgroundColor: `rgba(0,212,255,${heatOpacity[level]})` }}
                />
              ))}
            </div>
            <div className="mt-3 flex items-center justify-end gap-1.5 font-mono text-[10px] text-gray-400 dark:text-dark-400">
              <span>{tr ? "Az" : "Less"}</span>
              {heatOpacity.map((opacity, index) => (
                <span
                  key={`legend-${index}`}
                  className={`h-2.5 w-2.5 rounded-[2px] ${index === 0 ? "bg-gray-200 dark:bg-dark-600" : ""}`}
                  style={index === 0 ? undefined : { backgroundColor: `rgba(0,212,255,${opacity})` }}
                />
              ))}
              <span>{tr ? "Cok" : "More"}</span>
            </div>
          </>
        ) : null}
      </CornerFrame>
      </div>

      <TelemetryModal
        open={expanded === "waka"}
        label="WakaTime · Dashboard"
        title={tr ? "Aktivite ozeti" : "Activity overview"}
        meta={tr ? "son 7 gun · anlik goruntu" : "last 7 days · snapshot"}
        onClose={() => setExpanded(null)}
      >
        <WakaDetailView stats={wakaStats} languages={waka?.languages ?? []} detail={wakaDetail} />
      </TelemetryModal>
      <TelemetryModal
        open={expanded === "github"}
        label={`GitHub · @${githubHandle}`}
        title={tr ? "Analitik & aktivite" : "Analytics & activity"}
        meta={tr ? "public profil · gunluk guncellenir" : "public profile · updated daily"}
        onClose={() => setExpanded(null)}
      >
        <GitHubDetailView stats={githubStats} cells={contributions?.cells ?? []} detail={githubDetail} />
      </TelemetryModal>
    </>
  );
}
