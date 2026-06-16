"use client";

import { useState } from "react";
import { FiPlay } from "react-icons/fi";

type TerminalTab = "shell" | "java" | "powershell";

const terminalTabs: Array<{ id: TerminalTab; label: string }> = [
  { id: "shell", label: "profile.sh" },
  { id: "java", label: "Profile.java" },
  { id: "powershell", label: "PowerShell" },
];

const javaSource = `public final class Profile {
  String name = "Yigit Okur";
  String focus = "Backend | Cloud | DevOps";
  String github = "@TurkishKEBAB";

  void ship() {
    verify("tests");
    deploy("reliable systems");
  }
}`;

const shellOutput = [
  "$ whoami",
  "yigit.okur",
  "$ cat focus.txt",
  "enterprise backend / cloud delivery / quality automation",
  "$ uptime --istanbul",
  "available for part-time engineering roles",
];

const powerShellOutput = [
  "PS> javac Profile.java",
  "PS> java Profile",
  "status      online",
  "coverage    86.97% IsikSchedule",
  "netas       25 commits / 1,550+ LOC",
  "github      @TurkishKEBAB",
];

export default function SystemTerminal() {
  const [activeTab, setActiveTab] = useState<TerminalTab>("shell");
  const [ranProfile, setRanProfile] = useState(false);

  return (
    <div className="panel overflow-hidden bg-white/90 dark:bg-dark-900/80">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/80 px-3 py-2 dark:border-dark-600 dark:bg-dark-950/70">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 dark:text-dark-400">
          system.profile
        </span>
      </div>

      <div className="flex overflow-x-auto border-b border-gray-200 dark:border-dark-600" role="tablist" aria-label="Profile terminal tabs">
        {terminalTabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`min-h-10 flex-1 whitespace-nowrap border-r border-gray-200 px-3 py-2 text-left font-mono text-[11px] uppercase tracking-wide transition-colors last:border-r-0 dark:border-dark-600 ${
              activeTab === tab.id
                ? "bg-primary-400/10 text-primary-600 dark:text-primary-400"
                : "text-gray-500 hover:text-gray-900 dark:text-dark-300 dark:hover:text-dark-50"
            }`}
            role="tab"
            aria-selected={activeTab === tab.id}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[25rem] p-5 font-mono text-sm">
        {activeTab === "shell" && (
          <pre className="whitespace-pre-wrap text-gray-700 dark:text-dark-200">
            {shellOutput.map((line, index) => (
              <span key={`${line}-${index}`} className={line.startsWith("$") ? "text-primary-600 dark:text-primary-400" : ""}>
                {line}
                {"\n"}
              </span>
            ))}
            <span className="text-primary-500 dark:text-primary-400">_</span>
          </pre>
        )}

        {activeTab === "java" && (
          <pre className="overflow-x-auto whitespace-pre text-gray-700 dark:text-dark-200">
            <code>{javaSource}</code>
          </pre>
        )}

        {activeTab === "powershell" && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setRanProfile(true)}
              className="inline-flex items-center gap-2 rounded border border-primary-400/40 px-3 py-2 font-mono text-xs uppercase tracking-wide text-primary-600 transition-colors hover:border-primary-400 hover:bg-primary-400/10 dark:text-primary-400"
            >
              <FiPlay size={13} aria-hidden="true" />
              Run profile
            </button>

            <pre className="whitespace-pre-wrap text-gray-700 dark:text-dark-200">
              {(ranProfile ? powerShellOutput : powerShellOutput.slice(0, 2)).map((line, index) => (
                <span
                  key={`${line}-${index}`}
                  className={line.startsWith("PS>") ? "text-primary-600 dark:text-primary-400" : ""}
                >
                  {line}
                  {"\n"}
                </span>
              ))}
              {!ranProfile && <span className="text-dark-400">waiting for execution</span>}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
