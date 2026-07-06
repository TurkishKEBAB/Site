"use client";

import { useEffect, useRef, useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>._#";

interface ScrambleHeadingProps {
  text: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
}

/**
 * Decrypt/scramble heading (design idea #9). Renders the real text on the
 * server and on first paint (so SSR + hydration are stable), then runs a
 * one-shot character-resolve animation when it scrolls into view.
 */
export default function ScrambleHeading({ text, as = "h2", className = "" }: ScrambleHeadingProps) {
  const [display, setDisplay] = useState(text);
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setDisplay(text);
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let interval: ReturnType<typeof setInterval> | undefined;
    let started = false;

    const run = () => {
      if (started) return;
      started = true;
      const final = text;
      const length = final.length;
      interval = setInterval(() => {
        frame += 1;
        const reveal = Math.floor(frame / 1.6);
        let out = "";
        for (let i = 0; i < length; i += 1) {
          if (final[i] === " ") {
            out += " ";
            continue;
          }
          out += i < reveal ? final[i] : CHARS[Math.floor(Math.random() * CHARS.length)];
        }
        setDisplay(out);
        if (reveal >= length) {
          if (interval) clearInterval(interval);
          setDisplay(final);
        }
      }, 26);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            run();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.45 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      if (interval) clearInterval(interval);
    };
  }, [text]);

  const Tag = as;
  return (
    <Tag ref={ref} data-text={text} className={className}>
      {display}
    </Tag>
  );
}
