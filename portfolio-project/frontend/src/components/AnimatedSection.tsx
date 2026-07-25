"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  animateOnEnter?: boolean;
}

export default function AnimatedSection({
  children,
  className,
  delay = 0,
  y = 16,
  animateOnEnter = false,
}: AnimatedSectionProps) {
  return (
    <motion.div
      initial={animateOnEnter ? { opacity: 0, y } : false}
      whileInView={animateOnEnter ? { opacity: 1, y: 0 } : undefined}
      viewport={animateOnEnter ? { once: true, margin: "-60px" } : undefined}
      transition={animateOnEnter ? { duration: 0.45, delay } : undefined}
      className={className}
    >
      {children}
    </motion.div>
  );
}
