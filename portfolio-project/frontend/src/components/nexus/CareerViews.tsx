"use client";

import { useState } from "react";
import { FiGitBranch, FiTerminal } from "react-icons/fi";

import { careerGraph } from "@/content/careerGraph";
import type { Locale } from "@/content/site";

import { CareerLog } from "./CareerLog";
import { CareerMap } from "./CareerMap";

type Mode = "graph" | "log";

/** About career section: toggle between the git-graph map and the git-log view. */
export function CareerViews({ locale, graphLabel, logLabel }: Readonly<{ locale: Locale; graphLabel: string; logLabel: string }>) {
  const [mode, setMode] = useState<Mode>("graph");

  const chip = (active: boolean) =>
    `inline-flex items-center gap-2 rounded-full border px-3.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${
      active
        ? "border-primary-400 bg-primary-400 text-dark-950"
        : "border-gray-200 text-gray-500 hover:text-primary-600 dark:border-dark-600 dark:text-dark-300 dark:hover:text-primary-400"
    }`;

  return (
    <div>
      <div className="mb-6 flex items-center gap-2" role="group" aria-label={locale === "tr" ? "Kariyer görünümü" : "Career view"}>
        <button type="button" onClick={() => setMode("graph")} className={chip(mode === "graph")} aria-pressed={mode === "graph"}>
          <FiGitBranch size={12} aria-hidden="true" />
          {graphLabel}
        </button>
        <button type="button" onClick={() => setMode("log")} className={chip(mode === "log")} aria-pressed={mode === "log"}>
          <FiTerminal size={12} aria-hidden="true" />
          {logLabel}
        </button>
      </div>
      {mode === "graph" ? (
        <CareerMap locale={locale} lanes={careerGraph.lanes} nodes={careerGraph.nodes} links={careerGraph.links} axis={careerGraph.axis} />
      ) : (
        <CareerLog locale={locale} lanes={careerGraph.lanes} nodes={careerGraph.nodes} />
      )}
    </div>
  );
}
