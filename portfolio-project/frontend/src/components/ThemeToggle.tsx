"use client";

import { useEffect, useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";

import { useLanguage } from "@/contexts/LanguageContext";

export default function ThemeToggle() {
  const [isReady, setIsReady] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const theme = isDark ? "dark" : "light";
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark, isReady]);

  return (
    <button
      onClick={() => setIsDark((prev) => !prev)}
      className="p-2 rounded text-gray-500 dark:text-dark-300 hover:text-gray-900 dark:hover:text-dark-50 hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
      aria-label={t("navTheme")}
    >
      {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
    </button>
  );
}
