"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

import { defaultLocale, localeCookieName, type Locale, uiDictionary } from "@/content/site";

type TranslationMap = typeof uiDictionary.en;

interface LanguageContextValue {
  language: Locale;
  setLanguage: (language: Locale) => void;
  t: (key: keyof TranslationMap) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
  initialLanguage: Locale;
}

const readCookieLanguage = (): Locale | null => {
  if (typeof document === "undefined") {
    return null;
  }

  const cookieEntry = document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find(
      (entry) =>
        entry.startsWith(`${localeCookieName}=`) || entry.startsWith("lang="),
    );

  if (!cookieEntry) {
    return null;
  }

  const [, value = ""] = cookieEntry.split("=");
  return value === "tr" ? "tr" : value === "en" ? "en" : null;
};

export function LanguageProvider({
  children,
  initialLanguage,
}: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Locale>(initialLanguage);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedLanguage = window.localStorage.getItem("lang");
    const cookieLanguage = readCookieLanguage();
    const resolvedLanguage =
      storedLanguage === "tr" || storedLanguage === "en"
        ? storedLanguage
        : cookieLanguage ?? initialLanguage ?? defaultLocale;

    if (resolvedLanguage !== language) {
      setLanguageState(resolvedLanguage);
      return;
    }

    document.documentElement.lang = resolvedLanguage;
  }, [initialLanguage, language]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem("lang", language);
    document.cookie = `${localeCookieName}=${language}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (value: Locale) => {
    setLanguageState(value);
  };

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key) => uiDictionary[language][key] ?? uiDictionary.en[key],
    }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return context;
};
