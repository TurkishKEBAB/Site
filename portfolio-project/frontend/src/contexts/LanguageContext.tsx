import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import api, { apiEndpoints } from '../services/api';

export type Language = 'en' | 'tr';

type TranslationMap = Record<string, string>;

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  translations: TranslationMap;
  t: (key: string) => string;
  isLoading: boolean;
}

const FALLBACK_TRANSLATIONS: Record<Language, TranslationMap> = {
  en: {
    nav_home: 'Home',
    nav_about: 'About',
    nav_projects: 'Projects',
    nav_blog: 'Blog',
    nav_contact: 'Contact',
    nav_language: 'Language',
    nav_theme: 'Theme',
  },
  tr: {
    nav_home: 'Ana Sayfa',
    nav_about: 'Hakkimda',
    nav_projects: 'Projeler',
    nav_blog: 'Blog',
    nav_contact: 'Iletisim',
    nav_language: 'Dil',
    nav_theme: 'Tema',
  },
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const resolveInitialLanguage = (): Language => {
  const stored = localStorage.getItem('lang');
  if (stored === 'tr' || stored === 'en') {
    return stored;
  }
  return 'en';
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(resolveInitialLanguage);
  const [translations, setTranslations] = useState<TranslationMap>(
    FALLBACK_TRANSLATIONS[resolveInitialLanguage()],
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('lang', language);
  }, [language]);

  useEffect(() => {
    let isActive = true;

    const loadTranslations = async () => {
      setIsLoading(true);
      try {
        const response = await api.get<TranslationMap>(
          apiEndpoints.translations.byLanguage(language),
          { headers: { 'X-Skip-Language': true } },
        );

        if (!isActive) {
          return;
        }

        setTranslations({
          ...FALLBACK_TRANSLATIONS[language],
          ...(response.data || {}),
        });
      } catch (error) {
        if (isActive) {
          setTranslations(FALLBACK_TRANSLATIONS[language]);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadTranslations();

    return () => {
      isActive = false;
    };
  }, [language]);

  const setLanguage = (value: Language) => {
    setLanguageState(value);
  };

  const t = useMemo(
    () => (key: string) =>
      translations[key] || FALLBACK_TRANSLATIONS[language][key] || key,
    [language, translations],
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translations, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
