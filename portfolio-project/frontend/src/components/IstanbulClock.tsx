"use client";

import { useEffect, useState } from "react";
import { FiClock } from "react-icons/fi";

const formatIstanbulTime = () => {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Istanbul",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date());
  } catch {
    return new Date().toLocaleTimeString("en-GB", { hour12: false });
  }
};

export default function IstanbulClock() {
  const [time, setTime] = useState("--:--:--");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setTime(formatIstanbulTime());

    const timer = window.setInterval(() => {
      setTime(formatIstanbulTime());
    }, 1000);

    let collapseTimer: number | undefined;
    const reveal = window.setInterval(() => {
      setExpanded(true);
      if (collapseTimer) window.clearTimeout(collapseTimer);
      collapseTimer = window.setTimeout(() => setExpanded(false), 4200);
    }, 15000);

    return () => {
      window.clearInterval(timer);
      window.clearInterval(reveal);
      if (collapseTimer) window.clearTimeout(collapseTimer);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => setExpanded((current) => !current)}
      className="hidden xl:inline-flex h-9 items-center gap-2 overflow-hidden rounded border border-gray-200 bg-white/80 px-2.5 font-mono text-[10px] uppercase tracking-wide text-gray-500 transition-colors hover:border-primary-400/50 hover:text-primary-600 dark:border-dark-600 dark:bg-dark-800/50 dark:text-dark-300 dark:hover:text-primary-400"
      aria-label={`IST ${time} — Istanbul time`}
      title="Istanbul time"
    >
      <FiClock size={13} aria-hidden="true" />
      <span>IST</span>
      <span
        className={`text-primary-600 transition-[max-width,opacity] duration-300 dark:text-primary-400 ${
          expanded ? "max-w-20 opacity-100" : "max-w-0 opacity-0"
        }`}
      >
        {time}
      </span>
    </button>
  );
}
