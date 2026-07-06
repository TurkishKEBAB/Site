"use client";

import { useEffect, useState } from "react";
import { FiCpu } from "react-icons/fi";

import type { NexusBackgroundMode } from "@/components/NexusBackground";

const modes: NexusBackgroundMode[] = ["nodes", "grid", "flow"];
const labels: Record<NexusBackgroundMode, string> = {
  nodes: "Nodes",
  grid: "Grid",
  flow: "Flow",
};
const MODE_STORAGE_KEY = "nexus:bg-mode";

const isNexusMode = (value: string | null): value is NexusBackgroundMode =>
  value === "nodes" || value === "grid" || value === "flow";

export default function BackgroundModeToggle() {
  const [mode, setMode] = useState<NexusBackgroundMode>("nodes");

  useEffect(() => {
    const savedMode = window.localStorage.getItem(MODE_STORAGE_KEY);
    if (isNexusMode(savedMode)) {
      setMode(savedMode);
    }
  }, []);

  const cycleMode = () => {
    const nextMode = modes[(modes.indexOf(mode) + 1) % modes.length];
    setMode(nextMode);
    window.dispatchEvent(new CustomEvent<NexusBackgroundMode>("nexus:bg-mode", { detail: nextMode }));
  };

  return (
    <button
      type="button"
      onClick={cycleMode}
      className="hidden lg:inline-flex h-9 items-center gap-2 rounded border border-gray-200 bg-white/80 px-2.5 font-mono text-[10px] uppercase tracking-wide text-gray-500 transition-colors hover:border-primary-400/50 hover:text-primary-600 dark:border-dark-600 dark:bg-dark-800/50 dark:text-dark-300 dark:hover:text-primary-400"
      aria-label={`BG ${labels[mode]} — background mode`}
      title={`Background mode: ${labels[mode]}`}
    >
      <FiCpu size={13} aria-hidden="true" />
      <span>BG</span>
      <span className="text-primary-600 dark:text-primary-400">{labels[mode]}</span>
    </button>
  );
}
