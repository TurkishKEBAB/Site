export type Locale = "en" | "tr";

export type LocalizedString = Record<Locale, string>;

export interface ImpactMetric {
  value: string;
  label: LocalizedString;
  note: LocalizedString;
}

export interface SkillGroup {
  title: LocalizedString;
  summary: LocalizedString;
  skills: string[];
}

export interface ProjectRecord {
  slug: string;
  title: LocalizedString;
  summary: LocalizedString;
  description: LocalizedString;
  impact: LocalizedString;
  technologies: string[];
  githubUrl?: string;
  demoUrl?: string;
  featured: boolean;
}

export const defaultLocale: Locale = "en";
export const localeCookieName = "preferred-locale";

export const siteConfig = {
  name: "Yigit Okur",
  role: "Software Engineer",
  focus: "Cloud & DevOps",
  siteUrl: "https://yigitokur.me",
  email: "yigitokur@ieee.org",
  phone: "+90 535 573 3873",
  phoneHref: "tel:+905355733873",
  location: {
    en: "Istanbul, Turkey",
    tr: "Istanbul, Turkiye",
  },
  github: "https://github.com/TurkishKEBAB",
  linkedin: "https://www.linkedin.com/in/yigit-okur-050b5b278",
  twitter: "https://x.com/biznedenokuruz",
  profileImage: "/profile.jpg",
  profileFallbackImage: "/profile-placeholder.png",
  ogImage: "/opengraph-image",
};

export const uiDictionary = {
  en: {
    navHome: "Home",
    navAbout: "About",
    navProjects: "Projects",
    navBlog: "Blog",
    navContact: "Contact",
    navLanguage: "Language",
    navTheme: "Theme",
    footerNavigation: "Navigation",
    footerContact: "Contact",
    footerAvailability: "Open to engineering collaborations",
    footerStack: "Next.js / React / Tailwind CSS",
    contactCopy: "Copy message",
    contactCopied: "Copied",
    contactMailFallback: "Open email draft",
    contactRetry: "Try again",
    blogUnavailableTitle: "Blog is temporarily unavailable",
    blogUnavailableBody:
      "The public site still loads from repo-canonical content, but blog posts depend on the API right now.",
    blogBackToProjects: "View projects",
    blogBackToAbout: "View profile",
    loginBackHome: "Back to home",
    notFoundTitle: "Page not found",
    notFoundBody:
      "This route does not exist on the new public surface. The core profile content is available below.",
    notFoundAction: "Return home",
  },
  tr: {
    navHome: "Ana Sayfa",
    navAbout: "Hakkimda",
    navProjects: "Projeler",
    navBlog: "Blog",
    navContact: "Iletisim",
    navLanguage: "Dil",
    navTheme: "Tema",
    footerNavigation: "Navigasyon",
    footerContact: "Iletisim",
    footerAvailability: "Muhendislik is birliklerine acik",
    footerStack: "Next.js / React / Tailwind CSS",
    contactCopy: "Mesaji kopyala",
    contactCopied: "Kopyalandi",
    contactMailFallback: "E-posta taslagi ac",
    contactRetry: "Tekrar dene",
    blogUnavailableTitle: "Blog gecici olarak ulasilamiyor",
    blogUnavailableBody:
      "Public site repo-iceriginden yuklenmeye devam ediyor, ancak blog yazilari simdilik API bagimli.",
    blogBackToProjects: "Projeleri gor",
    blogBackToAbout: "Profili gor",
    loginBackHome: "Ana sayfaya don",
    notFoundTitle: "Sayfa bulunamadi",
    notFoundBody:
      "Bu rota yeni public yuzeyde bulunmuyor. Asagidaki temel profil icerigine donebilirsiniz.",
    notFoundAction: "Ana sayfaya don",
  },
} satisfies Record<Locale, Record<string, string>>;

