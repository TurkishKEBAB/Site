import type { Language } from '../contexts/LanguageContext'

export interface SeoConfig {
  title: string
  description: string
  keywords: string
  canonicalPath: string
}

const SITE_NAME = 'Yigit Okur Portfolio'

type LocalizedMeta = {
  title: string
  description: string
}

const META: Record<string, Record<Language, LocalizedMeta>> = {
  '/': {
    en: {
      title: `${SITE_NAME} | Cloud & DevOps Engineer`,
      description: 'Portfolio of Yigit Okur focused on cloud platforms, DevOps, backend systems, and software engineering projects.',
    },
    tr: {
      title: `${SITE_NAME} | Cloud ve DevOps Muhendisi`,
      description: 'Yigit Okur’un bulut platformlari, DevOps, backend sistemleri ve yazilim projelerini iceren portfolyosu.',
    },
  },
  '/about': {
    en: {
      title: `About | ${SITE_NAME}`,
      description: 'Experience, technical background, and leadership journey of Yigit Okur in software engineering.',
    },
    tr: {
      title: `Hakkimda | ${SITE_NAME}`,
      description: 'Yigit Okur’un yazilim muhendisligi deneyimi, teknik birikimi ve liderlik yolculugu.',
    },
  },
  '/projects': {
    en: {
      title: `Projects | ${SITE_NAME}`,
      description: 'Selected software, cloud, and DevOps projects with architecture decisions, technologies, and outcomes.',
    },
    tr: {
      title: `Projeler | ${SITE_NAME}`,
      description: 'Mimari kararlar, kullanilan teknolojiler ve sonuclar ile secili yazilim, cloud ve DevOps projeleri.',
    },
  },
  '/blog': {
    en: {
      title: `Blog | ${SITE_NAME}`,
      description: 'Engineering notes, practical guides, and insights on software architecture, cloud, and DevOps.',
    },
    tr: {
      title: `Blog | ${SITE_NAME}`,
      description: 'Yazilim mimarisi, cloud ve DevOps odakli muhendislik notlari, pratik rehberler ve icgoruler.',
    },
  },
  '/contact': {
    en: {
      title: `Contact | ${SITE_NAME}`,
      description: 'Contact Yigit Okur for collaboration, freelance work, internship opportunities, or technical discussions.',
    },
    tr: {
      title: `Iletisim | ${SITE_NAME}`,
      description: 'Is birligi, freelance calisma, staj firsatlari veya teknik gorusmeler icin Yigit Okur ile iletisime gecin.',
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
  'Yigit Okur, DevOps Engineer, Cloud Engineer, Software Engineer, FastAPI, React, Portfolio, AWS, Docker, Kubernetes'

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
