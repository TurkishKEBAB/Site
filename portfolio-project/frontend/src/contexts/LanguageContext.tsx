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
    common_loading: 'Loading...',
    common_retry: 'Retry',
    common_all: 'All',
    blog_title_prefix: 'My',
    blog_title_highlight: 'Blog',
    blog_subtitle: 'Thoughts, tutorials, and insights about software development',
    blog_search_placeholder: 'Search posts...',
    blog_fetch_error: 'Unable to load posts right now.',
    blog_result: 'result',
    blog_results: 'results',
    blog_found: 'found',
    blog_empty: 'No posts found',
    blog_featured: 'Featured',
    blog_min_read: 'min read',
    blog_read_more: 'Read More ->',
    blog_post_not_found: 'Post not found.',
    blog_post_load_failed: 'Unable to load this blog post.',
    blog_back: '<- Back',
    blog_view_all_posts: 'View all posts',
    blog_views: 'views',
    blog_last_updated: 'Last updated',
    blog_back_to_blog: 'Back to Blog',
    blog_share: 'Share',
    blog_related_posts: 'Related Posts',
    blog_latest_posts: 'Latest Posts',
  },
  tr: {
    nav_home: 'Ana Sayfa',
    nav_about: 'Hakkimda',
    nav_projects: 'Projeler',
    nav_blog: 'Blog',
    nav_contact: 'Iletisim',
    nav_language: 'Dil',
    nav_theme: 'Tema',
    common_loading: 'Yukleniyor...',
    common_retry: 'Tekrar Dene',
    common_all: 'Tumu',
    blog_title_prefix: 'Benim',
    blog_title_highlight: 'Blogum',
    blog_subtitle: 'Yazilim gelistirme uzerine notlar, egitimler ve fikirler',
    blog_search_placeholder: 'Yazi ara...',
    blog_fetch_error: 'Yazilar su anda yuklenemiyor.',
    blog_result: 'sonuc',
    blog_results: 'sonuc',
    blog_found: 'bulundu',
    blog_empty: 'Yazi bulunamadi',
    blog_featured: 'One Cikan',
    blog_min_read: 'dk okuma',
    blog_read_more: 'Devamini Oku ->',
    blog_post_not_found: 'Yazi bulunamadi.',
    blog_post_load_failed: 'Bu yazi yuklenemedi.',
    blog_back: '<- Geri',
    blog_view_all_posts: 'Tum yazilari gor',
    blog_views: 'goruntulenme',
    blog_last_updated: 'Son guncelleme',
    blog_back_to_blog: 'Bloga Don',
    blog_share: 'Paylas',
    blog_related_posts: 'Benzer Yazilar',
    blog_latest_posts: 'Son Yazilar',
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
          { headers: { 'X-Skip-Language': true, 'X-Skip-Global-Error': true } },
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