export const homeContent = {
  en: {
    heroEyebrow: "> init system.profile",
    heroTitleFirst: "YIGIT",
    heroTitleSecond: "OKUR",
    heroDescription:
      "I build enterprise backend systems, cloud-native workflows, and AI-native tooling while studying Software Engineering at Isik University. My strongest case study comes from NETAS, where I traced a silent timezone defect across production microservices and turned it into a documented regression safety net.",
    availabilityLabel: "Available for part-time cloud and backend roles",
    availabilityNote: "Open to engineering collaborations and high-ownership internships",
    primaryCta: "Get in touch",
    secondaryCta: "Download CV",
    tertiaryCta: "View projects",
    overviewLabel: "Overview",
    overviewTitle: "Impact-first profile",
    skillsLabel: "Capabilities",
    skillsTitle: "Technical system",
    skillsSubtitle:
      "Grouped by the stacks I actually use to ship backend, cloud, observability, and product work.",
    projectsLabel: "Featured work",
    projectsTitle: "Selected projects",
    projectsSubtitle:
      "A focused set of systems that represent product scale, technical depth, and delivery ownership.",
    ctaLabel: "Contact",
    ctaTitle: "Let's build something sharp",
    ctaBody:
      "If you want to discuss backend systems, cloud architecture, DevOps automation, or AI-native workflows, I am happy to connect.",
    scroll: "Scroll",
    roleParts: ["BACKEND SYSTEMS", "CLOUD & DEVOPS", "AI-NATIVE TOOLING"],
    overviewCards: [
      {
        title: "NETAS timezone investigation",
        body:
          "Identified a silent v1/v2 timezone mismatch via YAML and ELK analysis, then documented the remediation path with 600+ lines of tests.",
      },
      {
        title: "IsikSchedule product maturity",
        body:
          "Built a shared scheduling core spanning desktop and web, with roughly 1,000 active users and a 13-algorithm optimization engine.",
      },
      {
        title: "IEEE and AdaLab leadership",
        body:
          "Blend delivery, community leadership, and research support through IEEE Isik and AdaLab responsibilities.",
      },
    ],
  },
  tr: {
    heroEyebrow: "> sistem.profil baslatiliyor",
    heroTitleFirst: "YIGIT",
    heroTitleSecond: "OKUR",
    heroDescription:
      "Isik Universitesi'nde Yazilim Muhendisligi egitimime devam ederken enterprise backend sistemleri, cloud-native workflow'lar ve AI-native tooling uzerine uretim yapiyorum. En guclu case study'm NETAS'ta canli mikroservislerde sessizce kalan timezone defect'ini izleyip kalici regression guvencesine cevirmemdi.",
    availabilityLabel: "Part-time cloud ve backend rollerine acigim",
    availabilityNote: "Yuksek sahiplik gerektiren muhendislik is birlikleri ve stajlara acigim",
    primaryCta: "Iletisime gec",
    secondaryCta: "CV indir",
    tertiaryCta: "Projeleri gor",
    overviewLabel: "Genel bakis",
    overviewTitle: "Etki odakli profil",
    skillsLabel: "Yetkinlikler",
    skillsTitle: "Teknik sistemim",
    skillsSubtitle:
      "Backend, cloud, observability ve urun teslimi icin gercekte kullandigim teknoloji gruplari.",
    projectsLabel: "One cikan isler",
    projectsTitle: "Secili projeler",
    projectsSubtitle:
      "Urun olgunlugu, teknik derinlik ve teslim sorumlulugunu birlikte gosteren odakli bir proje secimi.",
    ctaLabel: "Iletisim",
    ctaTitle: "Birlikte keskin bir seyler uretelim",
    ctaBody:
      "Backend sistemleri, cloud mimarisi, DevOps otomasyonu veya AI-native workflow'lar konusmak istersen baglanabiliriz.",
    scroll: "Kaydir",
    roleParts: ["BACKEND SYSTEMS", "CLOUD & DEVOPS", "AI-NATIVE TOOLING"],
    overviewCards: [
      {
        title: "NETAS timezone incelemesi",
        body:
          "YAML ve ELK analiziyle sessiz kalan v1/v2 timezone uyumsuzlugunu tespit ettim; cozum yolunu 600+ satir test ile kalici hale getirdim.",
      },
      {
        title: "IsikSchedule urun olgunlugu",
        body:
          "Masaustu ve web urunlerini paylasilan scheduling core uzerinde birlestirdim; yaklasik 1.000 aktif kullaniciya ve 13 algoritmali optimizasyon motoruna ulasti.",
      },
      {
        title: "IEEE ve AdaLab liderligi",
        body:
          "IEEE Isik ve AdaLab sorumluluklariyla teknik teslim, topluluk liderligi ve arastirma destegini birlikte yuruttum.",
      },
    ],
  },
} satisfies Record<
  Locale,
  {
    heroEyebrow: string;
    heroTitleFirst: string;
    heroTitleSecond: string;
    heroDescription: string;
    availabilityLabel: string;
    availabilityNote: string;
    primaryCta: string;
    secondaryCta: string;
    tertiaryCta: string;
    overviewLabel: string;
    overviewTitle: string;
    skillsLabel: string;
    skillsTitle: string;
    skillsSubtitle: string;
    projectsLabel: string;
    projectsTitle: string;
    projectsSubtitle: string;
    ctaLabel: string;
    ctaTitle: string;
    ctaBody: string;
    scroll: string;
    roleParts: string[];
    overviewCards: Array<{ title: string; body: string }>;
  }
