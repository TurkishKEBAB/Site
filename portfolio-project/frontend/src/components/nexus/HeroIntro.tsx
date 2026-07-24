"use client";

import { useEffect, useRef, useState } from "react";

const ROLES = ["ENTERPRISE BACKEND", "CLOUD & DEVOPS", "QUALITY AUTOMATION"];
const ROLE_HOLD_MS = 420;
const ROLE_GAP_MS = 100;
const EXIT_MS = 260;

/**
 * Non-blocking first-visit status chip. It keeps the page visible and scrollable
 * while briefly cycling through the profile signals.
 */
export default function HeroIntro() {
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [wordShown, setWordShown] = useState(false);
  const [out, setOut] = useState(false);
  const finishRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    if (sessionStorage.getItem("nx-intro-done")) return undefined;

    setActive(true);

    let cursor = 0;
    let cancelled = false;
    const timers: Array<ReturnType<typeof setTimeout>> = [];
    const wait = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));

    const finish = () => {
      if (cancelled) return;
      cancelled = true;
      sessionStorage.setItem("nx-intro-done", "1");
      setOut(true);
      wait(EXIT_MS, () => setActive(false));
    };
    finishRef.current = finish;

    const step = () => {
      if (cancelled) return;
      if (cursor >= ROLES.length) {
        finish();
        return;
      }
      setIndex(cursor);
      setWordShown(false);
      wait(40, () => setWordShown(true));
      wait(ROLE_HOLD_MS, () => {
        setWordShown(false);
        cursor += 1;
        wait(ROLE_GAP_MS, step);
      });
    };
    step();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  if (!active) return null;

  return (
    <button
      type="button"
      aria-label="Skip intro"
      onClick={() => finishRef.current()}
      className={`fixed bottom-5 left-1/2 z-[90] grid w-[min(90vw,28rem)] -translate-x-1/2 cursor-pointer place-items-center overflow-hidden rounded border border-gray-200 bg-white/95 px-5 py-4 shadow-lg transition-opacity duration-300 dark:border-dark-600 dark:bg-dark-950/95 ${
        out ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <span className="absolute inset-0 bg-glow-radial-light dark:bg-glow-radial" aria-hidden="true" />
      <span className="relative block w-full max-w-[1000px] px-6 text-center">
        <span className="mb-9 block font-mono text-[11px] uppercase tracking-[0.3em] text-gray-400 dark:text-dark-400">
          SYSTEM.PROFILE · <b className="font-medium text-primary-600 dark:text-primary-400">v2026</b>
        </span>
        <span
          className={`block font-display text-[clamp(2.2rem,8vw,5.6rem)] font-bold leading-none tracking-[-0.035em] text-gray-900 transition-all duration-[350ms] dark:text-dark-50 ${
            wordShown ? "translate-y-0 opacity-100" : "translate-y-[18px] opacity-0"
          }`}
        >
          {ROLES[index]}
          <span
            className={`mx-auto mt-[18px] block h-[3px] bg-primary-400 transition-[width] duration-[900ms] ${
              wordShown ? "w-16" : "w-0"
            }`}
          />
        </span>
        <span className="mt-10 block font-mono text-xs tracking-[0.2em] text-gray-400 dark:text-dark-400">
          <b className="text-primary-600 dark:text-primary-400">0{index + 1}</b> / 0{ROLES.length}
        </span>
        <span className="relative mx-auto mt-4 block h-px w-44 overflow-hidden bg-gray-200 dark:bg-dark-600">
          <span
            className="absolute inset-y-0 left-0 bg-primary-400 transition-[width] duration-500"
            style={{ width: `${((index + 1) / ROLES.length) * 100}%` }}
          />
        </span>
      </span>
      <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-[0.2em] text-gray-400 dark:text-dark-400">
        click to skip
      </span>
    </button>
  );
}
