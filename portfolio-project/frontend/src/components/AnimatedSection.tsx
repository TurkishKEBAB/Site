"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}

export default function AnimatedSection({
  children,
  className,
  delay = 0,
  y = 16,
}: AnimatedSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