>;

export const impactMetrics: ImpactMetric[] = [
  {
    value: "~1,000",
    label: {
      en: "active users reached",
      tr: "aktif kullaniciya eristi",
    },
    note: {
      en: "Desktop deployment of IsikSchedule",
      tr: "IsikSchedule masaustu dagitimi",
    },
  },
  {
    value: "13",
    label: {
      en: "optimization algorithms",
      tr: "optimizasyon algoritmasi",
    },
    note: {
      en: "Shared scheduling engine",
      tr: "Paylasilan scheduling motoru",
    },
  },
  {
    value: "3 / 700+",
    label: {
      en: "preliminary ranking",
      tr: "on degerlendirme sirasi",
    },
    note: {
      en: "Teknofest Sarkan UAV",
      tr: "Teknofest Sarkan IHA",
    },
  },
];

export const skillGroups: SkillGroup[] = [
  {
    title: {
      en: "Backend and architecture",
      tr: "Backend ve mimari",
    },
    summary: {
      en: "Production-focused APIs, modular services, and clean system boundaries.",
      tr: "Production odakli API'ler, moduler servisler ve temiz sistem sinirlari.",
    },
    skills: ["Java", "Spring Boot", "Python", "FastAPI", "REST APIs", "Microservices", "Clean Architecture", "JWT / RBAC"],
  },
  {
    title: {
      en: "Cloud and observability",
      tr: "Cloud ve observability",
    },
    summary: {
      en: "Deploy, diagnose, and stabilize distributed systems.",
      tr: "Dagitik sistemleri deploy etme, izleme ve stabil hale getirme.",
    },
    skills: ["Docker", "Kubernetes", "GitHub Actions", "AWS EC2", "AWS S3", "Redis", "ElasticSearch", "Kibana", "RabbitMQ"],
  },
  {
    title: {
      en: "Product and interface layer",
      tr: "Urun ve arayuz katmani",
    },
    summary: {
      en: "Enough frontend fluency to ship end-to-end experiences without losing system quality.",
      tr: "Sistem kalitesini kaybetmeden uctan uca deneyim cikarmaya yetecek kadar frontend yetkinligi.",
    },
    skills: ["TypeScript", "React", "Next.js", "Tailwind CSS", "Electron", "Monaco Editor"],
  },
  {
    title: {
      en: "Testing and automation",
      tr: "Test ve otomasyon",
    },
    summary: {
      en: "Test-first debugging and reliable delivery pipelines.",
      tr: "Test-first debugging ve guvenilir teslim pipeline'lari.",
    },
    skills: ["Pytest", "JUnit", "CI/CD", "SonarQube", "Defect Tracking", "Regression Design"],
  },
];

