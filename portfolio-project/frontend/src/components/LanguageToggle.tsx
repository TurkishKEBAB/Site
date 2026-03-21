"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { FiGlobe } from "react-icons/fi";

import { type Locale } from "@/content/site";
import { useLanguage } from "@/contexts/LanguageContext";

const languages: Array<{ code: Locale; name: string; label: string }> = [
  { code: "en", name: "English", label: "EN" },
  { code: "tr", name: "Turkce", label: "TR" },
];

export default function LanguageToggle() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (value: Locale) => {
    setLanguage(value);
    setOpen(false);
    router.refresh();
  };

  return (
    <div className="relative hidden md:block">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 rounded text-gray-500 dark:text-dark-300 hover:text-gray-900 dark:hover:text-dark-50 hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
        aria-label={t("navLanguage")}
      >
        <FiGlobe size={18} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-36 bg-white dark:bg-dark-800 rounded border border-gray-200 dark:border-dark-600 shadow-xl py-1 overflow-hidden"
          >
            {languages.map((item) => (
              <button
                key={item.code}
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
