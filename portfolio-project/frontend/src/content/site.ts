export type Locale = "en" | "tr";

export type LocalizedString = Record<Locale, string>;

type ContactFieldKey = "name" | "email" | "subject" | "message";
type SeoPageKey = "home" | "about" | "projects" | "contact" | "blog" | "login" | "admin";

interface HomeOverviewCard {
  title: LocalizedString;
  body: LocalizedString;
}

interface HomeLocaleContent {
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

interface AboutLocaleContent {
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

interface ContactLocaleContent {
  pageLabel: string;
  pageTitle: string;
  pageSubtitle: string;
  formLabel: string;
  formTitle: string;
  formDescription: string;
  fields: Record<ContactFieldKey, string>;
  placeholders: Record<ContactFieldKey, string>;
  submit: string;
  sending: string;
  success: string;
  failure: string;
  validation: Record<ContactFieldKey, string>;
  infoTitle: string;
  availabilityTitle: string;
  availabilityBody: string;
}

interface SeoLocaleContent {
  title: string;
  description: string;
}

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

const localized = (en: string, tr: string): LocalizedString => ({ en, tr });

const buildLocaleMap = <T>(resolver: (locale: Locale) => T): Record<Locale, T> => ({
  en: resolver("en"),
  tr: resolver("tr"),
});

export const getLocaleValue = <T>(value: Record<Locale, T>, locale: Locale): T =>
  value[locale] ?? value[defaultLocale];

const resolveLocalizedRecord = <T extends Record<string, LocalizedString>>(
  value: T,
  locale: Locale,
): { [K in keyof T]: string } =>
  Object.fromEntries(
    (Object.entries(value) as Array<[keyof T, LocalizedString]>).map(([key, entry]) => [
      key,
      getLocaleValue(entry, locale),
    ]),
  ) as { [K in keyof T]: string };

const resolveLocalizedList = (value: LocalizedString[], locale: Locale): string[] =>
  value.map((entry) => getLocaleValue(entry, locale));

const buildSeoEntry = (
  title: LocalizedString,
  description: LocalizedString,
): Record<Locale, SeoLocaleContent> =>
  buildLocaleMap((locale) => ({
    title: getLocaleValue(title, locale),
    description: getLocaleValue(description, locale),
  }));

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
  location: localized("Istanbul, Turkey", "Istanbul, Turkiye"),
  github: "https://github.com/TurkishKEBAB",
  linkedin: "https://www.linkedin.com/in/yigit-okur-050b5b278",
  twitter: "https://x.com/biznedenokuruz",
  profileImage: "/profile.jpg",
  profileFallbackImage: "/profile-placeholder.png",
  ogImage: "/opengraph-image",
};

const uiDictionaryDefinitions = {
  navHome: localized("Home", "Ana Sayfa"),
  navAbout: localized("About", "Hakkimda"),
  navProjects: localized("Projects", "Projeler"),
  navBlog: localized("Blog", "Blog"),
  navContact: localized("Contact", "Iletisim"),
  navLanguage: localized("Language", "Dil"),
  navTheme: localized("Theme", "Tema"),
  footerNavigation: localized("Navigation", "Navigasyon"),
  footerContact: localized("Contact", "Iletisim"),
  footerAvailability: localized(
    "Open to engineering collaborations",
    "Muhendislik is birliklerine acik",
  ),
  footerStack: localized("Next.js / React / Tailwind CSS", "Next.js / React / Tailwind CSS"),
  contactCopy: localized("Copy message", "Mesaji kopyala"),
  contactCopied: localized("Copied", "Kopyalandi"),
  contactMailFallback: localized("Open email draft", "E-posta taslagi ac"),
  contactRetry: localized("Try again", "Tekrar dene"),
  blogUnavailableTitle: localized(
    "Blog is temporarily unavailable",
    "Blog gecici olarak ulasilamiyor",
  ),
  blogUnavailableBody: localized(
    "The public site still loads from repo-canonical content, but blog posts depend on the API right now.",
    "Public site repo-iceriginden yuklenmeye devam ediyor, ancak blog yazilari simdilik API bagimli.",
  ),
  blogBackToProjects: localized("View projects", "Projeleri gor"),
  blogBackToAbout: localized("View profile", "Profili gor"),
  loginBackHome: localized("Back to home", "Ana sayfaya don"),
  notFoundTitle: localized("Page not found", "Sayfa bulunamadi"),
  notFoundBody: localized(
    "This route does not exist on the new public surface. The core profile content is available below.",
    "Bu rota yeni public yuzeyde bulunmuyor. Asagidaki temel profil icerigine donebilirsiniz.",
  ),
  notFoundAction: localized("Return home", "Ana sayfaya don"),
} satisfies Record<string, LocalizedString>;

export const uiDictionary = buildLocaleMap((locale) =>
  resolveLocalizedRecord(uiDictionaryDefinitions, locale),
);

const homeRoleParts = ["BACKEND SYSTEMS", "CLOUD & DEVOPS", "AI-NATIVE TOOLING"];

const homeDefinition = {
  heroEyebrow: localized("> init system.profile", "> sistem.profil baslatiliyor"),
  heroTitleFirst: localized("YIGIT", "YIGIT"),
  heroTitleSecond: localized("OKUR", "OKUR"),
  heroDescription: localized(
    "I build enterprise backend systems, cloud-native workflows, and AI-native tooling while studying Software Engineering at Isik University. My strongest case study comes from NETAS, where I traced a silent timezone defect across production microservices and turned it into a documented regression safety net.",
    "Isik Universitesi'nde Yazilim Muhendisligi egitimime devam ederken enterprise backend sistemleri, cloud-native workflow'lar ve AI-native tooling uzerine uretim yapiyorum. En guclu case study'm NETAS'ta canli mikroservislerde sessizce kalan timezone defect'ini izleyip kalici regression guvencesine cevirmemdi.",
  ),
  availabilityLabel: localized(
    "Available for part-time cloud and backend roles",
    "Part-time cloud ve backend rollerine acigim",
  ),
  availabilityNote: localized(
    "Open to engineering collaborations and high-ownership internships",
    "Yuksek sahiplik gerektiren muhendislik is birlikleri ve stajlara acigim",
  ),
  primaryCta: localized("Get in touch", "Iletisime gec"),
  secondaryCta: localized("Download CV", "CV indir"),
  tertiaryCta: localized("View projects", "Projeleri gor"),
  overviewLabel: localized("Overview", "Genel bakis"),
  overviewTitle: localized("Impact-first profile", "Etki odakli profil"),
  skillsLabel: localized("Capabilities", "Yetkinlikler"),
  skillsTitle: localized("Technical system", "Teknik sistemim"),
  skillsSubtitle: localized(
    "Grouped by the stacks I actually use to ship backend, cloud, observability, and product work.",
    "Backend, cloud, observability ve urun teslimi icin gercekte kullandigim teknoloji gruplari.",
  ),
  projectsLabel: localized("Featured work", "One cikan isler"),
  projectsTitle: localized("Selected projects", "Secili projeler"),
  projectsSubtitle: localized(
    "A focused set of systems that represent product scale, technical depth, and delivery ownership.",
    "Urun olgunlugu, teknik derinlik ve teslim sorumlulugunu birlikte gosteren odakli bir proje secimi.",
  ),
  ctaLabel: localized("Contact", "Iletisim"),
  ctaTitle: localized("Let's build something sharp", "Birlikte keskin bir seyler uretelim"),
  ctaBody: localized(
    "If you want to discuss backend systems, cloud architecture, DevOps automation, or AI-native workflows, I am happy to connect.",
    "Backend sistemleri, cloud mimarisi, DevOps otomasyonu veya AI-native workflow'lar konusmak istersen baglanabiliriz.",
  ),
  scroll: localized("Scroll", "Kaydir"),
  roleParts: homeRoleParts,
  overviewCards: [
    {
      title: localized("NETAS timezone investigation", "NETAS timezone incelemesi"),
      body: localized(
        "Identified a silent v1/v2 timezone mismatch via YAML and ELK analysis, then documented the remediation path with 600+ lines of tests.",
        "YAML ve ELK analiziyle sessiz kalan v1/v2 timezone uyumsuzlugunu tespit ettim; cozum yolunu 600+ satir test ile kalici hale getirdim.",
      ),
    },
    {
      title: localized("IsikSchedule product maturity", "IsikSchedule urun olgunlugu"),
      body: localized(
        "Built a shared scheduling core spanning desktop and web, with roughly 1,000 active users and a 13-algorithm optimization engine.",
        "Masaustu ve web urunlerini paylasilan scheduling core uzerinde birlestirdim; yaklasik 1.000 aktif kullaniciya ve 13 algoritmali optimizasyon motoruna ulasti.",
      ),
    },
    {
      title: localized("IEEE and AdaLab leadership", "IEEE ve AdaLab liderligi"),
      body: localized(
        "Blend delivery, community leadership, and research support through IEEE Isik and AdaLab responsibilities.",
        "IEEE Isik ve AdaLab sorumluluklariyla teknik teslim, topluluk liderligi ve arastirma destegini birlikte yuruttum.",
      ),
    },
  ] satisfies HomeOverviewCard[],
};

const resolveHomeContent = (locale: Locale): HomeLocaleContent => ({
  heroEyebrow: getLocaleValue(homeDefinition.heroEyebrow, locale),
  heroTitleFirst: getLocaleValue(homeDefinition.heroTitleFirst, locale),
  heroTitleSecond: getLocaleValue(homeDefinition.heroTitleSecond, locale),
  heroDescription: getLocaleValue(homeDefinition.heroDescription, locale),
  availabilityLabel: getLocaleValue(homeDefinition.availabilityLabel, locale),
  availabilityNote: getLocaleValue(homeDefinition.availabilityNote, locale),
  primaryCta: getLocaleValue(homeDefinition.primaryCta, locale),
  secondaryCta: getLocaleValue(homeDefinition.secondaryCta, locale),
  tertiaryCta: getLocaleValue(homeDefinition.tertiaryCta, locale),
  overviewLabel: getLocaleValue(homeDefinition.overviewLabel, locale),
  overviewTitle: getLocaleValue(homeDefinition.overviewTitle, locale),
  skillsLabel: getLocaleValue(homeDefinition.skillsLabel, locale),
  skillsTitle: getLocaleValue(homeDefinition.skillsTitle, locale),
  skillsSubtitle: getLocaleValue(homeDefinition.skillsSubtitle, locale),
  projectsLabel: getLocaleValue(homeDefinition.projectsLabel, locale),
  projectsTitle: getLocaleValue(homeDefinition.projectsTitle, locale),
  projectsSubtitle: getLocaleValue(homeDefinition.projectsSubtitle, locale),
  ctaLabel: getLocaleValue(homeDefinition.ctaLabel, locale),
  ctaTitle: getLocaleValue(homeDefinition.ctaTitle, locale),
  ctaBody: getLocaleValue(homeDefinition.ctaBody, locale),
  scroll: getLocaleValue(homeDefinition.scroll, locale),
  roleParts: [...homeDefinition.roleParts],
  overviewCards: homeDefinition.overviewCards.map((card) => ({
    title: getLocaleValue(card.title, locale),
    body: getLocaleValue(card.body, locale),
  })),
});

export const homeContent = buildLocaleMap(resolveHomeContent) satisfies Record<
  Locale,
  HomeLocaleContent
>;

const impactMetric = (
  value: string,
  labelEn: string,
  labelTr: string,
  noteEn: string,
  noteTr: string,
): ImpactMetric => ({
  value,
  label: localized(labelEn, labelTr),
  note: localized(noteEn, noteTr),
});

export const impactMetrics: ImpactMetric[] = [
  impactMetric(
    "~1,000",
    "active users reached",
    "aktif kullaniciya eristi",
    "Desktop deployment of IsikSchedule",
    "IsikSchedule masaustu dagitimi",
  ),
  impactMetric(
    "13",
    "optimization algorithms",
    "optimizasyon algoritmasi",
    "Shared scheduling engine",
    "Paylasilan scheduling motoru",
  ),
  impactMetric(
    "3 / 700+",
    "preliminary ranking",
    "on degerlendirme sirasi",
    "Teknofest Sarkan UAV",
    "Teknofest Sarkan IHA",
  ),
];

const skillGroup = (
  titleEn: string,
  titleTr: string,
  summaryEn: string,
  summaryTr: string,
  skills: string[],
): SkillGroup => ({
  title: localized(titleEn, titleTr),
  summary: localized(summaryEn, summaryTr),
  skills,
});

export const skillGroups: SkillGroup[] = [
  skillGroup(
    "Backend and architecture",
    "Backend ve mimari",
    "Production-focused APIs, modular services, and clean system boundaries.",
    "Production odakli API'ler, moduler servisler ve temiz sistem sinirlari.",
    [
      "Java",
      "Spring Boot",
      "Python",
      "FastAPI",
      "REST APIs",
      "Microservices",
      "Clean Architecture",
      "JWT / RBAC",
    ],
  ),
  skillGroup(
    "Cloud and observability",
    "Cloud ve observability",
    "Deploy, diagnose, and stabilize distributed systems.",
    "Dagitik sistemleri deploy etme, izleme ve stabil hale getirme.",
    [
      "Docker",
      "Kubernetes",
      "GitHub Actions",
      "AWS EC2",
      "AWS S3",
      "Redis",
      "ElasticSearch",
      "Kibana",
      "RabbitMQ",
    ],
  ),
  skillGroup(
    "Product and interface layer",
    "Urun ve arayuz katmani",
    "Enough frontend fluency to ship end-to-end experiences without losing system quality.",
    "Sistem kalitesini kaybetmeden uctan uca deneyim cikarmaya yetecek kadar frontend yetkinligi.",
    ["TypeScript", "React", "Next.js", "Tailwind CSS", "Electron", "Monaco Editor"],
  ),
  skillGroup(
    "Testing and automation",
    "Test ve otomasyon",
    "Test-first debugging and reliable delivery pipelines.",
    "Test-first debugging ve guvenilir teslim pipeline'lari.",
    ["Pytest", "JUnit", "CI/CD", "SonarQube", "Defect Tracking", "Regression Design"],
  ),
];

const projectRecord = (
  slug: string,
  titleEn: string,
  titleTr: string,
  summaryEn: string,
  summaryTr: string,
  descriptionEn: string,
  descriptionTr: string,
  impactEn: string,
  impactTr: string,
  technologies: string[],
  featured: boolean,
  githubUrl?: string,
  demoUrl?: string,
): ProjectRecord => ({
  slug,
  title: localized(titleEn, titleTr),
  summary: localized(summaryEn, summaryTr),
  description: localized(descriptionEn, descriptionTr),
  impact: localized(impactEn, impactTr),
  technologies,
  featured,
  githubUrl,
  demoUrl,
});

export const projectRecords: ProjectRecord[] = [
  projectRecord(
    "isikschedule-platform",
    "IsikSchedule Platform",
    "IsikSchedule Platformu",
    "Constraint-aware scheduling system spanning desktop and web products.",
    "Masaustu ve web urunlerini kapsayan constraint-aware scheduling sistemi.",
    "Built a shared scheduling domain that powers both desktop and web experiences. The engine combines hard constraints with preference optimization and ships with 13 algorithms including Genetic, SA, Tabu, PSO, and hybrid strategies.",
    "Masaustu ve web deneyimlerini besleyen paylasilan scheduling domain'ini kurdum. Motor; hard constraint'leri, tercih optimizasyonunu ve Genetik, SA, Tabu, PSO ile hibrit stratejiler dahil 13 algoritmayi birlestiriyor.",
    "~1,000 active users on desktop release with ongoing web productization.",
    "Masaustu surumunde ~1.000 aktif kullanici ve devam eden web urunlestirme sureci.",
    ["FastAPI", "Next.js", "PostgreSQL", "Redis", "Celery", "Docker", "PyQt6"],
    true,
    "https://github.com/TurkishKEBAB/isikschedule-core",
    "https://github.com/TurkishKEBAB/isikschedule-web",
  ),
  projectRecord(
    "teknofest-sarkan-uav-defense-platform",
    "Teknofest Sarkan UAV Defense Platform",
    "Teknofest Sarkan IHA Savunma Platformu",
    "Telemetry reliability and anti-jamming software for a defense UAV platform.",
    "Savunma odakli IHA platformu icin telemetri guvenilirligi ve anti-jamming yazilimi.",
    "Led telemetry software and cross-team coordination for a defense UAV effort. The project ranked 3rd among 700+ proposals in preliminary evaluation while carrying real delivery and sponsorship pressure.",
    "Savunma odakli IHA calismasinda telemetri yazilimi ve takimlar arasi koordinasyona liderlik ettim. Proje, gercek teslim ve sponsorluk baskisi altinda on degerlendirmede 700+ basvuru arasinda 3. oldu.",
    "Managed a 200,000 TL budget including a 165,000 TL TUBITAK R&D grant.",
    "165.000 TL TUBITAK Ar-Ge hibesi dahil toplam 200.000 TL butce yonetildi.",
    ["Python", "Telemetry", "Systems Design", "Team Coordination"],
    true,
  ),
  projectRecord(
    "agentic-ide-thesis-project",
    "Agentic IDE",
    "Agentic IDE",
    "A thesis-driven IDE concept centered on observe, plan, approve, and apply loops.",
    "Observe, plan, approve ve apply dongusu etrafinda kurulan tez odakli IDE konsepti.",
    "Designed the architecture for an AI-native IDE that keeps human approval in the loop. The system explores hybrid orchestration, sandboxing, and policy-aware execution for code agents.",
    "Insan onayini merkezde tutan AI-native bir IDE icin mimari tasarladim. Sistem, hibrit orkestrasyon, sandboxing ve politika farkinda ajan calistirma yaklasimlarini arastiriyor.",
    "Translates modern agent workflows into a concrete thesis-grade product direction.",
    "Modern ajan workflow'larini somut ve tez seviyesinde bir urun yonune ceviriyor.",
    ["TypeScript", "Electron", "Monaco Editor", "LLMs", "RAG"],
    true,
  ),
  projectRecord(
    "portfolio-platform-web-desktop",
    "Portfolio Platform",
    "Portfolyo Platformu",
    "Full-stack portfolio system with admin workflows and staged deployments.",
    "Admin workflow'lari ve asamali deploy hattina sahip full-stack portfolyo sistemi.",
    "Built a multi-platform portfolio product with JWT/RBAC, GitHub caching, Supabase asset handling, SMTP notifications, and CI/CD to Vercel and Railway.",
    "JWT/RBAC, GitHub cache, Supabase varlik yonetimi, SMTP bildirimleri ve Vercel/Railway CI/CD hattiyla cok platformlu bir portfolyo urunu gelistirdim.",
    "Owns both the storytelling surface and the operational backbone behind it.",
    "Hem anlati yuzeyini hem de arkasindaki operasyonel omurgayi sahipleniyor.",
    ["Next.js", "FastAPI", "PostgreSQL", "Redis", "Supabase", "Railway", "Vercel"],
    false,
    "https://github.com/TurkishKEBAB/Site",
  ),
];

const aboutDefinition = {
  pageLabel: localized("Profile dossier", "Profil dosyasi"),
  pageTitle: localized("About", "Hakkimda"),
  pageSubtitle: localized(
    "A software engineering student building durable backend systems, product workflows, and engineering leverage.",
    "Dayanikli backend sistemleri, urun workflow'lari ve muhendislik kaldiraci ureten bir yazilim muhendisligi ogrencisi.",
  ),
  journeyLabel: localized("Current trajectory", "Guncel yonde"),
  journeyTitle: localized("What I optimize for", "Neyi optimize ediyorum"),
  journeyBody: localized(
    "I like solving problems where product value and systems thinking meet: enterprise defects that need careful diagnosis, scheduling engines that need algorithmic depth, and public-facing software that still needs operational reliability.",
    "Urun degeriyle sistem dusuncesinin kesistigi problemleri seviyorum: dikkatli teshis gerektiren enterprise defect'ler, algoritmik derinlik isteyen scheduling motorlari ve operasyonel olarak guvenilir kalmasi gereken public yazilimlar.",
  ),
  highlightsLabel: localized("Selected highlights", "Secili basliklar"),
  highlightsTitle: localized("Recent proof points", "Son donem kanitlar"),
  highlights: [
    localized(
      "NETAS internship: traced a timezone defect across enterprise microservices and turned it into a documented regression shield.",
      "NETAS staji: enterprise mikroservislerde timezone defect'ini izleyip kalici regression kalkanina cevirdim.",
    ),
    localized(
      "IEEE Isik: continued technical leadership and community operations reaching 1,100+ students.",
      "IEEE Isik: 1.100+ ogrenciye ulasan teknik liderlik ve topluluk operasyonlarini surdurdum.",
    ),
    localized(
      "AdaLab: ongoing research support around AI and data analytics workflows.",
      "AdaLab: AI ve veri analitigi workflow'larinda arastirma destegi sagliyorum.",
    ),
    localized(
      "Sarkan UAV: delivery leadership under budget, sponsorship, and competition pressure.",
      "Sarkan IHA: butce, sponsorluk ve rekabet baskisi altinda teslim liderligi yuruttum.",
    ),
  ],
};

const resolveAboutContent = (locale: Locale): AboutLocaleContent => ({
  pageLabel: getLocaleValue(aboutDefinition.pageLabel, locale),
  pageTitle: getLocaleValue(aboutDefinition.pageTitle, locale),
  pageSubtitle: getLocaleValue(aboutDefinition.pageSubtitle, locale),
  journeyLabel: getLocaleValue(aboutDefinition.journeyLabel, locale),
  journeyTitle: getLocaleValue(aboutDefinition.journeyTitle, locale),
  journeyBody: getLocaleValue(aboutDefinition.journeyBody, locale),
  highlightsLabel: getLocaleValue(aboutDefinition.highlightsLabel, locale),
  highlightsTitle: getLocaleValue(aboutDefinition.highlightsTitle, locale),
  highlights: resolveLocalizedList(aboutDefinition.highlights, locale),
});

export const aboutContent = buildLocaleMap(resolveAboutContent) satisfies Record<
  Locale,
  AboutLocaleContent
>;

const contactFieldLabels = {
  name: localized("Full name", "Ad soyad"),
  email: localized("Email address", "E-posta adresi"),
  subject: localized("Subject", "Konu"),
  message: localized("Message", "Mesaj"),
} satisfies Record<ContactFieldKey, LocalizedString>;

const contactPlaceholders = {
  name: localized("Your full name", "Adiniz soyadiniz"),
  email: localized("you@example.com", "ornek@eposta.com"),
  subject: localized("What would you like to discuss?", "Hangi konuda konusmak istersiniz?"),
  message: localized(
    "Share the project, role, or topic you want to discuss.",
    "Konusmak istediginiz rol, proje veya konuyu paylasin.",
  ),
} satisfies Record<ContactFieldKey, LocalizedString>;

const contactValidationMessages = {
  name: localized("Please enter at least 2 characters.", "Lutfen en az 2 karakter girin."),
  email: localized(
    "Please enter a valid email address.",
    "Lutfen gecerli bir e-posta adresi girin.",
  ),
  subject: localized(
    "Subject must be at least 3 characters or left empty.",
    "Konu en az 3 karakter olmali veya bos birakilmalidir.",
  ),
  message: localized(
    "Your message must be at least 10 characters long.",
    "Mesajiniz en az 10 karakterden olusmalidir.",
  ),
} satisfies Record<ContactFieldKey, LocalizedString>;

const contactDefinition = {
  pageLabel: localized("Channel", "Kanal"),
  pageTitle: localized("Get in touch", "Iletisime gec"),
  pageSubtitle: localized(
    "The reliable path is direct contact first. The form still works when the API is healthy and degrades gracefully when it is not.",
    "Guvenilir yol once dogrudan iletisimdir. Form API saglikliyken calisir, degilse de zarif bicimde degrade olur.",
  ),
  formLabel: localized("Message", "Mesaj"),
  formTitle: localized("Send a note", "Bir not birak"),
  formDescription: localized(
    "If the form request fails, your draft stays on the page and you can copy it or open a prepared email.",
    "Form istegi basarisiz olursa taslagin sayfada kalir; kopyalayabilir veya hazir e-posta taslagi acabilirsin.",
  ),
  fields: contactFieldLabels,
  placeholders: contactPlaceholders,
  submit: localized("Send message", "Mesaji gonder"),
  sending: localized("Sending...", "Gonderiliyor..."),
  success: localized(
    "Your message has been sent successfully.",
    "Mesajiniz basariyla gonderildi.",
  ),
  failure: localized(
    "The contact API is unavailable right now. Your draft is still here so you can copy it or open an email draft instead.",
    "Iletisim API'si su anda ulasilamiyor. Taslaginiz sayfada tutuldu; kopyalayabilir veya e-posta taslagi acabilirsiniz.",
  ),
  validation: contactValidationMessages,
  infoTitle: localized("Direct channels", "Dogrudan kanallar"),
  availabilityTitle: localized("Currently open to", "Su alanlara acigim"),
  availabilityBody: localized(
    "Backend systems, cloud platform work, DevOps automation, and high-ownership engineering internships.",
    "Backend sistemleri, cloud platform calismalari, DevOps otomasyonu ve yuksek sahiplik gerektiren muhendislik stajlari.",
  ),
};

const resolveContactContent = (locale: Locale): ContactLocaleContent => ({
  pageLabel: getLocaleValue(contactDefinition.pageLabel, locale),
  pageTitle: getLocaleValue(contactDefinition.pageTitle, locale),
  pageSubtitle: getLocaleValue(contactDefinition.pageSubtitle, locale),
  formLabel: getLocaleValue(contactDefinition.formLabel, locale),
  formTitle: getLocaleValue(contactDefinition.formTitle, locale),
  formDescription: getLocaleValue(contactDefinition.formDescription, locale),
  fields: resolveLocalizedRecord(contactDefinition.fields, locale),
  placeholders: resolveLocalizedRecord(contactDefinition.placeholders, locale),
  submit: getLocaleValue(contactDefinition.submit, locale),
  sending: getLocaleValue(contactDefinition.sending, locale),
  success: getLocaleValue(contactDefinition.success, locale),
  failure: getLocaleValue(contactDefinition.failure, locale),
  validation: resolveLocalizedRecord(contactDefinition.validation, locale),
  infoTitle: getLocaleValue(contactDefinition.infoTitle, locale),
  availabilityTitle: getLocaleValue(contactDefinition.availabilityTitle, locale),
  availabilityBody: getLocaleValue(contactDefinition.availabilityBody, locale),
});

export const contactContent = buildLocaleMap(resolveContactContent) satisfies Record<
  Locale,
  ContactLocaleContent
>;

const seoDefinitions = {
  home: {
    title: localized(
      "Yigit Okur | Software Engineer - Cloud & DevOps",
      "Yigit Okur | Software Engineer - Cloud & DevOps",
    ),
    description: localized(
      "Portfolio of Yigit Okur focused on backend systems, cloud-native architecture, DevOps automation, and high-impact engineering delivery.",
      "Yigit Okur'un backend sistemleri, cloud-native mimari, DevOps otomasyonu ve yuksek etkili muhendislik teslimine odakli portfolyosu.",
    ),
  },
  about: {
    title: localized("About | Yigit Okur", "Hakkimda | Yigit Okur"),
    description: localized(
      "Impact-oriented profile of Yigit Okur across enterprise debugging, scheduling systems, technical leadership, and research support.",
      "Yigit Okur'un enterprise debugging, scheduling sistemleri, teknik liderlik ve arastirma destegini birlestiren etki odakli profili.",
    ),
  },
  projects: {
    title: localized("Projects | Yigit Okur", "Projeler | Yigit Okur"),
    description: localized(
      "Selected engineering projects across scheduling optimization, defense telemetry, AI-native tooling, and platform delivery.",
      "Scheduling optimizasyonu, savunma telemetrisi, AI-native tooling ve platform teslimini kapsayan secili muhendislik projeleri.",
    ),
  },
  contact: {
    title: localized("Contact | Yigit Okur", "Iletisim | Yigit Okur"),
    description: localized(
      "Direct contact channels for software engineering collaboration, backend roles, and cloud-focused opportunities.",
      "Yazilim muhendisligi is birlikleri, backend roller ve cloud odakli firsatlar icin dogrudan iletisim kanallari.",
    ),
  },
  blog: {
    title: localized("Blog | Yigit Okur", "Blog | Yigit Okur"),
    description: localized(
      "Engineering notes and case studies. Blog reliability improvements are planned via ISR in a later phase.",
      "Muhendislik notlari ve case study'ler. Blog guvenilirligi sonraki fazda ISR ile gelistirilecek.",
    ),
  },
  login: {
    title: localized("Admin Login | Yigit Okur", "Admin Girisi | Yigit Okur"),
    description: localized(
      "Admin access for the portfolio control surface.",
      "Portfolyo yonetim yuzeyi icin admin erisimi.",
    ),
  },
  admin: {
    title: localized("Admin | Yigit Okur", "Admin | Yigit Okur"),
    description: localized(
      "Authenticated portfolio administration surface.",
      "Kimlik dogrulanmis portfolyo yonetim yuzeyi.",
    ),
  },
} satisfies Record<
  SeoPageKey,
  {
    title: LocalizedString;
    description: LocalizedString;
  }
>;

export const seoContent = Object.fromEntries(
  (Object.entries(seoDefinitions) as Array<
    [SeoPageKey, { title: LocalizedString; description: LocalizedString }]
  >).map(([key, value]) => [key, buildSeoEntry(value.title, value.description)]),
) as Record<SeoPageKey, Record<Locale, SeoLocaleContent>>;

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

export const getFeaturedProjects = (): ProjectRecord[] =>
  projectRecords.filter((project) => project.featured);