export const projectRecords: ProjectRecord[] = [
  {
    slug: "isikschedule-platform",
    title: {
      en: "IsikSchedule Platform",
      tr: "IsikSchedule Platformu",
    },
    summary: {
      en: "Constraint-aware scheduling system spanning desktop and web products.",
      tr: "Masaustu ve web urunlerini kapsayan constraint-aware scheduling sistemi.",
    },
    description: {
      en: "Built a shared scheduling domain that powers both desktop and web experiences. The engine combines hard constraints with preference optimization and ships with 13 algorithms including Genetic, SA, Tabu, PSO, and hybrid strategies.",
      tr: "Masaustu ve web deneyimlerini besleyen paylasilan scheduling domain'ini kurdum. Motor; hard constraint'leri, tercih optimizasyonunu ve Genetik, SA, Tabu, PSO ile hibrit stratejiler dahil 13 algoritmayi birlestiriyor.",
    },
    impact: {
      en: "~1,000 active users on desktop release with ongoing web productization.",
      tr: "Masaustu surumunde ~1.000 aktif kullanici ve devam eden web urunlestirme sureci.",
    },
    technologies: ["FastAPI", "Next.js", "PostgreSQL", "Redis", "Celery", "Docker", "PyQt6"],
    githubUrl: "https://github.com/TurkishKEBAB/isikschedule-core",
    demoUrl: "https://github.com/TurkishKEBAB/isikschedule-web",
    featured: true,
  },
  {
    slug: "teknofest-sarkan-uav-defense-platform",
    title: {
      en: "Teknofest Sarkan UAV Defense Platform",
      tr: "Teknofest Sarkan IHA Savunma Platformu",
    },
    summary: {
      en: "Telemetry reliability and anti-jamming software for a defense UAV platform.",
      tr: "Savunma odakli IHA platformu icin telemetri guvenilirligi ve anti-jamming yazilimi.",
    },
    description: {
      en: "Led telemetry software and cross-team coordination for a defense UAV effort. The project ranked 3rd among 700+ proposals in preliminary evaluation while carrying real delivery and sponsorship pressure.",
      tr: "Savunma odakli IHA calismasinda telemetri yazilimi ve takimlar arasi koordinasyona liderlik ettim. Proje, gercek teslim ve sponsorluk baskisi altinda on degerlendirmede 700+ basvuru arasinda 3. oldu.",
    },
    impact: {
      en: "Managed a 200,000 TL budget including a 165,000 TL TUBITAK R&D grant.",
      tr: "165.000 TL TUBITAK Ar-Ge hibesi dahil toplam 200.000 TL butce yonetildi.",
    },
    technologies: ["Python", "Telemetry", "Systems Design", "Team Coordination"],
    featured: true,
  },
  {
    slug: "agentic-ide-thesis-project",
    title: {
      en: "Agentic IDE",
      tr: "Agentic IDE",
    },
    summary: {
      en: "A thesis-driven IDE concept centered on observe, plan, approve, and apply loops.",
      tr: "Observe, plan, approve ve apply dongusu etrafinda kurulan tez odakli IDE konsepti.",
    },
    description: {
      en: "Designed the architecture for an AI-native IDE that keeps human approval in the loop. The system explores hybrid orchestration, sandboxing, and policy-aware execution for code agents.",
      tr: "Insan onayini merkezde tutan AI-native bir IDE icin mimari tasarladim. Sistem, hibrit orkestrasyon, sandboxing ve politika farkinda ajan calistirma yaklasimlarini arastiriyor.",
    },
    impact: {
      en: "Translates modern agent workflows into a concrete thesis-grade product direction.",
      tr: "Modern ajan workflow'larini somut ve tez seviyesinde bir urun yonune ceviriyor.",
    },
    technologies: ["TypeScript", "Electron", "Monaco Editor", "LLMs", "RAG"],
    featured: true,
  },
  {
    slug: "portfolio-platform-web-desktop",
    title: {
      en: "Portfolio Platform",
      tr: "Portfolyo Platformu",
    },
    summary: {
      en: "Full-stack portfolio system with admin workflows and staged deployments.",
      tr: "Admin workflow'lari ve asamali deploy hattina sahip full-stack portfolyo sistemi.",
    },
    description: {
      en: "Built a multi-platform portfolio product with JWT/RBAC, GitHub caching, Supabase asset handling, SMTP notifications, and CI/CD to Vercel and Railway.",
      tr: "JWT/RBAC, GitHub cache, Supabase varlik yonetimi, SMTP bildirimleri ve Vercel/Railway CI/CD hattiyla cok platformlu bir portfolyo urunu gelistirdim.",
    },
    impact: {
      en: "Owns both the storytelling surface and the operational backbone behind it.",
      tr: "Hem anlati yuzeyini hem de arkasindaki operasyonel omurgayi sahipleniyor.",
    },
    technologies: ["Next.js", "FastAPI", "PostgreSQL", "Redis", "Supabase", "Railway", "Vercel"],
    githubUrl: "https://github.com/TurkishKEBAB/Site",
    featured: false,
  },
];

