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
  name: "Yiğit Okur",
  role: "Software Engineer",
  focus: "Cloud & DevOps",
  siteUrl: "https://yigitokur.me",
  email: "yigitokur@ieee.org",
  phone: "+90 535 573 3873",
  phoneHref: "tel:+905355733873",
  location: localized("Bağcılar, İstanbul, Turkey", "Bağcılar, İstanbul, Türkiye"),
  github: "https://github.com/TurkishKEBAB",
  linkedin: "https://www.linkedin.com/in/yigit-okur-050b5b278",
  twitter: "https://x.com/biznedenokuruz",
  profileImage: "/profile.jpg",
  profileFallbackImage: "/profile-placeholder.png",
  ogImage: "/opengraph-image",
};

const uiDictionaryDefinitions = {
  navHome: localized("Home", "Ana Sayfa"),
  navAbout: localized("About", "Hakkımda"),
  navProjects: localized("Projects", "Projeler"),
  navBlog: localized("Blog", "Blog"),
  navContact: localized("Contact", "İletişim"),
  navLanguage: localized("Language", "Dil"),
  navTheme: localized("Theme", "Tema"),
  footerNavigation: localized("Navigation", "Navigasyon"),
  footerContact: localized("Contact", "İletişim"),
  footerAvailability: localized(
    "Open to engineering collaborations",
    "Mühendislik iş birliklerine açık",
  ),
  footerStack: localized("Next.js / React / Tailwind CSS", "Next.js / React / Tailwind CSS"),
  contactCopy: localized("Copy message", "Mesajı kopyala"),
  contactCopied: localized("Copied", "Kopyalandı"),
  contactMailFallback: localized("Open email draft", "E-posta taslağı aç"),
  contactRetry: localized("Try again", "Tekrar dene"),
  blogUnavailableTitle: localized(
    "Blog is temporarily unavailable",
    "Blog geçici olarak ulaşılamıyor",
  ),
  blogUnavailableBody: localized(
    "The public site still loads from repo-canonical content, but blog posts depend on the API right now.",
    "Public site repo içeriğinden yüklenmeye devam ediyor, ancak blog yazıları şimdilik API bağımlı.",
  ),
  blogBackToProjects: localized("View projects", "Projeleri gör"),
  blogBackToAbout: localized("View profile", "Profili gör"),
  loginBackHome: localized("Back to home", "Ana sayfaya dön"),
  notFoundTitle: localized("Page not found", "Sayfa bulunamadı"),
  notFoundBody: localized(
    "This route does not exist on the new public surface. The core profile content is available below.",
    "Bu rota yeni public yüzeyde bulunmuyor. Aşağıdaki temel profil içeriğine dönebilirsiniz.",
  ),
  notFoundAction: localized("Return home", "Ana sayfaya dön"),
} satisfies Record<string, LocalizedString>;

export const uiDictionary = buildLocaleMap((locale) =>
  resolveLocalizedRecord(uiDictionaryDefinitions, locale),
);

const homeRoleParts = ["ENTERPRISE BACKEND", "CLOUD & DEVOPS", "QUALITY AUTOMATION"];

