"use client";

import { createContext, ReactNode, useContext, useMemo, useState } from "react";

import { localeCookieName, type Locale, uiDictionary } from "@/content/site";

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

export function LanguageProvider({
  children,
  initialLanguage,
}: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Locale>(initialLanguage);

  const setLanguage = (value: Locale) => {
    setLanguageState(value);

    if (typeof window !== "undefined") {
      localStorage.setItem("lang", value);
      document.cookie = `${localeCookieName}=${value}; path=/; max-age=31536000; samesite=lax`;
    }
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