export const aboutContent = {
  en: {
    pageLabel: "Profile dossier",
    pageTitle: "About",
    pageSubtitle:
      "A software engineering student building durable backend systems, product workflows, and engineering leverage.",
    journeyLabel: "Current trajectory",
    journeyTitle: "What I optimize for",
    journeyBody:
      "I like solving problems where product value and systems thinking meet: enterprise defects that need careful diagnosis, scheduling engines that need algorithmic depth, and public-facing software that still needs operational reliability.",
    highlightsLabel: "Selected highlights",
    highlightsTitle: "Recent proof points",
    highlights: [
      "NETAS internship: traced a timezone defect across enterprise microservices and turned it into a documented regression shield.",
      "IEEE Isik: continued technical leadership and community operations reaching 1,100+ students.",
      "AdaLab: ongoing research support around AI and data analytics workflows.",
      "Sarkan UAV: delivery leadership under budget, sponsorship, and competition pressure.",
    ],
  },
  tr: {
    pageLabel: "Profil dosyasi",
    pageTitle: "Hakkimda",
    pageSubtitle:
      "Dayanikli backend sistemleri, urun workflow'lari ve muhendislik kaldiraci ureten bir yazilim muhendisligi ogrencisi.",
    journeyLabel: "Guncel yonde",
    journeyTitle: "Neyi optimize ediyorum",
    journeyBody:
      "Urun degeriyle sistem dusuncesinin kesistigi problemleri seviyorum: dikkatli teshis gerektiren enterprise defect'ler, algoritmik derinlik isteyen scheduling motorlari ve operasyonel olarak guvenilir kalmasi gereken public yazilimlar.",
    highlightsLabel: "Secili basliklar",
    highlightsTitle: "Son donem kanitlar",
    highlights: [
      "NETAS staji: enterprise mikroservislerde timezone defect'ini izleyip kalici regression kalkanina cevirdim.",
      "IEEE Isik: 1.100+ ogrenciye ulasan teknik liderlik ve topluluk operasyonlarini surdurdum.",
      "AdaLab: AI ve veri analitigi workflow'larinda arastirma destegi sagliyorum.",
      "Sarkan IHA: butce, sponsorluk ve rekabet baskisi altinda teslim liderligi yuruttum.",
    ],
  },
} satisfies Record<
  Locale,
  {
    pageLabel: string;
    pageTitle: string;
    pageSubtitle: string;
    journeyLabel: string;
    journeyTitle: string;
    journeyBody: string;
    highlightsLabel: string;
    highlightsTitle: string;
    highlights: string[];
  }
>;

