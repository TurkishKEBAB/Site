"use client";

import { useState } from "react";

import { type Locale } from "@/content/site";

export interface CapabilityGroup {
  no: string;
  domain: string;
  title: string;
  summary: string;
  skills: string[];
}

interface CapabilityMatrixProps {
  locale: Locale;
  groups: CapabilityGroup[];
}

const filters = (locale: Locale) =>
  locale === "tr"
    ? [
        ["all", "Tümü"],
        ["backend", "Backend"],
        ["cloud", "Cloud"],
        ["product", "Ürün"],
        ["testing", "Test"],
        ["research", "Araştırma"],
      ]
    : [
        ["all", "All"],
        ["backend", "Backend"],
        ["cloud", "Cloud"],
        ["product", "Product"],
        ["testing", "Testing"],
        ["research", "Research"],
      ];

/**
 * Capability matrix with domain filter (design idea — Skills view).
 * Clicking a chip dims every group that does not match the selected domain.
 */
export default function CapabilityMatrix({ locale, groups }: CapabilityMatrixProps) {
  const [active, setActive] = useState("all");

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-2">
        {filters(locale).map(([value, label]) => {
          const on = active === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setActive(value)}
              className={`rounded-full border px-3.5 py-1 font-mono text-[10px] uppercase tracking-wide transition-colors ${
                on
                  ? "border-primary-400 bg-primary-400 text-dark-950"
                  : "border-gray-200 text-gray-500 hover:border-primary-400/40 hover:text-primary-600 dark:border-dark-600 dark:text-dark-300 dark:hover:text-primary-400"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-x-14 md:grid-cols-2">
        {groups.map((group) => {
          const dim = active !== "all" && group.domain !== active;
          return (
            <div
              key={group.no}
              className={`border-t border-gray-200 py-5 transition-opacity duration-300 dark:border-dark-600 ${
                dim ? "opacity-25" : "opacity-100"
              }`}
            >
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[11px] text-primary-600 dark:text-primary-400">{group.no}</span>
                <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-dark-50">{group.title}</h3>
              </div>
              <p className="mt-2 text-[13.5px] leading-relaxed text-gray-600 dark:text-dark-300">{group.summary}</p>
              <div className="mt-3.5 flex flex-wrap gap-1.5">
                {group.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-gray-200 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-gray-500 dark:border-dark-600 dark:text-dark-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
