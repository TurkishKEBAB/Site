import type { LocalizedString } from "@/content/site";

// GitLens-style career history for the About page.

export interface CareerLane {
  /** Doubles as the branch name shown in the graph rail. */
  id: string;
  /** What the branch is for, rendered under the branch name. */
  role: LocalizedString;
  color: string;
  ongoing?: boolean;
}

/** Year marker on the map's time axis, anchored to a node position. */
export interface CareerAxisMark {
  t: number;
  label: string;
}

export interface CareerNode {
  id: string;
  lane: string;
  /** Position along the timeline, 0–100. */
  t: number;
  when: LocalizedString;
  title: LocalizedString;
  body?: LocalizedString;
  bullets?: LocalizedString[];
  tags?: string[];
  href?: string;
  kind?: "origin" | "milestone" | "branch" | "head";
}

export interface CareerLink {
  from: string;
  to: string;
}

export interface CareerGraph {
  lanes: CareerLane[];
  nodes: CareerNode[];
  links: CareerLink[];
  axis: CareerAxisMark[];
}

const localized = (en: string, tr: string): LocalizedString => ({ en, tr });

export const careerGraph: CareerGraph = {
  lanes: [
    { id: "origin", role: localized("foundation", "temel"), color: "var(--lane-origin)" },
    { id: "main", role: localized("software engineering", "yazılım mühendisliği"), color: "var(--lane-main)", ongoing: true },
    { id: "projects", role: localized("shipped systems", "teslim edilen sistemler"), color: "var(--lane-projects)", ongoing: true },
    { id: "industry", role: localized("professional delivery", "profesyonel teslim"), color: "var(--lane-industry)" },
    { id: "community", role: localized("leadership", "liderlik"), color: "var(--lane-community)", ongoing: true },
    { id: "signals", role: localized("learning", "öğrenme"), color: "var(--lane-signals)", ongoing: true },
  ],
  nodes: [
    {
      id: "frc-finalist",
      lane: "origin",
      t: 2,
      when: localized("2019", "2019"),
      title: localized("FRC Houston World Championship finalist", "FRC Houston Dünya Şampiyonası finalisti"),
      body: localized(
        "Reached the Houston world championship finals with FIRST Robotics Competition Team 7840 EMONER.",
        "FIRST Robotics Competition Team 7840 EMONER ile Houston dünya şampiyonası finallerine ulaştım.",
      ),
      tags: ["FRC", "Robotics", "Team 7840"],
      kind: "origin",
    },
    {
      id: "high-school",
      lane: "origin",
      t: 13,
      when: localized("2019 – 2023", "2019 – 2023"),
      title: localized("High school foundation", "Lise temeli"),
      body: localized(
        "Software and electronics focused education at Ergün Öner-Mehmet Öner Anatolian High School.",
        "Ergün Öner-Mehmet Öner Anadolu Lisesi'nde yazılım ve elektronik odaklı eğitim.",
      ),
      tags: ["Software", "Electronics", "Foundation"],
      kind: "origin",
    },
    {
      id: "tubitak-research",
      lane: "origin",
      t: 18,
      when: localized("High school period", "Lise dönemi"),
      title: localized("TÜBİTAK 4009 research", "TÜBİTAK 4009 araştırması"),
      body: localized(
        "Research experience across physics, optics, and CRISPR-Cas9 technology.",
        "Fizik, optik ve CRISPR-Cas9 teknolojisi alanlarında araştırma deneyimi.",
      ),
      tags: ["Research", "Physics", "Optics", "CRISPR-Cas9"],
      kind: "milestone",
    },
    {
      id: "university-start",
      lane: "main",
      t: 24,
      when: localized("2023 – 2027 (Expected)", "2023 – 2027 (Beklenen)"),
      title: localized("init — Software Engineering, Işık University", "init — Işık Üniversitesi Yazılım Mühendisliği"),
      body: localized(
        "Started the B.Sc. Software Engineering track and moved the foundation into a systems-building practice.",
        "Yazılım Mühendisliği lisans programına başlayarak temeli sistem geliştirme pratiğine taşıdım.",
      ),
      tags: ["B.Sc.", "Software Engineering", "Işık University"],
      kind: "branch",
    },
    {
      id: "core-curriculum",
      lane: "main",
      t: 34,
      when: localized("University curriculum", "Üniversite müfredatı"),
      title: localized("Core curriculum lands", "Temel müfredat oturuyor"),
      body: localized(
        "Data structures, OOP, databases, software architecture, and engineering fundamentals became the base for later systems.",
        "Veri yapıları, OOP, veritabanları, yazılım mimarisi ve mühendislik temelleri sonraki sistemlerin tabanını oluşturdu.",
      ),
      tags: ["Algorithms", "OOP", "Databases", "Architecture"],
      kind: "milestone",
    },
    {
      id: "portfolio-platform",
      lane: "projects",
      t: 38,
      when: localized("Jan 2024 – Present", "Ocak 2024 – Günümüz"),
      title: localized("Portfolio Platform", "Portfolyo Platformu"),
      body: localized(
        "Full-stack portfolio system with 60+ API endpoints, JWT/RBAC, GitHub caching, Supabase assets, SMTP notifications, and staged Vercel/Railway deployments.",
        "60+ API endpoint, JWT/RBAC, GitHub cache, Supabase varlık yönetimi, SMTP bildirimleri ve aşamalı Vercel/Railway dağıtımlarına sahip full-stack portfolyo sistemi.",
      ),
      tags: ["FastAPI", "Next.js", "PostgreSQL", "Docker", "Vercel", "Railway"],
      href: "https://github.com/TurkishKEBAB/Site",
      kind: "branch",
    },
    {
      id: "student-assistant",
      lane: "industry",
      t: 40,
      when: localized("Feb 2024 – Present", "Şubat 2024 – Günümüz"),
      title: localized("Student Assistant — Işık CSE", "Öğrenci Asistanı — Işık CSE"),
      body: localized(
        "Mentors students during OOP labs, reviews code, and reinforces clean-code and software-design fundamentals.",
        "OOP laboratuvarlarında öğrencilere mentorluk yapıyor, kod inceliyor ve clean code ile yazılım tasarım temellerini güçlendiriyorum.",
      ),
      tags: ["OOP", "Clean Code", "Mentoring"],
      kind: "branch",
    },
    {
      id: "ieeextreme",
      lane: "community",
      t: 45,
      when: localized("Jul 2024", "Temmuz 2024"),
      title: localized("Lead organizer — IEEEXtreme'24 camp", "Baş Organizatör — IEEEXtreme'24 kampı"),
      body: localized(
        "Directed a national programming bootcamp focused on competitive programming, algorithms, and data structures for 200+ participants.",
        "200+ katılımcı için rekabetçi programlama, algoritmalar ve veri yapıları odaklı ulusal programlama kampını yönettim.",
      ),
      tags: ["Algorithms", "Community", "200+ participants"],
      href: "https://isikieee.com.tr/xtreme",
      kind: "branch",
    },
    {
      id: "teknofest",
      lane: "projects",
      t: 53,
      when: localized("May 2024 – May 2025", "Mayıs 2024 – Mayıs 2025"),
      title: localized("Teknofest Sarkan UAV defense platform", "Teknofest Sarkan İHA savunma platformu"),
      body: localized(
        "Software lead for anti-jamming telemetry and control algorithms; ranked 3rd among 700+ projects in preliminary evaluation.",
        "Anti-jamming telemetri ve kontrol algoritmaları için yazılım liderliği; ön değerlendirmede 700+ proje arasında 3.lük.",
      ),
      bullets: [
        localized("Managed a 200,000₺ budget including a 165,000₺ TÜBİTAK R&D grant and Savronik Defense sponsorship.", "165.000₺ TÜBİTAK Ar-Ge hibesi ve Savronik Defense sponsorluğu dahil 200.000₺ bütçeyi yönettim."),
        localized("Coordinated mechanics, electronics, and software teams around the telemetry platform.", "Mekanik, elektronik ve yazılım ekiplerini telemetri platformu etrafında koordine ettim."),
      ],
      tags: ["Python", "Telemetry", "RF Systems", "3rd / 700+"],
      kind: "milestone",
    },
    {
      id: "isikschedule",
      lane: "projects",
      t: 61,
      when: localized("2024 – Present", "2024 – Günümüz"),
      title: localized("IşıkSchedule Platform", "IşıkSchedule Platformu"),
      body: localized(
        "Dual-platform scheduling product with a constraint-aware engine and a desktop deployment serving approximately 1,000 active users.",
        "Yaklaşık 1.000 aktif kullanıcıya hizmet veren masaüstü dağıtımı ve kısıt farkındalıklı motoru olan çift platformlu programlama ürünü.",
      ),
      bullets: [
        localized("Built a 13-algorithm engine including Genetic, Simulated Annealing, Tabu Search, PSO, and Hybrid GA+SA.", "Genetic, Simulated Annealing, Tabu Search, PSO ve Hybrid GA+SA dahil 13 algoritmalı motor geliştirdim."),
        localized("Architected the PyQt6 to FastAPI/Next.js dual-platform migration with PostgreSQL, Redis, Celery, and JWT/RBAC.", "PyQt6'tan FastAPI/Next.js çift platformuna; PostgreSQL, Redis, Celery ve JWT/RBAC içeren geçiş mimarisini tasarladım."),
        localized("Maintained 86.97% test coverage with SonarQube Cloud and 1.9% duplication across 14k lines.", "SonarQube Cloud ile %86,97 test kapsamını ve 14 bin satırda %1,9 kod tekrarını korudum."),
      ],
      tags: ["PyQt6", "FastAPI", "Next.js", "PostgreSQL", "Redis", "Docker"],
      href: "https://github.com/TurkishKEBAB/isikschedule-core",
      kind: "branch",
    },
    {
      id: "web-crawler",
      lane: "projects",
      t: 72,
      when: localized("Aug 2025 – Nov 2025", "Ağustos 2025 – Kasım 2025"),
      title: localized("Automated Web Crawler", "Otomatik Web Crawler"),
      body: localized(
        "High-throughput concurrent scraping system with strict robots.txt compliance, retries, fault tolerance, and an 89.9% successful execution rate.",
        "Sıkı robots.txt uyumu, retry ve hata toleransı ile %89,9 başarılı çalışma oranına ulaşan yüksek verimli eşzamanlı scraping sistemi.",
      ),
      tags: ["Python", "Scrapy", "FastAPI", "PostgreSQL", "89.9% success"],
      kind: "milestone",
    },
    {
      id: "certifications",
      lane: "signals",
      t: 78,
      when: localized("Continuous learning", "Sürekli öğrenme"),
      title: localized("Certifications and engineering practice", "Sertifikalar ve mühendislik pratiği"),
      body: localized(
        "Cloud and DevOps, system design, networking, DevSecOps, AI/ML, data structures, Java, English C1, and public speaking training.",
        "Cloud ve DevOps, sistem tasarımı, networking, DevSecOps, AI/ML, veri yapıları, Java, İngilizce C1 ve etkili konuşma eğitimleri.",
      ),
      tags: ["Cloud", "DevOps", "CCNA", "DevSecOps", "AI/ML", "English C1"],
      kind: "milestone",
    },
    {
      id: "agentic-ide",
      lane: "projects",
      t: 86,
      when: localized("Nov 2025 – Present", "Kasım 2025 – Günümüz"),
      title: localized("Agentic IDE thesis project", "Agentic IDE bitirme projesi"),
      body: localized(
        "AI-native IDE architecture built around Observe → Plan → Approve → Apply with human-in-the-loop controls.",
        "Observe → Plan → Approve → Apply döngüsü ve human-in-the-loop kontrolleri etrafında tasarlanan AI-native IDE mimarisi.",
      ),
      bullets: [
        localized("Designing hybrid local/cloud LLM orchestration with privacy-by-design routing for sensitive code.", "Hassas kod için privacy-by-design yönlendirmesiyle hibrit local/cloud LLM orkestrasyonu tasarlıyorum."),
        localized("Establishing CI-backed unit, integration, and E2E testing before the first implementation commit.", "İlk implementasyon commit'inden önce CI destekli unit, integration ve E2E test stratejisi oluşturuyorum."),
      ],
      tags: ["TypeScript", "Electron", "Monaco", "LLMs", "RAG"],
      kind: "branch",
    },
    {
      id: "arch-of-sigma",
      lane: "industry",
      t: 88,
      when: localized("Nov 2025 – Jan 2026", "Kasım 2025 – Ocak 2026"),
      title: localized("Project Management Intern — Arch of Sigma", "Proje Yönetimi Stajyeri — Arch of Sigma"),
      body: localized(
        "Supported cross-border architecture and engineering projects across Türkiye and the Balkans by coordinating documentation, deliverables, and milestones.",
        "Türkiye ve Balkanlar'daki sınır ötesi mimarlık ve mühendislik projelerinde dokümantasyon, teslimatlar ve kilometre taşlarını koordine ettim.",
      ),
      bullets: [
        localized("Acquired SketchUp and Rhinoceros 3D for multidisciplinary design workflows in an unfamiliar domain.", "Farklı disiplinlerdeki tasarım iş akışlarına uyum sağlamak için SketchUp ve Rhinoceros 3D öğrendim."),
      ],
      tags: ["Project Coordination", "SketchUp", "Rhinoceros 3D"],
      kind: "branch",
    },
    {
      id: "ieee-join",
      lane: "community",
      t: 90,
      when: localized("Nov 2025 – Present", "Kasım 2025 – Günümüz"),
      title: localized("IEEE Işık Student Branch", "IEEE Işık Öğrenci Kolu"),
      body: localized(
        "Vice President and Project Coordinator for 35+ technical workshops, hackathons, and industry events reaching 1,100+ students.",
        "1.100+ öğrenciye ulaşan 35+ teknik workshop, hackathon ve sektör buluşmasında Başkan Yardımcısı ve Proje Koordinatörü olarak görev yapıyorum.",
      ),
      tags: ["Leadership", "Events", "1,100+ students"],
      kind: "branch",
    },
    {
      id: "siu",
      lane: "community",
      t: 92,
      when: localized("Nov 2025", "Kasım 2025"),
      title: localized("2025 IEEE SIU Conference", "2025 IEEE SIU Konferansı"),
      body: localized(
        "Coordinated venue logistics and technical session infrastructure for 300+ attendees.",
        "300+ katılımcı için mekan lojistiği ve teknik oturum altyapısını koordine ettim.",
      ),
      tags: ["Conference", "Operations", "300+ attendees"],
      href: "https://isikieee.com.tr/siu",
      kind: "milestone",
    },
    {
      id: "netas-start",
      lane: "industry",
      t: 95,
      when: localized("Jan 2026 – Feb 2026", "Ocak 2026 – Şubat 2026"),
      title: localized("branch: NETAŞ — Software Engineering Intern", "branch: NETAŞ — Yazılım Mühendisliği Stajyeri"),
      body: localized(
        "Contributed production-grade code and tests to the KKTC e-Nüfus enterprise digitization project within a six-person team.",
        "Altı kişilik ekip içinde KKTC e-Nüfus kurumsal dijitalleştirme projesine production seviyesinde kod ve test katkısı sağladım.",
      ),
      bullets: [
        localized("Identified a critical UTC vs UTC+3 mismatch in YAML configuration and proved silent date-boundary errors with 600+ lines of tests.", "YAML yapısındaki kritik UTC ve UTC+3 uyumsuzluğunu tespit ederek sessiz tarih-sınırı hatasını 600+ satır test ile kanıtladım."),
        localized("Worked across Spring Cloud Config, Zuul Gateway, REST/SOAP, Redis, RabbitMQ, PostgreSQL, ElasticSearch, and Kibana.", "Spring Cloud Config, Zuul Gateway, REST/SOAP, Redis, RabbitMQ, PostgreSQL, ElasticSearch ve Kibana ile çalıştım."),
        localized("Optimized JSF/PrimeFaces queries and implemented date-aware resolution, Vue formatting, Turkish collation, i18n, and null-safety guards.", "JSF/PrimeFaces sorgularını optimize ettim; tarih duyarlı çözümleme, Vue formatlama, Türkçe sıralama, i18n ve null-safety kontrolleri geliştirdim."),
      ],
      tags: ["Java", "Spring Cloud", "ELK", "Redis", "RabbitMQ", "PostgreSQL"],
      kind: "branch",
    },
    {
      id: "ieee-lead",
      lane: "community",
      t: 96,
      when: localized("Present", "Günümüz"),
      title: localized("IEEE leadership and coordination", "IEEE liderliği ve koordinasyonu"),
      body: localized(
        "Connects engineering delivery with community ownership through event operations, mentoring, and cross-team coordination.",
        "Etkinlik operasyonları, mentorluk ve ekipler arası koordinasyonla mühendislik teslimini topluluk sahipliğiyle birleştiriyor.",
      ),
      tags: ["Leadership", "Mentoring", "Community"],
      kind: "milestone",
    },
    {
      id: "achievements",
      lane: "signals",
      t: 96,
      when: localized("Selected achievements", "Seçili başarılar"),
      title: localized("Awards, research, and service", "Başarılar, araştırma ve gönüllülük"),
      body: localized(
        "FRC Houston finalist experience, TÜBİTAK research, and active participation in environmental and engineering communities.",
        "FRC Houston finalist deneyimi, TÜBİTAK araştırması ve çevre/mühendislik topluluklarında aktif katılım.",
      ),
      tags: ["FRC", "TÜBİTAK", "TEMA", "WWF Türkiye"],
      kind: "milestone",
    },
    {
      id: "community-volunteering",
      lane: "community",
      t: 98,
      when: localized("Ongoing", "Devam ediyor"),
      title: localized("Community volunteering", "Topluluk gönüllülüğü"),
      body: localized(
        "Active in TEMA Foundation, WWF Türkiye, and IEEE communities including AESS, CS, EMBS, RAS, and KÖK.",
        "TEMA Vakfı, WWF Türkiye ve IEEE AESS, CS, EMBS, RAS ve KÖK dahil mühendislik topluluklarında aktifim.",
      ),
      tags: ["TEMA", "WWF Türkiye", "IEEE"],
      kind: "milestone",
    },
    {
      id: "interests",
      lane: "signals",
      t: 99,
      when: localized("Outside the repo", "Repo dışı"),
      title: localized("Interests", "İlgi alanları"),
      body: localized(
        "Chess, guitar, piano, vocal training, fitness, and swimming keep the system human and balanced.",
        "Satranç, gitar, piyano, ses eğitimi, fitness ve yüzme sistemi insani ve dengeli tutuyor.",
      ),
      tags: ["Chess", "Guitar", "Piano", "Fitness", "Swimming"],
      kind: "milestone",
    },
    {
      id: "head",
      lane: "main",
      t: 100,
      when: localized("Now", "Şimdi"),
      title: localized("HEAD — building the next hard system", "HEAD — sıradaki zor sistemi kuruyor"),
      body: localized(
        "Third-year Software Engineering student focused on backend systems, Cloud/DevOps, AI-native tooling, and quality gates.",
        "Backend sistemleri, Cloud/DevOps, AI-native araçlar ve kalite kapılarına odaklanan üçüncü sınıf Yazılım Mühendisliği öğrencisi.",
      ),
      tags: ["Backend", "Cloud", "DevOps", "AI-native tooling"],
      kind: "head",
    },
  ],
  links: [
    { from: "frc-finalist", to: "university-start" },
    { from: "high-school", to: "university-start" },
    { from: "tubitak-research", to: "core-curriculum" },
    { from: "university-start", to: "portfolio-platform" },
    { from: "core-curriculum", to: "student-assistant" },
    { from: "core-curriculum", to: "ieeextreme" },
    { from: "portfolio-platform", to: "isikschedule" },
    { from: "isikschedule", to: "agentic-ide" },
    { from: "student-assistant", to: "arch-of-sigma" },
    { from: "arch-of-sigma", to: "netas-start" },
    { from: "ieeextreme", to: "ieee-join" },
    { from: "ieee-join", to: "ieee-lead" },
    { from: "netas-start", to: "head" },
    { from: "agentic-ide", to: "head" },
    { from: "ieee-lead", to: "head" },
    { from: "certifications", to: "head" },
    { from: "interests", to: "head" },
  ],
  // The timeline compresses school years and expands recent ones, so the axis
  // states its years outright instead of implying an even scale.
  axis: [
    { t: 2, label: "2019" },
    { t: 24, label: "2023" },
    { t: 38, label: "2024" },
    { t: 66, label: "2025" },
    { t: 93, label: "2026" },
  ],
};