export const contactContent = {
  en: {
    pageLabel: "Channel",
    pageTitle: "Get in touch",
    pageSubtitle:
      "The reliable path is direct contact first. The form still works when the API is healthy and degrades gracefully when it is not.",
    formLabel: "Message",
    formTitle: "Send a note",
    formDescription:
      "If the form request fails, your draft stays on the page and you can copy it or open a prepared email.",
    fields: {
      name: "Full name",
      email: "Email address",
      subject: "Subject",
      message: "Message",
    },
    placeholders: {
      name: "Your full name",
      email: "you@example.com",
      subject: "What would you like to discuss?",
      message: "Share the project, role, or topic you want to discuss.",
    },
    submit: "Send message",
    sending: "Sending...",
    success: "Your message has been sent successfully.",
    failure:
      "The contact API is unavailable right now. Your draft is still here so you can copy it or open an email draft instead.",
    validation: {
      name: "Please enter at least 2 characters.",
      email: "Please enter a valid email address.",
      subject: "Subject must be at least 3 characters or left empty.",
      message: "Your message must be at least 10 characters long.",
    },
    infoTitle: "Direct channels",
    availabilityTitle: "Currently open to",
    availabilityBody:
      "Backend systems, cloud platform work, DevOps automation, and high-ownership engineering internships.",
  },
  tr: {
    pageLabel: "Kanal",
    pageTitle: "Iletisime gec",
    pageSubtitle:
      "Guvenilir yol once dogrudan iletisimdir. Form API saglikliyken calisir, degilse de zarif bicimde degrade olur.",
    formLabel: "Mesaj",
    formTitle: "Bir not birak",
    formDescription:
      "Form istegi basarisiz olursa taslagin sayfada kalir; kopyalayabilir veya hazir e-posta taslagi acabilirsin.",
    fields: {
      name: "Ad soyad",
      email: "E-posta adresi",
      subject: "Konu",
      message: "Mesaj",
    },
    placeholders: {
      name: "Adiniz soyadiniz",
      email: "ornek@eposta.com",
      subject: "Hangi konuda konusmak istersiniz?",
      message: "Konusmak istediginiz rol, proje veya konuyu paylasin.",
    },
    submit: "Mesaji gonder",
    sending: "Gonderiliyor...",
    success: "Mesajiniz basariyla gonderildi.",
    failure:
      "Iletisim API'si su anda ulasilamiyor. Taslaginiz sayfada tutuldu; kopyalayabilir veya e-posta taslagi acabilirsiniz.",
    validation: {
      name: "Lutfen en az 2 karakter girin.",
      email: "Lutfen gecerli bir e-posta adresi girin.",
      subject: "Konu en az 3 karakter olmali veya bos birakilmalidir.",
      message: "Mesajiniz en az 10 karakterden olusmalidir.",
    },
    infoTitle: "Dogrudan kanallar",
    availabilityTitle: "Su alanlara acigim",
    availabilityBody:
      "Backend sistemleri, cloud platform calismalari, DevOps otomasyonu ve yuksek sahiplik gerektiren muhendislik stajlari.",
  },
} satisfies Record<
  Locale,
  {
    pageLabel: string;
    pageTitle: string;
    pageSubtitle: string;
    formLabel: string;
    formTitle: string;
    formDescription: string;
    fields: Record<"name" | "email" | "subject" | "message", string>;
    placeholders: Record<"name" | "email" | "subject" | "message", string>;
    submit: string;
    sending: string;
    success: string;
    failure: string;
    validation: Record<"name" | "email" | "subject" | "message", string>;
    infoTitle: string;
    availabilityTitle: string;
    availabilityBody: string;
  }
>;

