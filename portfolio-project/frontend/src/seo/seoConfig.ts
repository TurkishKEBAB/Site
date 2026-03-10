import type { Language } from '../contexts/LanguageContext'

export interface SeoConfig {
  title: string
  description: string
  keywords: string
  canonicalPath: string
}

const SITE_NAME = 'Yigit Okur'

type LocalizedMeta = {
  title: string
  description: string
}

const META: Record<string, Record<Language, LocalizedMeta>> = {
  '/': {
    en: {
      title: `${SITE_NAME} | Software Engineer - Cloud & DevOps`,
      description:
        'Portfolio of Yigit Okur focused on enterprise backend systems, cloud-native architecture, DevOps automation, and high-impact engineering projects.',
    },
    tr: {
      title: `${SITE_NAME} | Software Engineer - Cloud & DevOps`,
      description:
        "Yigit Okur'un enterprise backend sistemleri, cloud-native mimari, DevOps otomasyonu ve yuksek etkili muhendislik projelerini iceren portfolyosu.",
    },
  },
  '/about': {
    en: {
      title: `About | ${SITE_NAME}`,
      description:
        'Software engineering journey of Yigit Okur including enterprise internship impact, system design depth, and technical leadership.',
    },
    tr: {
      title: `Hakkimda | ${SITE_NAME}`,
      description:
        "Yigit Okur'un kurumsal staj etkisi, sistem tasarimi birikimi ve teknik liderlik yolculugu.",
    },
  },
  '/projects': {
    en: {
      title: `Projects | ${SITE_NAME}`,
      description:
        'Selected projects including IsikSchedule, Agentic IDE, Teknofest Sarkan UAV, and production-focused full-stack engineering work.',
    },
    tr: {
      title: `Projeler | ${SITE_NAME}`,
      description:
        'IsikSchedule, Agentic IDE, Teknofest Sarkan UAV ve urun odakli full-stack muhendislik calismalarini kapsayan secili projeler.',
    },
  },
  '/blog': {
    en: {
      title: `Blog | ${SITE_NAME}`,
      description:
        'Engineering notes, practical guides, and insights on software architecture, cloud, and DevOps.',
    },
    tr: {
      title: `Blog | ${SITE_NAME}`,
      description:
        'Yazilim mimarisi, cloud ve DevOps odakli muhendislik notlari, pratik rehberler ve icgoruler.',
    },
  },
  '/contact': {
    en: {
      title: `Contact | ${SITE_NAME}`,
      description:
        'Contact Yigit Okur for software engineering collaboration, cloud/backend projects, and technical discussions.',
    },
    tr: {
      title: `Iletisim | ${SITE_NAME}`,
      description:
        'Yazilim muhendisligi is birlikleri, cloud/backend projeleri ve teknik gorusmeler icin Yigit Okur ile iletisime gecin.',
    },
  },
  '/login': {
    en: {
      title: `Admin Login | ${SITE_NAME}`,
      description: 'Admin access portal for portfolio management.',
    },
    tr: {
      title: `Admin Girisi | ${SITE_NAME}`,
      description: 'Portfolyo yonetimi icin admin erisim portali.',
    },
  },
  '/admin': {
    en: {
      title: `Admin Panel | ${SITE_NAME}`,
      description: 'Portfolio content management dashboard.',
    },
    tr: {
      title: `Admin Paneli | ${SITE_NAME}`,
      description: 'Portfolyo icerik yonetim paneli.',
    },
  },
  '/404': {
    en: {
      title: `Page Not Found | ${SITE_NAME}`,
      description: 'The requested page could not be found.',
    },
    tr: {
      title: `Sayfa Bulunamadi | ${SITE_NAME}`,
      description: 'Istenen sayfa bulunamadi.',
    },
  },
}

const DEFAULT_KEYWORDS =
  'Yigit Okur, Software Engineer, Cloud DevOps, Backend Engineer, Java Spring Boot, FastAPI, React, Next.js, PostgreSQL, CI/CD, Portfolio'

const normalizePath = (pathname: string): string => {
  if (pathname.startsWith('/blog/')) {
    return '/blog'
  }

  if (pathname.startsWith('/admin')) {
    return '/admin'
  }

  if (Object.prototype.hasOwnProperty.call(META, pathname)) {
    return pathname
  }

  return '/404'
}

export const getSeoConfig = (pathname: string, language: Language): SeoConfig => {
  const key = normalizePath(pathname)
  const localized = META[key][language]

  return {
    title: localized.title,
    description: localized.description,
    keywords: DEFAULT_KEYWORDS,
    canonicalPath: key === '/404' ? pathname : key,
  }
}
