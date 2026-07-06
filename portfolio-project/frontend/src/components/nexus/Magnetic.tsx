"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";

interface MagneticProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

/**
 * Magnetic wrapper (design idea #10): nudges its contents toward the cursor.
 * Wraps a single interactive element (button/link). No-ops under
 * prefers-reduced-motion or on non-hover (touch) devices.
 */
export default function Magnetic({ children, className = "", strength = 0.22 }: MagneticProps) {
  const ref = useRef<HTMLSpanElement>(null);

  const onMove = (event: MouseEvent<HTMLSpanElement>) => {
    const el = ref.current;
    if (!el) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !window.matchMedia("(hover: hover)").matches
    ) {
      return;
    }
    const rect = el.getBoundingClientRect();
    const mx = event.clientX - (rect.left + rect.width / 2);
    const my = event.clientY - (rect.top + rect.height / 2);
    el.style.transform = `translate(${mx * strength}px, ${my * strength * 1.45}px)`;
  };

  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <span
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`inline-flex transition-transform duration-200 ease-out will-change-transform ${className}`}
    >
      {children}
    </span>
  );
}