export const seoContent = {
  home: {
    en: {
      title: "Yigit Okur | Software Engineer - Cloud & DevOps",
      description:
        "Portfolio of Yigit Okur focused on backend systems, cloud-native architecture, DevOps automation, and high-impact engineering delivery.",
    },
    tr: {
      title: "Yigit Okur | Software Engineer - Cloud & DevOps",
      description:
        "Yigit Okur'un backend sistemleri, cloud-native mimari, DevOps otomasyonu ve yuksek etkili muhendislik teslimine odakli portfolyosu.",
    },
  },
  about: {
    en: {
      title: "About | Yigit Okur",
      description:
        "Impact-oriented profile of Yigit Okur across enterprise debugging, scheduling systems, technical leadership, and research support.",
    },
    tr: {
      title: "Hakkimda | Yigit Okur",
      description:
        "Yigit Okur'un enterprise debugging, scheduling sistemleri, teknik liderlik ve arastirma destegini birlestiren etki odakli profili.",
    },
  },
  projects: {
    en: {
      title: "Projects | Yigit Okur",
      description:
        "Selected engineering projects across scheduling optimization, defense telemetry, AI-native tooling, and platform delivery.",
    },
    tr: {
      title: "Projeler | Yigit Okur",
      description:
        "Scheduling optimizasyonu, savunma telemetrisi, AI-native tooling ve platform teslimini kapsayan secili muhendislik projeleri.",
    },
  },
  contact: {
    en: {
      title: "Contact | Yigit Okur",
      description:
        "Direct contact channels for software engineering collaboration, backend roles, and cloud-focused opportunities.",
    },
    tr: {
      title: "Iletisim | Yigit Okur",
      description:
        "Yazilim muhendisligi is birlikleri, backend roller ve cloud odakli firsatlar icin dogrudan iletisim kanallari.",
    },
  },
  blog: {
    en: {
      title: "Blog | Yigit Okur",
      description:
        "Engineering notes and case studies. Blog reliability improvements are planned via ISR in a later phase.",
    },
    tr: {
      title: "Blog | Yigit Okur",
      description:
        "Muhendislik notlari ve case study'ler. Blog guvenilirligi sonraki fazda ISR ile gelistirilecek.",
    },
  },
  login: {
    en: {
      title: "Admin Login | Yigit Okur",
      description: "Admin access for the portfolio control surface.",
    },
    tr: {
      title: "Admin Girisi | Yigit Okur",
      description: "Portfolyo yonetim yuzeyi icin admin erisimi.",
    },
  },
  admin: {
    en: {
      title: "Admin | Yigit Okur",
      description: "Authenticated portfolio administration surface.",
    },
    tr: {
      title: "Admin | Yigit Okur",
      description: "Kimlik dogrulanmis portfolyo yonetim yuzeyi.",
    },
  },
} satisfies Record<
  "home" | "about" | "projects" | "contact" | "blog" | "login" | "admin",
  Record<Locale, { title: string; description: string }>
>;

export const defaultKeywords = [
  "Yigit Okur",
  "Software Engineer",
  "Backend Engineer",
  "Cloud DevOps",
  "FastAPI",
  "Next.js",
  "Spring Boot",
  "Platform Engineering",
  "Portfolio",
];

export const resumeText = `Yigit Okur
Software Engineer | Cloud & DevOps Focus
Website: https://yigitokur.me
Email: yigitokur@ieee.org
Phone: +90 535 573 3873
Location: Istanbul, Turkey

SUMMARY
Software Engineering student focused on enterprise backend systems, cloud-native architecture, DevOps automation, and AI-native tooling.

SELECTED HIGHLIGHTS
- NETAS: traced a silent timezone mismatch across production Java microservices and documented the fix path with 600+ lines of tests.
- IsikSchedule: built and productized a scheduling system reaching roughly 1,000 active desktop users with a 13-algorithm optimization engine.
- Teknofest Sarkan UAV: led telemetry and coordination work for a project ranked 3rd among 700+ proposals.
- IEEE Isik + AdaLab: combine technical leadership, community operations, and research support.

KEY STACK
Java, Spring Boot, Python, FastAPI, TypeScript, Next.js, Docker, Kubernetes, PostgreSQL, Redis, ElasticSearch, GitHub Actions.

LINKS
GitHub: https://github.com/TurkishKEBAB
LinkedIn: https://www.linkedin.com/in/yigit-okur-050b5b278
`;

export const getLocaleValue = <T>(value: Record<Locale, T>, locale: Locale): T =>
  value[locale] ?? value[defaultLocale];

export const getFeaturedProjects = (): ProjectRecord[] =>
  projectRecords.filter((project) => project.featured);