const homeDefinition = {
  heroEyebrow: localized("> init system.profile", "> sistem.profil baslatiliyor"),
  heroTitleFirst: localized("YİĞİT", "YİĞİT"),
  heroTitleSecond: localized("OKUR", "OKUR"),
  heroDescription: localized(
    "Third-year Software Engineering student at Isik University focused on enterprise backend systems, cloud delivery, and DevOps automation. At NETAS, I contributed production code across four Jira tickets and turned a silent timezone mismatch into a documented regression safety net with targeted tests.",
    "Isik Universitesi'nde ucuncu sinif Yazilim Muhendisligi ogrencisi olarak enterprise backend sistemleri, cloud delivery ve DevOps otomasyonu uzerine odaklaniyorum. NETAS'ta dort Jira ticket boyunca production koda katkida bulunup sessiz kalan timezone uyumsuzlugunu hedefli testlerle kalici bir regression guvencesine cevirdim.",
  ),
  availabilityLabel: localized(
    "Available for part-time software engineering and cloud roles",
    "Part-time software engineering ve cloud rollerine acigim",
  ),
  availabilityNote: localized(
    "Open to backend, platform, DevOps, and quality-focused engineering teams.",
    "Backend, platform, DevOps ve kalite odakli muhendislik ekiplerine acigim.",
  ),
  primaryCta: localized("Get in touch", "İletişime geç"),
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
  projectsLabel: localized("Featured work", "Öne çıkan işler"),
  projectsTitle: localized("Selected projects", "Seçili projeler"),
  projectsSubtitle: localized(
    "A focused set of systems that represent product scale, technical depth, and delivery ownership.",
    "Urun olgunlugu, teknik derinlik ve teslim sorumlulugunu birlikte gosteren odakli bir proje secimi.",
  ),
  ctaLabel: localized("Contact", "İletişim"),
  ctaTitle: localized("Let's build something sharp", "Birlikte keskin bir seyler uretelim"),
  ctaBody: localized(
    "If you want to discuss backend systems, cloud architecture, DevOps automation, or AI-native workflows, I am happy to connect.",
    "Backend sistemleri, cloud mimarisi, DevOps otomasyonu veya AI-native workflow'lar konusmak istersen baglanabiliriz.",
  ),
  scroll: localized("Scroll", "Kaydir"),
  roleParts: homeRoleParts,
  overviewCards: [
    {
      title: localized("NETAS production case study", "NETAS production case study"),
      body: localized(
        "Shipped 25 commits and 1,550 lines of code and tests across four Jira tickets, then proved a silent timezone mismatch with YAML and ELK analysis plus 600+ lines of targeted tests.",
        "Dort Jira ticket boyunca 25 commit ve 1.550 satir kod-test katkisi yaptim; ardindan sessiz timezone uyumsuzlugunu YAML ve ELK analizi ile ortaya koyup 600+ satir hedefli testle kanitladim.",
      ),
    },
    {
      title: localized("IsikSchedule product maturity", "IsikSchedule urun olgunlugu"),
      body: localized(
        "Built a shared scheduling core across desktop and web, serving roughly 1,000 users on desktop with a 13-algorithm engine and 86.97% coverage backed by SonarQube Cloud.",
        "Masaustu ve web urunlerini ayni scheduling core etrafinda kurdum; masaustunde yaklasik 1.000 kullaniciya ulasan, 13 algoritmali ve SonarQube Cloud ile %86.97 coverage izlenen bir sistem oldu.",
      ),
    },
    {
      title: localized("Leadership and research throughput", "Liderlik ve arastirma ciktilari"),
      body: localized(
        "Coordinate IEEE Isik operations reaching 1,100+ students, support AdaLab research, and stay comfortable moving between delivery, mentoring, and community ownership.",
        "IEEE Isik tarafinda 1.100+ ogrenciye ulasan operasyonlari koordine ediyor, AdaLab arastirmalarina destek oluyor ve teslim, mentorluk ile topluluk sahipligini birlikte yurutecek esnekligi koruyorum.",
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
    "1,550+",
    "lines of code and tests",
    "satir kod ve test",
    "NETAS production contributions",
    "NETAS production katkisi",
  ),
  impactMetric(
    "35+",
    "technical events delivered",
    "teknik etkinlik duzenlendi",
    "IEEE Isik leadership and coordination",
    "IEEE Isik liderligi ve koordinasyonu",
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
    "Production-facing APIs, enterprise Java services, and clean system boundaries.",
    "Production odakli API'ler, enterprise Java servisleri ve temiz sistem sinirlari.",
    [
      "Java",
      "C#",
      "Spring Boot",
      "Python",
      "FastAPI",
      "REST APIs",
      "Hibernate / JPA",
      "JSF / PrimeFaces",
      "Microservices",
      "Clean Architecture",
      "JWT / RBAC",
    ],
  ),
  skillGroup(
    "Cloud, observability, and delivery",
    "Cloud, observability ve delivery",
    "Deploy, diagnose, and stabilize distributed systems with quality gates.",
    "Kalite kapilariyla dagitik sistemleri deploy etme, izleme ve stabil hale getirme.",
    [
      "Docker",
      "Kubernetes",
      "GitHub Actions",
      "Spring Cloud Config",
      "Zuul Gateway",
      "AWS EC2",
      "AWS S3",
      "Redis",
      "ElasticSearch",
      "Kibana",
      "RabbitMQ",
      "Celery",
      "Vagrant",
      "Azure DevOps",
      "SonarQube",
    ],
  ),
  skillGroup(
    "Product and interface layer",
    "Urun ve arayuz katmani",
    "Enough frontend fluency to ship end-to-end products without losing system quality.",
    "Sistem kalitesini kaybetmeden uctan uca urun cikarmaya yetecek kadar frontend yetkinligi.",
    ["TypeScript", "Vue.js", "React", "Next.js", "Tailwind CSS", "Electron", "Monaco Editor"],
  ),
  skillGroup(
    "Testing and automation",
    "Test ve otomasyon",
    "Test-first debugging, structured quality gates, and reliable delivery pipelines.",
    "Test-first debugging, yapilandirilmis kalite kapilari ve guvenilir teslim pipeline'lari.",
    ["Pytest", "JUnit", "CI/CD", "SonarQube", "GitLab", "Jira", "Maven", "Gradle", "Test Automation", "Regression Design"],
  ),
  skillGroup(
    "Research and AI-native tooling",
    "Arastirma ve AI-native tooling",
    "Agentic systems, LLM workflows, and algorithm-heavy problem solving.",
    "Ajan tabanli sistemler, LLM workflow'lari ve algoritma agirlikli problem cozumu.",
    ["LLMs", "RAG", "Constraint Optimization", "Data Pipelines", "Algorithmic Evaluation"],
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
    "Constraint-aware scheduling platform spanning desktop and web products.",
    "Masaustu ve web urunlerini kapsayan constraint-aware scheduling platformu.",
    "Built a shared scheduling domain that powers both desktop and web experiences. The product ships 13 registered algorithms, a FastAPI + Next.js web layer, JWT/RBAC, and a Dockerized multi-service runtime with PostgreSQL, Redis, and Celery.",
    "Masaustu ve web deneyimlerini ayni scheduling domain'iyle besleyen sistemi kurdum. Urun; 13 kayitli algoritma, FastAPI + Next.js web kati, JWT/RBAC ve PostgreSQL, Redis, Celery iceren Dockerize coklu servis mimarisi ile gelisiyor.",
    "~1,000 active users on desktop, 86.97% coverage, and a public web release in progress.",
    "Masaustunde ~1.000 aktif kullanici, %86.97 coverage ve devam eden public web release sureci.",
    ["FastAPI", "Next.js", "PostgreSQL", "Redis", "Celery", "Docker", "PyQt6", "SonarQube"],
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
    "Led software development for anti-jamming telemetry systems and control algorithms, while coordinating cross-functional work across mechanics, electronics, and software.",
    "Anti-jamming telemetri sistemleri ve kontrol algoritmalari icin yazilim gelistirmeye liderlik ederken mekanik, elektronik ve yazilim ekipleri arasindaki koordinasyonu da ustlendim.",
    "Ranked 3rd among 700+ projects and managed a 200,000 TL budget including a 165,000 TL TUBITAK grant.",
    "700+ proje arasinda 3. siraya yerlesip 165.000 TL TUBITAK destegi dahil toplam 200.000 TL butce yonetildi.",
    ["Python", "Telemetry", "Systems Design", "Team Coordination"],
    true,
  ),
  projectRecord(
    "agentic-ide-thesis-project",
    "Agentic IDE",
    "Agentic IDE",
    "A thesis-driven IDE concept centered on observe, plan, approve, and apply loops.",
    "Observe, plan, approve ve apply dongusu etrafinda kurulan tez odakli IDE konsepti.",
    "Designing a modular AI-native IDE on TypeScript, Electron, and Monaco without forking VS Code. The architecture focuses on human-in-the-loop approvals, prohibited-command enforcement, and hybrid local/cloud LLM orchestration.",
    "VS Code fork'u kullanmadan TypeScript, Electron ve Monaco tabanli modul bir AI-native IDE tasarliyorum. Mimari; human-in-the-loop onaylar, riskli komut kisitlari ve hibrit lokal/bulut LLM orkestrasyonuna odaklaniyor.",
    "Still in early architecture phase with requirements, diagrams, and CI-backed validation strategy before implementation.",
    "Uygulamaya gecmeden once gereksinimler, mimari diagramlar ve CI destekli dogrulama stratejisiyle erken tasarim asamasinda.",
    ["TypeScript", "Electron", "Monaco Editor", "LLMs", "RAG"],
    true,
  ),
  projectRecord(
    "automated-web-crawler",
    "Automated Web Crawler",
    "Otomatik Web Crawler",
    "Concurrent scraping platform with FastAPI and PostgreSQL backend services.",
    "FastAPI ve PostgreSQL backend servisleriyle kurulan eszamanli scraping platformu.",
    "Built a high-throughput scraping system with Scrapy, BeautifulSoup, FastAPI, and PostgreSQL. The pipeline enforces robots.txt compliance, retry logic, and fault tolerance across concurrent workers.",
    "Scrapy, BeautifulSoup, FastAPI ve PostgreSQL ile yuksek throughput bir scraping sistemi kurdum. Pipeline; robots.txt uyumlulugu, retry mantigi ve concurrent worker'lar arasinda fault tolerance sagliyor.",
    "Reached 89.9% successful execution with strict robots compliance and automatic retry controls.",
    "Siki robots uyumlulugu ve otomatik retry kontrolleriyle %89.9 basari oranina ulasti.",
    ["Python", "Scrapy", "FastAPI", "PostgreSQL", "BeautifulSoup"],
    false,
  ),
  projectRecord(
    "portfolio-platform-web-desktop",
    "Portfolio Platform",
    "Portfolyo Platformu",
    "Full-stack portfolio system with admin workflows and staged deployments.",
    "Admin workflow'lari ve asamali deploy hattina sahip full-stack portfolyo sistemi.",
    "Built a multi-platform portfolio product with 60+ API endpoints, JWT/RBAC, 24-hour GitHub caching, Supabase asset handling, SMTP notifications, and staged CI/CD deployments to Vercel and Railway.",
    "60+ API endpoint, JWT/RBAC, 24 saatlik GitHub cache, Supabase varlik yonetimi, SMTP bildirimleri ve Vercel ile Railway uzerinden asamali CI/CD dagitimlari iceren cok platformlu bir portfolyo urunu gelistirdim.",
    "Quality Gate passed in SonarQube Cloud, with public release pending final security hotspot remediation.",
    "SonarQube Cloud Quality Gate basarili; public release son guvenlik hotspot duzeltmeleri sonrasina planli.",
    ["Next.js", "FastAPI", "PostgreSQL", "Redis", "Supabase", "Railway", "Vercel", "SonarQube"],
    false,
    "https://github.com/TurkishKEBAB/Site",
  ),
];

const aboutDefinition = {
  pageLabel: localized("Profile dossier", "Profil dosyasi"),
  pageTitle: localized("About", "Hakkımda"),
  pageSubtitle: localized(
    "A third-year software engineering student building durable backend systems, cloud delivery paths, and high-ownership engineering leverage.",
    "Dayanikli backend sistemleri, cloud delivery surecleri ve yuksek sahiplik ureten bir ucuncu sinif yazilim muhendisligi ogrencisi.",
  ),
  journeyLabel: localized("Current trajectory", "Guncel yonde"),
  journeyTitle: localized("What I optimize for", "Neyi optimize ediyorum"),
  journeyBody: localized(
    "I optimize for teams where code quality, diagnosis depth, and delivery ownership matter at the same time. The work I enjoy most sits at the intersection of enterprise defects, algorithm-heavy backend systems, and operationally reliable products.",
    "Kod kalitesi, teshis derinligi ve teslim sahipliginin ayni anda onem tasidigi ekiplere dogru ilerliyorum. En cok sevdigim problemler; enterprise defect'ler, algoritma agirlikli backend sistemleri ve operasyonel olarak guvenilir urunlerin kesisiminde yer aliyor.",
  ),
  highlightsLabel: localized("Selected highlights", "Seçili başlıklar"),
  highlightsTitle: localized("Recent proof points", "Son donem kanitlar"),
  highlights: [
    localized(
      "NETAS internship: 25 commits and 1,550 lines of code and tests across four Jira tickets on a production Java microservices platform.",
      "NETAS staji: production Java mikroservis platformunda dort Jira ticket boyunca 25 commit ve 1.550 satir kod-test katkisi.",
    ),
    localized(
      "Timezone investigation: proved a silent UTC vs UTC+3 mismatch with YAML and ELK analysis, then documented the fix path with 600+ lines of tests.",
      "Timezone incelemesi: sessiz kalan UTC vs UTC+3 uyumsuzlugunu YAML ve ELK analizi ile kanitlayip cozum yolunu 600+ satir test ile belgeledim.",
    ),
    localized(
      "IEEE Isik and AdaLab: combine 35+ technical events, 1,100+ student reach, and ongoing AI/data analytics research support.",
      "IEEE Isik ve AdaLab: 35+ teknik etkinlik, 1.100+ ogrenci erisimi ve suren AI/veri analitigi arastirma destegini birlikte yuruttum.",
    ),
    localized(
      "Cross-domain adaptation: moved between enterprise software, architecture project coordination, mentoring, and defense-tech delivery without losing execution quality.",
      "Alanlar arasi adaptasyon: enterprise yazilim, mimari proje koordinasyonu, mentorluk ve savunma teknolojileri teslimi arasinda uygulama kalitesini koruyarak gecis yaptim.",
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
  pageTitle: localized("Get in touch", "İletişime geç"),
  pageSubtitle: localized(
    "The reliable path is direct contact first. The form still works when the API is healthy and degrades gracefully when it is not.",
    "Guvenilir yol once dogrudan iletisimdir. Form API saglikliyken calisir, degilse de zarif bicimde degrade olur.",
  ),
  formLabel: localized("Message", "Mesaj"),
  formTitle: localized("Send a note", "Bir not birak"),
  formDescription: localized(
    "If the form request fails, your draft stays on the page and you can copy it or open a prepared email.",
    "Form isteği başarısız olursa taslağın sayfada kalır; kopyalayabilir veya hazır e-posta taslağı açabilirsin.",
  ),
  fields: contactFieldLabels,
  placeholders: contactPlaceholders,
  submit: localized("Send message", "Mesajı gönder"),
  sending: localized("Sending...", "Gönderiliyor..."),
  success: localized(
    "Your message has been sent successfully.",
    "Mesajınız başarıyla gönderildi.",
  ),
  failure: localized(
    "The contact API is unavailable right now. Your draft is still here so you can copy it or open an email draft instead.",
    "İletişim API'si şu anda ulaşılamıyor. Taslağınız sayfada tutuldu; kopyalayabilir veya e-posta taslağı açabilirsiniz.",
  ),
  validation: contactValidationMessages,
  infoTitle: localized("Direct channels", "Dogrudan kanallar"),
  availabilityTitle: localized("Currently open to", "Su alanlara acigim"),
  availabilityBody: localized(
    "Part-time software engineering, backend systems, cloud platform work, and DevOps automation roles.",
    "Part-time software engineering, backend sistemleri, cloud platform calismalari ve DevOps otomasyonu rolleri.",
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
      "Yiğit Okur | Software Engineer - Cloud & DevOps",
      "Yiğit Okur | Software Engineer - Cloud & DevOps",
    ),
    description: localized(
      "Portfolio of Yiğit Okur focused on backend systems, cloud-native architecture, DevOps automation, and high-impact engineering delivery.",
      "Yiğit Okur'un backend sistemleri, cloud-native mimari, DevOps otomasyonu ve yüksek etkili mühendislik teslimine odaklı portfolyosu.",
    ),
  },
  about: {
    title: localized("About | Yiğit Okur", "Hakkımda | Yiğit Okur"),
    description: localized(
      "Impact-oriented profile of Yiğit Okur across enterprise debugging, scheduling systems, technical leadership, and research support.",
      "Yiğit Okur'un enterprise debugging, scheduling sistemleri, teknik liderlik ve araştırma desteğini birleştiren etki odaklı profili.",
    ),
  },
  projects: {
    title: localized("Projects | Yiğit Okur", "Projeler | Yiğit Okur"),
    description: localized(
      "Selected engineering projects across scheduling optimization, defense telemetry, AI-native tooling, and platform delivery.",
      "Scheduling optimizasyonu, savunma telemetrisi, AI-native tooling ve platform teslimini kapsayan secili muhendislik projeleri.",
    ),
  },
  contact: {
    title: localized("Contact | Yiğit Okur", "İletişim | Yiğit Okur"),
    description: localized(
      "Direct contact channels for software engineering collaboration, backend roles, and cloud-focused opportunities.",
      "Yazilim muhendisligi is birlikleri, backend roller ve cloud odakli firsatlar icin dogrudan iletisim kanallari.",
    ),
  },
  blog: {
    title: localized("Blog | Yiğit Okur", "Blog | Yiğit Okur"),
    description: localized(
      "Engineering notes and case studies. Blog reliability improvements are planned via ISR in a later phase.",
      "Muhendislik notlari ve case study'ler. Blog guvenilirligi sonraki fazda ISR ile gelistirilecek.",
    ),
  },
  login: {
    title: localized("Admin Login | Yiğit Okur", "Admin Girişi | Yiğit Okur"),
    description: localized(
      "Admin access for the portfolio control surface.",
      "Portfolyo yonetim yuzeyi icin admin erisimi.",
    ),
  },
  admin: {
    title: localized("Admin | Yiğit Okur", "Admin | Yiğit Okur"),
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
  "Yiğit Okur",
  "Software Engineer",
  "Backend Engineer",
  "Cloud DevOps",
  "FastAPI",
  "Next.js",
  "Spring Boot",
  "Platform Engineering",
  "Portfolio",
];

export const resumeText = `Yiğit Okur
Software Engineer | Cloud & DevOps Focus
Website: https://yigitokur.me
Email: yigitokur@ieee.org
Phone: +90 535 573 3873
Location: Bağcılar, İstanbul, Turkey

SUMMARY
Third-year Software Engineering student at Isik University seeking a part-time software engineering or Cloud/DevOps role. Contributed to production systems at NETAS on an enterprise Java microservices platform and ships personal products with CI/CD, Docker, PostgreSQL, and SonarQube.

EDUCATION
- Isik University - B.Sc. Software Engineering (2023-2027 expected)
- Ergun Oner-Mehmet Oner Anatolian High School (2019-2023)

EXPERIENCE
- NETAS Telekomunikasyon A.S. - Software Engineering Intern (Jan 2026 - Feb 2026)
- Arch of Sigma - Project Management Intern, Remote (Nov 2025 - Jan 2026)
- Isik University CSE Department - Student Assistant (Feb 2024 - Present)
- AdaLab - Academic Data Analytics Lab - Research Assistant (Dec 2025 - Present)

SELECTED HIGHLIGHTS
- NETAS: 25 commits and 1,550 lines of code and tests across four Jira tickets on a production Java microservices platform.
- Timezone case study: traced a silent UTC vs UTC+3 mismatch with YAML and ELK analysis, then documented remediation with 600+ lines of targeted tests.
- IsikSchedule: built a dual-platform scheduling product serving ~1,000 active desktop users with a 13-algorithm engine and 86.97% coverage.
- IEEE Isik (Vice President & Project Coordinator): coordinate 35+ technical events reaching 1,100+ students; SIU 2025 organization committee and IEEEXtreme'24 lead organizer.

SELECTED PROJECTS
- IsikSchedule Platform - FastAPI, Next.js, PostgreSQL, Redis, Docker, PyQt6
- Agentic IDE - TypeScript, Electron, Monaco, LLMs, RAG
- Teknofest Sarkan UAV Defense Platform - Python, telemetry, RF-oriented systems
- Automated Web Crawler - Scrapy, FastAPI, PostgreSQL
- Portfolio Platform - FastAPI, Next.js, PostgreSQL, Docker

KEY STACK
Java, C#, Spring Boot, Python, FastAPI, TypeScript, Next.js, Docker, Kubernetes, AWS, Azure DevOps, PostgreSQL, Redis, RabbitMQ, Celery, ElasticSearch, SonarQube, GitHub Actions.

CERTIFICATIONS
- Cloud & DevOps: Linux for Cloud & DevOps Engineers; Master System Design & Software Architecture; Networking Fundamentals (CCNA); DevSecOps.
- AI & Engineering: A.I. & Machine Learning Bootcamp (Miuul); Data Structures + Algorithms; TechCamp.
- Language: English C1 (Cambridge University & American Culture Institute); Java Programming (C ve Sistem Programcilari Dernegi).

ACHIEVEMENTS
- FIRST Robotics Competition (FRC) Houston World Championship Finalist - Team 7840 EMONER (2019).
- TUBITAK 4009: research in physics, optics, and CRISPR-Cas9 technology.

LINKS
GitHub: https://github.com/TurkishKEBAB
LinkedIn: https://www.linkedin.com/in/yigit-okur-050b5b278
`;

export const getFeaturedProjects = (): ProjectRecord[] =>
  projectRecords.filter((project) => project.featured);
