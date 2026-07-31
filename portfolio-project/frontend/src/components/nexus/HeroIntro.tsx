"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const ROLES = ["ENTERPRISE BACKEND", "CLOUD & DEVOPS", "QUALITY AUTOMATION"];
// Give each role a readable beat while keeping the full intro under four seconds.
const ROLE_HOLD_MS = 850;
const ROLE_GAP_MS = 200;
const EXIT_MS = 140;
const HYDRATION_ATTRIBUTE = "data-hero-intro-hydrated";
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Cinematic intro overlay (design's hero intro). On the first public route visit
 * of a session it covers the page and reveals each role title in turn, then lifts.
 * Skipped under prefers-reduced-motion or once seen (sessionStorage). Click to skip.
 */
export default function HeroIntro() {
  // Render the overlay in the server markup so the homepage cannot paint before
  // the client has had a chance to read sessionStorage and start the intro.
  const [active, setActive] = useState(true);
  const [index, setIndex] = useState(0);
  const [wordShown, setWordShown] = useState(false);
  const [out, setOut] = useState(false);
  const finishRef = useRef<() => void>(() => {});

  useIsomorphicLayoutEffect(() => {
    document.documentElement.setAttribute(HYDRATION_ATTRIBUTE, "true");

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      sessionStorage.getItem("nx-intro-done")
    ) {
      setActive(false);
      return () => document.documentElement.removeAttribute(HYDRATION_ATTRIBUTE);
    }

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    const computedPaddingRight = Number.parseFloat(window.getComputedStyle(document.body).paddingRight) || 0;
    const paddingCompensated = scrollbarWidth > 0;
    let overflowRestored = false;
    const restoreOverflow = () => {
      if (overflowRestored) return;
      overflowRestored = true;
      document.body.style.overflow = previousOverflow;
      if (paddingCompensated) {
        document.body.style.paddingRight = previousPaddingRight;
      }
    };
    document.body.style.overflow = "hidden";
    if (paddingCompensated) {
      document.body.style.paddingRight = `${computedPaddingRight + scrollbarWidth}px`;
    }

    let cursor = 0;
    let cancelled = false;
    const timers: Array<ReturnType<typeof setTimeout>> = [];
    const wait = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));

    const finish = () => {
      if (cancelled) return;
      cancelled = true;
      sessionStorage.setItem("nx-intro-done", "1");
      setOut(true);
      wait(EXIT_MS, () => {
        setActive(false);
        restoreOverflow();
      });
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
      restoreOverflow();
      document.documentElement.removeAttribute(HYDRATION_ATTRIBUTE);
    };
  }, []);

  if (!active) return null;

  return (
    <>
      <noscript>
        <style>{".nx-hero-intro { display: none !important; }"}</style>
      </noscript>
      <button
      type="button"
      aria-label="Skip intro"
      onClick={() => finishRef.current()}
      className={`nx-hero-intro fixed inset-0 z-[90] grid w-full cursor-pointer place-items-center bg-[#f4f4f8] transition-opacity duration-500 dark:bg-dark-950 ${
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
      <span className="absolute bottom-10 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-dark-400">
        click to skip
      </span>
      </button>
    </>
  );
}
