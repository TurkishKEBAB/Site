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
  captchaRequired: string;
  captchaUnavailable: string;
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
  heroEyebrow: localized("> init system.profile", "> sistem.profil başlatılıyor"),
  heroTitleFirst: localized("YİĞİT", "YİĞİT"),
  heroTitleSecond: localized("OKUR", "OKUR"),
  heroDescription: localized(
    "Third-year Software Engineering student at Isik University focused on enterprise backend systems, cloud delivery, and DevOps automation. At NETAS, I contributed production code across four Jira tickets and turned a silent timezone mismatch into a documented regression safety net with targeted tests.",
    "Işık Üniversitesi'nde üçüncü sınıf Yazılım Mühendisliği öğrencisi olarak enterprise backend sistemleri, cloud delivery ve DevOps otomasyonu üzerine odaklanıyorum. NETAS'ta dört Jira ticket boyunca production koda katkıda bulunup sessiz kalan timezone uyumsuzluğunu hedefli testlerle kalıcı bir regression güvencesine çevirdim.",
  ),
  availabilityLabel: localized(
    "Available for part-time software engineering and cloud roles",
    "Part-time software engineering ve cloud rollerine açığım",
  ),
  availabilityNote: localized(
    "Open to backend, platform, DevOps, and quality-focused engineering teams.",
    "Backend, platform, DevOps ve kalite odaklı mühendislik ekiplerine açığım.",
  ),
  primaryCta: localized("Get in touch", "İletişime geç"),
  secondaryCta: localized("Download CV", "CV indir"),
  tertiaryCta: localized("View projects", "Projeleri gör"),
  overviewLabel: localized("Overview", "Genel bakış"),
  overviewTitle: localized("Impact-first profile", "Etki odaklı profil"),
  skillsLabel: localized("Capabilities", "Yetkinlikler"),
  skillsTitle: localized("Technical system", "Teknik sistemim"),
  skillsSubtitle: localized(
    "Grouped by the stacks I actually use to ship backend, cloud, observability, and product work.",
    "Backend, cloud, observability ve ürün teslimi için gerçekte kullandığım teknoloji grupları.",
  ),
  projectsLabel: localized("Featured work", "Öne çıkan işler"),
  projectsTitle: localized("Selected projects", "Seçili projeler"),
  projectsSubtitle: localized(
    "A focused set of systems that represent product scale, technical depth, and delivery ownership.",
    "Ürün olgunluğu, teknik derinlik ve teslim sorumluluğunu birlikte gösteren odaklı bir proje seçimi.",
  ),
  ctaLabel: localized("Contact", "İletişim"),
  ctaTitle: localized("Let's build something sharp", "Birlikte keskin bir şeyler üretelim"),
  ctaBody: localized(
    "If you want to discuss backend systems, cloud architecture, DevOps automation, or AI-native workflows, I am happy to connect.",
    "Backend sistemleri, cloud mimarisi, DevOps otomasyonu veya AI-native workflow'lar konuşmak istersen bağlanabiliriz.",
  ),
  scroll: localized("Scroll", "Kaydır"),
  roleParts: homeRoleParts,
  overviewCards: [
    {
      title: localized("NETAS production case study", "NETAS production case study"),
      body: localized(
        "Shipped 25 commits and 1,550 lines of code and tests across four Jira tickets, then proved a silent timezone mismatch with YAML and ELK analysis plus 600+ lines of targeted tests.",
        "Dört Jira ticket boyunca 25 commit ve 1.550 satır kod-test katkısı yaptım; ardından sessiz timezone uyumsuzluğunu YAML ve ELK analizi ile ortaya koyup 600+ satır hedefli testle kanıtladım.",
      ),
    },
    {
      title: localized("IsikSchedule product maturity", "IsikSchedule ürün olgunluğu"),
      body: localized(
        "The desktop and web products are independent implementations: the desktop registry exposes 13 verified solvers, while the web product uses a synchronous exact search over its own SQLite-backed application.",
        "Masaüstü ve web ürünleri bağımsız implementasyonlardır: masaüstü registry'sinde doğrulanmış 13 solver bulunur; web ürünü ise kendi SQLite tabanlı uygulamasında senkron kesin arama kullanır.",
      ),
    },
    {
      title: localized("Leadership and research throughput", "Liderlik ve araştırma çıktıları"),
      body: localized(
        "Coordinate IEEE Isik operations reaching 1,100+ students, support AdaLab research, and stay comfortable moving between delivery, mentoring, and community ownership.",
        "IEEE Işık tarafında 1.100+ öğrenciye ulaşan operasyonları koordine ediyor, AdaLab araştırmalarına destek oluyor ve teslim, mentorluk ile topluluk sahipliğini birlikte yürütecek esnekliği koruyorum.",
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
    "13",
    "registered desktop solvers",
    "kayıtlı masaüstü solver",
    "Static count from the isikschedule-desktop algorithm registry",
    "isikschedule-desktop algoritma registry'sinin statik sayımı",
  ),
  impactMetric(
    "1,550+",
    "lines of code and tests",
    "satır kod ve test",
    "NETAS production contributions",
    "NETAS production katkısı",
  ),
  impactMetric(
    "35+",
    "technical events delivered",
    "teknik etkinlik düzenlendi",
    "IEEE Isik leadership and coordination",
    "IEEE Işık liderliği ve koordinasyonu",
  ),
];

const skillGroup = (
  titleEn: string,
  titleTr: string,
  summaryEn: string,
  summaryTr: string,
): SkillGroup => ({
  title: localized(titleEn, titleTr),
  summary: localized(summaryEn, summaryTr),
});

export const skillGroups: SkillGroup[] = [
  skillGroup(
    "Backend and architecture",
    "Backend ve mimari",
    "Production-facing APIs, enterprise Java services, and clean system boundaries.",
    "Production odaklı API'ler, enterprise Java servisleri ve temiz sistem sınırları.",
  ),
  skillGroup(
    "Cloud, observability, and delivery",
    "Cloud, observability ve delivery",
    "Deploy, diagnose, and stabilize distributed systems with quality gates.",
    "Kalite kapılarıyla dağıtık sistemleri deploy etme, izleme ve stabil hale getirme.",
  ),
  skillGroup(
    "Product and interface layer",
    "Ürün ve arayüz katmanı",
    "Enough frontend fluency to ship end-to-end products without losing system quality.",
    "Sistem kalitesini kaybetmeden uçtan uca ürün çıkarmaya yetecek kadar frontend yetkinliği.",
  ),
  skillGroup(
    "Testing and automation",
    "Test ve otomasyon",
    "Test-first debugging, structured quality gates, and reliable delivery pipelines.",
    "Test-first debugging, yapılandırılmış kalite kapıları ve güvenilir teslim pipeline'ları.",
  ),
  skillGroup(
    "Research and AI-native tooling",
    "Araştırma ve AI-native tooling",
    "Agentic systems, LLM workflows, and algorithm-heavy problem solving.",
    "Ajan tabanlı sistemler, LLM workflow'ları ve algoritma ağırlıklı problem çözümü.",
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
    "Independent desktop and web scheduling products for Işık University catalogs.",
    "Işık Üniversitesi katalogları için bağımsız masaüstü ve web programlama ürünleri.",
    "The PyQt6 desktop client has a verified 13-solver registry. The separate FastAPI + Next.js web product uses its own synchronous exact solver, SQLite persistence, Excel catalog ingestion, and JWT/admin controls; the repositories do not share a solver package.",
    "PyQt6 masaüstü istemcisinde doğrulanmış 13 solver registry'si bulunur. Ayrı FastAPI + Next.js web ürünü kendi senkron kesin solver'ını, SQLite kalıcılığını, Excel katalog alımını ve JWT/admin kontrollerini kullanır; repolar ortak solver paketi paylaşmaz.",
    "Measured web evidence: 1,301 catalog rows, 28 route handlers, 20 returned schedules from a bounded search; desktop user count and 86.97% coverage remain unsourced.",
    "Web ölçümü: 1.301 katalog satırı, 28 route handler ve sınırlandırılmış aramadan dönen 20 program; masaüstü kullanıcı sayısı ve %86.97 coverage kaynaksız kaldı.",
    ["Python", "FastAPI", "Next.js", "SQLite", "PyQt6", "JWT", "RBAC"],
    true,
    "https://github.com/TurkishKEBAB/isikschedule-core",
    "https://github.com/TurkishKEBAB/isikschedule-web",
  ),
  projectRecord(
    "teknofest-sarkan-uav-defense-platform",
    "Teknofest Sarkan UAV Defense Platform",
    "Teknofest Sarkan İHA Savunma Platformu",
    "Project record pending technical source and publication clearance.",
    "Teknik kaynak ve yayın izni bekleyen proje kaydı.",
    "No source repository or publishable technical report was found in the audited workspaces, so the architecture is not represented as verified.",
    "Denetlenen çalışma alanlarında kaynak repo veya yayınlanabilir teknik rapor bulunamadığı için mimari doğrulanmış olarak temsil edilmiyor.",
    "Owner-provided technical evidence, ranking/budget proof, and approved visuals are pending.",
    "Sahibinden teknik kanıt, derece/bütçe belgesi ve onaylı görseller bekleniyor.",
    ["Systems Design", "Team Coordination"],
    true,
  ),
  projectRecord(
    "agentic-ide-thesis-project",
    "Agentic IDE",
    "Agentic IDE",
    "Safety-oriented Agentic IDE thesis planning and requirements repository.",
    "Güvenlik odaklı Agentic IDE tez planlama ve gereksinim reposu.",
    "The repository contains planning documents and accepted ADRs, not an Electron/Monaco application. Its proposed MVP centers on a single-agent plan-first loop, explicit approval, workspace-bound writes, local retrieval, and model-provider boundaries.",
    "Repo, Electron/Monaco uygulaması değil; planlama dokümanları ve kabul edilmiş ADR'ler içeriyor. Önerilen MVP; tek ajanlı plan-önce akış, açık onay, workspace sınırları, lokal retrieval ve model sağlayıcı sınırlarına odaklanıyor.",
    "Evidence in the repository: 9 ADRs, 57 non-epic backlog issues, 5 MVP scenarios, and a planned 20-task evaluation target.",
    "Repo kanıtı: 9 ADR, 57 epic dışı backlog issue'su, 5 MVP senaryosu ve planlanan 20 görevlik değerlendirme hedefi.",
    ["TypeScript", "Electron", "Monaco Editor", "LLMs", "RAG"],
    true,
    "https://github.com/TurkishKEBAB/Agentic-Ide",
  ),
  projectRecord(
    "automated-web-crawler",
    "Automated Web Crawler",
    "Otomatik Web Crawler",
    "Project record pending crawler source and benchmark evidence.",
    "Crawler kaynağı ve benchmark kanıtı bekleyen proje kaydı.",
    "No crawler repository, archive, runnable benchmark, or operational screenshot was found in the audited workspaces; no crawler architecture is published as verified.",
    "Denetlenen çalışma alanlarında crawler reposu, arşivi, çalıştırılabilir benchmark'ı veya operasyon ekranı bulunamadı; crawler mimarisi doğrulanmış olarak yayınlanmıyor.",
    "Source code, robots/rate-limit tests, operational logs, and approved visuals are pending.",
    "Kaynak kodu, robots/rate-limit testleri, operasyon logları ve onaylı görseller bekleniyor.",
    ["Python"],
    false,
  ),
  projectRecord(
    "portfolio-platform-web-desktop",
    "Portfolio Platform",
    "Portfolyo Platformu",
    "Full-stack portfolio system with admin workflows and provider-native deployments.",
    "Admin workflow'ları ve sağlayıcı-yerel dağıtımlara sahip full-stack portfolyo sistemi.",
    "Built a Next.js 16 App Router frontend and FastAPI backend with 72 route handlers, JWT/RBAC, 24-hour GitHub caching with an in-memory fallback, Supabase asset handling, SMTP notifications, and independent Vercel/Railway GitHub integrations.",
    "72 route handler'lı Next.js 16 App Router frontend ve FastAPI backend; JWT/RBAC, bellek yedekli 24 saatlik GitHub cache, Supabase varlık yönetimi, SMTP bildirimleri ve bağımsız Vercel/Railway GitHub entegrasyonları geliştirdim.",
    "The repository verifies the gate mechanism and deployment topology; an external SonarCloud 'passed' result is not claimed without dashboard evidence.",
    "Repo kalite kapısı mekanizmasını ve dağıtım topolojisini doğruluyor; dashboard kanıtı olmadan harici SonarCloud 'passed' sonucu iddia edilmiyor.",
    ["Next.js", "FastAPI", "PostgreSQL", "Redis", "Supabase", "Railway", "Vercel", "SonarQube"],
    false,
    "https://github.com/TurkishKEBAB/Site",
  ),
];

const aboutDefinition = {
  pageLabel: localized("Profile dossier", "Profil dosyası"),
  pageTitle: localized("About", "Hakkımda"),
  pageSubtitle: localized(
    "A third-year software engineering student building durable backend systems, cloud delivery paths, and high-ownership engineering leverage.",
    "Dayanıklı backend sistemleri, cloud delivery süreçleri ve yüksek sahiplik üreten bir üçüncü sınıf yazılım mühendisliği öğrencisi.",
  ),
  journeyLabel: localized("Current trajectory", "Güncel rota"),
  journeyTitle: localized("What I optimize for", "Neyi optimize ediyorum"),
  journeyBody: localized(
    "I optimize for teams where code quality, diagnosis depth, and delivery ownership matter at the same time. The work I enjoy most sits at the intersection of enterprise defects, algorithm-heavy backend systems, and operationally reliable products.",
    "Kod kalitesi, teşhis derinliği ve teslim sahipliğinin aynı anda önem taşıdığı ekiplere doğru ilerliyorum. En çok sevdiğim problemler; enterprise defect'ler, algoritma ağırlıklı backend sistemleri ve operasyonel olarak güvenilir ürünlerin kesişiminde yer alıyor.",
  ),
  highlightsLabel: localized("Selected highlights", "Seçili başlıklar"),
  highlightsTitle: localized("Recent proof points", "Son dönem kanıtlar"),
  highlights: [
    localized(
      "NETAS internship: 25 commits and 1,550 lines of code and tests across four Jira tickets on a production Java microservices platform.",
      "NETAS stajı: production Java mikroservis platformunda dört Jira ticket boyunca 25 commit ve 1.550 satır kod-test katkısı.",
    ),
    localized(
      "Timezone investigation: proved a silent UTC vs UTC+3 mismatch with YAML and ELK analysis, then documented the fix path with 600+ lines of tests.",
      "Timezone incelemesi: sessiz kalan UTC vs UTC+3 uyumsuzluğunu YAML ve ELK analizi ile kanıtlayıp çözüm yolunu 600+ satır test ile belgeledim.",
    ),
    localized(
      "IEEE Isik and AdaLab: combine 35+ technical events, 1,100+ student reach, and ongoing AI/data analytics research support.",
      "IEEE Işık ve AdaLab: 35+ teknik etkinlik, 1.100+ öğrenci erişimi ve süren AI/veri analitiği araştırma desteğini birlikte yürüttüm.",
    ),
    localized(
      "Cross-domain adaptation: moved between enterprise software, architecture project coordination, mentoring, and defense-tech delivery without losing execution quality.",
      "Alanlar arası adaptasyon: enterprise yazılım, mimari proje koordinasyonu, mentorluk ve savunma teknolojileri teslimi arasında uygulama kalitesini koruyarak geçiş yaptım.",
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
  name: localized("Your full name", "Adınız soyadınız"),
  email: localized("you@example.com", "ornek@eposta.com"),
  subject: localized("What would you like to discuss?", "Hangi konuda konuşmak istersiniz?"),
  message: localized(
    "Share the project, role, or topic you want to discuss.",
    "Konuşmak istediğiniz rol, proje veya konuyu paylaşın.",
  ),
} satisfies Record<ContactFieldKey, LocalizedString>;

const contactValidationMessages = {
  name: localized("Please enter at least 2 characters.", "Lütfen en az 2 karakter girin."),
  email: localized(
    "Please enter a valid email address.",
    "Lütfen geçerli bir e-posta adresi girin.",
  ),
  subject: localized(
    "Subject must be at least 3 characters or left empty.",
    "Konu en az 3 karakter olmalı veya boş bırakılmalıdır.",
  ),
  message: localized(
    "Your message must be at least 10 characters long.",
    "Mesajınız en az 10 karakterden oluşmalıdır.",
  ),
} satisfies Record<ContactFieldKey, LocalizedString>;

const contactDefinition = {
  pageLabel: localized("Channel", "Kanal"),
  pageTitle: localized("Get in touch", "İletişime geç"),
  pageSubtitle: localized(
    "The reliable path is direct contact first. The form still works when the API is healthy and degrades gracefully when it is not.",
    "Güvenilir yol önce doğrudan iletişimdir. Form API sağlıklıyken çalışır, değilse de zarif biçimde degrade olur.",
  ),
  formLabel: localized("Message", "Mesaj"),
  formTitle: localized("Send a note", "Bir not bırak"),
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
  captchaRequired: localized(
    "Please complete the security check before sending.",
    "L\u00fctfen g\u00f6ndermeden \u00f6nce g\u00fcvenlik kontrol\u00fcn\u00fc tamamlay\u0131n.",
  ),
  captchaUnavailable: localized(
    "The security check could not load. Please try again or use the email draft instead.",
    "G\u00fcvenlik kontrol\u00fc y\u00fcklenemedi. L\u00fctfen tekrar deneyin veya e-posta tasla\u011f\u0131n\u0131 kullan\u0131n.",
  ),
  validation: contactValidationMessages,
  infoTitle: localized("Direct channels", "Doğrudan kanallar"),
  availabilityTitle: localized("Currently open to", "Şu alanlara açığım"),
  availabilityBody: localized(
    "Part-time software engineering, backend systems, cloud platform work, and DevOps automation roles.",
    "Part-time software engineering, backend sistemleri, cloud platform çalışmaları ve DevOps otomasyonu rolleri.",
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
  captchaRequired: getLocaleValue(contactDefinition.captchaRequired, locale),
  captchaUnavailable: getLocaleValue(contactDefinition.captchaUnavailable, locale),
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
      "Scheduling optimizasyonu, savunma telemetrisi, AI-native tooling ve platform teslimini kapsayan seçili mühendislik projeleri.",
    ),
  },
  contact: {
    title: localized("Contact | Yiğit Okur", "İletişim | Yiğit Okur"),
    description: localized(
      "Direct contact channels for software engineering collaboration, backend roles, and cloud-focused opportunities.",
      "Yazılım mühendisliği iş birlikleri, backend roller ve cloud odaklı fırsatlar için doğrudan iletişim kanalları.",
    ),
  },
  blog: {
    title: localized("Blog | Yiğit Okur", "Blog | Yiğit Okur"),
    description: localized(
      "Engineering notes and case studies. Blog reliability improvements are planned via ISR in a later phase.",
      "Mühendislik notları ve case study'ler. Blog güvenilirliği sonraki fazda ISR ile geliştirilecek.",
    ),
  },
  login: {
    title: localized("Admin Login | Yiğit Okur", "Admin Girişi | Yiğit Okur"),
    description: localized(
      "Admin access for the portfolio control surface.",
      "Portfolyo yönetim yüzeyi için admin erişimi.",
    ),
  },
  admin: {
    title: localized("Admin | Yiğit Okur", "Admin | Yiğit Okur"),
    description: localized(
      "Authenticated portfolio administration surface.",
      "Kimlik doğrulanmış portfolyo yönetim yüzeyi.",
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
- IsikSchedule: built independent desktop and web scheduling products; the desktop registry has 13 verified solvers, while the web product uses synchronous exact search over SQLite.
- IEEE Isik (Vice President & Project Coordinator): coordinate 35+ technical events reaching 1,100+ students; SIU 2025 organization committee and IEEEXtreme'24 lead organizer.

SELECTED PROJECTS
- IsikSchedule Platform - PyQt6, FastAPI, Next.js, SQLite, JWT/RBAC
- Agentic IDE - TypeScript, Electron, Monaco, LLMs, RAG
- Teknofest Sarkan UAV Defense Platform - source and publication clearance pending
- Automated Web Crawler - source and benchmark evidence pending
- Portfolio Platform - FastAPI, Next.js, PostgreSQL, Redis, provider-native Vercel/Railway

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
