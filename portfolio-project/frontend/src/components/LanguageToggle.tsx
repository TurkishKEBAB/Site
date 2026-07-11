"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FiGlobe } from "react-icons/fi";

import { type Locale } from "@/content/site";
import { useLanguage } from "@/contexts/LanguageContext";

const languages: Array<{ code: Locale; name: string; label: string }> = [
  { code: "en", name: "English", label: "EN" },
  { code: "tr", name: "Türkçe", label: "TR" },
];

export default function LanguageToggle() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleLanguageChange = (value: Locale) => {
    if (value !== language) {
      setLanguage(value);
    }
    setOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 rounded text-gray-500 dark:text-dark-300 hover:text-gray-900 dark:hover:text-dark-50 hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
        aria-label={t("navLanguage")}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <FiGlobe size={18} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-36 bg-white dark:bg-dark-800 rounded border border-gray-200 dark:border-dark-600 shadow-xl py-1 overflow-hidden"
          >
            {languages.map((item) => (
              <button
                key={item.code}
                role="menuitem"
                onClick={() => handleLanguageChange(item.code)}
                className={`w-full px-4 py-2 text-left flex items-center justify-between font-mono text-xs tracking-wide transition-colors ${
                  language === item.code
                    ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-400/10"
                    : "text-gray-600 dark:text-dark-300 hover:bg-gray-50 dark:hover:bg-dark-700"
                }`}
              >
                <span>{item.name}</span>
                <span className="font-semibold">{item.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
