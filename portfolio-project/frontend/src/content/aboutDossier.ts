import type { Locale, LocalizedString } from "@/content/site";

export interface DossierItem {
  title: LocalizedString;
  meta: LocalizedString;
  organization?: LocalizedString;
  location?: LocalizedString;
  summary: LocalizedString;
  bullets?: LocalizedString[];
  tags?: string[];
  href?: string;
}

export interface DossierSkillGroup {
  title: LocalizedString;
  summary: LocalizedString;
  skills: string[];
}

export interface AboutDossierContent {
  sectionLabel: string;
  sectionTitle: string;
  sectionSubtitle: string;
  summaryTitle: string;
  summary: string;
  educationTitle: string;
  education: DossierItem[];
  experienceTitle: string;
  experience: DossierItem[];
  projectsTitle: string;
  projects: DossierItem[];
  skillsTitle: string;
  skillGroups: DossierSkillGroup[];
  leadershipTitle: string;
  leadership: DossierItem[];
  certificationsTitle: string;
  certifications: DossierItem[];
  achievementsTitle: string;
  achievements: DossierItem[];
  interestsTitle: string;
  interests: string[];
}

const localized = (en: string, tr: string): LocalizedString => ({ en, tr });

const dossier: Record<Locale, AboutDossierContent> = {
  en: {
    sectionLabel: "CV dossier",
    sectionTitle: "Professional profile",
    sectionSubtitle: "A fuller view of the experience, systems, and communities behind the portfolio.",
    summaryTitle: "Professional summary",
    summary:
      "Third-year Software Engineering student at Işık University seeking a part-time software engineering or Cloud/DevOps role. Contributed to production systems at NETAŞ on an enterprise Java microservices platform and ships personal projects with CI/CD, Docker, PostgreSQL, and SonarQube.",
    educationTitle: "Education",
    education: [
      {
        title: localized("B.Sc. Software Engineering", "Yazılım Mühendisliği Lisans Programı"),
        meta: localized("2023 – 2027 (Expected)", "2023 – 2027 (Beklenen)"),
        organization: localized("Işık University", "Işık Üniversitesi"),
        location: localized("Istanbul, Turkey", "İstanbul, Türkiye"),
        summary: localized(
          "Third-year Software Engineering student.",
          "Üçüncü sınıf Yazılım Mühendisliği öğrencisi.",
        ),
      },
      {
        title: localized("High School Diploma", "Lise Diploması"),
        meta: localized("2019 – 2023", "2019 – 2023"),
        organization: localized(
          "Ergün Öner-Mehmet Öner Anatolian High School",
          "Ergün Öner-Mehmet Öner Anadolu Lisesi",
        ),
        location: localized("Istanbul, Turkey", "İstanbul, Türkiye"),
        summary: localized(
          "Software and electronics focused high school education.",
          "Yazılım ve elektronik odaklı lise eğitimi.",
        ),
      },
    ],
    experienceTitle: "Work experience",
    experience: [
      {
        title: localized("Software Engineering Intern", "Yazılım Mühendisliği Stajyeri"),
        meta: localized("Jan 2026 – Feb 2026", "Ocak 2026 – Şubat 2026"),
        organization: localized("NETAŞ Telekomünikasyon A.Ş.", "NETAŞ Telekomünikasyon A.Ş."),
        location: localized("Istanbul, Turkey", "İstanbul, Türkiye"),
        summary: localized(
          "Contributed production-grade code and tests to the KKTC e-Nüfus enterprise digitization project within a six-person team.",
          "Altı kişilik ekip içinde KKTC e-Nüfus kurumsal dijitalleştirme projesine production seviyesinde kod ve test katkısı sağladım.",
        ),
        bullets: [
          localized(
            "Independently identified a critical v1/v2 timezone mismatch (UTC vs UTC+3) in YAML configuration and proved the silent date-boundary errors with 600+ lines of unit and integration tests.",
            "YAML yapılandırmasındaki kritik v1/v2 timezone uyumsuzluğunu (UTC ve UTC+3) bağımsız olarak tespit ettim; sessiz tarih-sınırı hatasını 600+ satır unit ve integration testiyle kanıtladım.",
          ),
          localized(
            "Navigated Spring Cloud Config, Zuul Gateway, REST/SOAP, Redis, RabbitMQ, PostgreSQL, ElasticSearch, and Kibana across reviewed GitLab merge requests.",
            "İncelenen GitLab merge request'leri boyunca Spring Cloud Config, Zuul Gateway, REST/SOAP, Redis, RabbitMQ, PostgreSQL, ElasticSearch ve Kibana teknolojileriyle çalıştım.",
          ),
          localized(
            "Optimized JSF/PrimeFaces autocomplete queries and implemented date-aware address resolution, Vue.js formatting, Turkish locale collation, i18n, and null-safety guards.",
            "JSF/PrimeFaces autocomplete sorgularını optimize ettim; tarih duyarlı adres çözümleme, Vue.js formatlama, Türkçe locale sıralaması, i18n ve null-safety kontrolleri geliştirdim.",
          ),
        ],
        tags: ["Java", "Spring Cloud", "ELK", "Redis", "RabbitMQ", "PostgreSQL"],
      },
      {
        title: localized("Project Management Intern (Remote)", "Proje Yönetimi Stajyeri (Uzaktan)"),
        meta: localized("Nov 2025 – Jan 2026", "Kasım 2025 – Ocak 2026"),
        organization: localized("Arch of Sigma", "Arch of Sigma"),
        location: localized("Remote", "Uzaktan"),
        summary: localized(
          "Supported cross-border architecture and engineering projects across Türkiye and the Balkans by coordinating documentation, deliverables, and milestones.",
          "Türkiye ve Balkanlar'daki sınır ötesi mimarlık ve mühendislik projelerinde dokümantasyon, teslimatlar ve kilometre taşlarını koordine ettim.",
        ),
        bullets: [
          localized(
            "Acquired SketchUp and Rhinoceros 3D for multidisciplinary design workflows in an unfamiliar domain.",
            "Farklı disiplinlerdeki tasarım iş akışlarına uyum sağlamak için SketchUp ve Rhinoceros 3D öğrendim.",
          ),
        ],
        tags: ["Project coordination", "SketchUp", "Rhinoceros 3D"],
      },
      {
        title: localized("Student Assistant", "Öğrenci Asistanı"),
        meta: localized("Feb 2024 – Present", "Şubat 2024 – Günümüz"),
        organization: localized("Işık University – CSE Department", "Işık Üniversitesi – CSE Bölümü"),
        location: localized("Istanbul, Turkey", "İstanbul, Türkiye"),
        summary: localized(
          "Mentors students during OOP lab sessions, reviewing code and reinforcing clean-code principles and software design fundamentals.",
          "OOP laboratuvarlarında öğrencilere mentorluk yapıyor, kod inceleyerek clean code ve yazılım tasarım temellerini güçlendiriyorum.",
        ),
        tags: ["OOP", "Clean code", "Mentoring"],
      },
    ],
    projectsTitle: "Technical projects",
    projects: [
      {
        title: localized("IşıkSchedule Platform", "IşıkSchedule Platformu"),
        meta: localized("2024 – Present", "2024 – Günümüz"),
        summary: localized(
          "Dual-platform scheduling product with a constraint-aware engine and a desktop deployment serving approximately 1,000 active users.",
          "Yaklaşık 1.000 aktif kullanıcıya hizmet veren masaüstü dağıtımı ve kısıt farkındalıklı motoru olan çift platformlu programlama ürünü.",
        ),
        bullets: [
          localized(
            "Built a 13-algorithm scheduling engine including Genetic, Simulated Annealing, Tabu Search, PSO, and Hybrid GA+SA with hard constraints and preference optimization.",
            "Genetic, Simulated Annealing, Tabu Search, PSO ve Hybrid GA+SA dahil 13 algoritmalı; sert kısıtlar ve tercih optimizasyonu kullanan programlama motoru geliştirdim.",
          ),
          localized(
            "Architected the migration from a standalone PyQt6 application to a dual-platform product with FastAPI, Next.js, PostgreSQL, Redis, Celery, JWT/RBAC, and 24 API routes.",
            "Bağımsız PyQt6 uygulamasından FastAPI, Next.js, PostgreSQL, Redis, Celery, JWT/RBAC ve 24 API route içeren çift platformlu ürüne geçiş mimarisini tasarladım.",
          ),
          localized(
            "Maintained 86.97% test coverage with SonarQube Cloud integration and 1.9% duplication across 14k lines.",
            "SonarQube Cloud entegrasyonuyla %86,97 test kapsamını ve 14 bin satırda %1,9 kod tekrarını korudum.",
          ),
        ],
        tags: ["PyQt6", "FastAPI", "Next.js", "PostgreSQL", "Redis", "Docker"],
        href: "https://github.com/TurkishKEBAB/isikschedule-core",
      },
      {
        title: localized("Agentic IDE (Thesis Project)", "Agentic IDE (Bitirme Projesi)"),
        meta: localized("Nov 2025 – Present", "Kasım 2025 – Günümüz"),
        summary: localized(
          "Early architectural phase for a ground-up AI-native IDE built around Observe → Plan → Approve → Apply with human-in-the-loop controls.",
          "Observe → Plan → Approve → Apply döngüsü ve human-in-the-loop kontrolleri etrafında tasarlanan AI-native IDE'nin erken mimari aşaması.",
        ),
        bullets: [
          localized(
            "Designing hybrid local/cloud LLM orchestration with privacy-by-design routing for sensitive code.",
            "Hassas kod için privacy-by-design yönlendirmesiyle hibrit local/cloud LLM orkestrasyonu tasarlıyorum.",
          ),
          localized(
            "Establishing a CI-backed unit, integration, and E2E testing strategy before the first implementation commit.",
            "İlk implementasyon commit'inden önce CI destekli unit, integration ve E2E test stratejisi oluşturuyorum.",
          ),
        ],
        tags: ["TypeScript", "Electron", "Monaco", "LLMs", "RAG"],
      },
      {
        title: localized("Teknofest Sarkan UAV Defense Platform", "Teknofest Sarkan İHA Savunma Platformu"),
        meta: localized("May 2024 – May 2025", "Mayıs 2024 – Mayıs 2025"),
        summary: localized(
          "Software lead for anti-jamming telemetry and control algorithms; ranked 3rd among 700+ projects in preliminary evaluation.",
          "Anti-jamming telemetri ve kontrol algoritmaları için yazılım liderliği; ön değerlendirmede 700+ proje arasında 3.lük.",
        ),
        bullets: [
          localized(
            "Secured and managed a 200,000₺ budget including a 165,000₺ TÜBİTAK R&D grant and Savronik Defense sponsorship.",
            "165.000₺ TÜBİTAK Ar-Ge hibesi ve Savronik Defense sponsorluğu dahil 200.000₺ bütçeyi temin ve yönettim.",
          ),
          localized(
            "Coordinated mechanics, electronics, and software teams around the telemetry platform.",
            "Mekanik, elektronik ve yazılım ekiplerini telemetri platformu etrafında koordine ettim.",
          ),
        ],
        tags: ["Python", "Telemetry", "RF systems"],
      },
      {
        title: localized("Automated Web Crawler", "Otomatik Web Crawler"),
        meta: localized("Aug 2025 – Nov 2025", "Ağustos 2025 – Kasım 2025"),
        summary: localized(
          "High-throughput concurrent scraping system with strict robots.txt compliance, retries, fault tolerance, and an 89.9% successful execution rate.",
          "Sıkı robots.txt uyumu, retry ve hata toleransı ile %89,9 başarılı çalışma oranına ulaşan yüksek verimli eşzamanlı scraping sistemi.",
        ),
        tags: ["Python", "Scrapy", "FastAPI", "PostgreSQL"],
      },
      {
        title: localized("Portfolio Platform (Web + Desktop)", "Portfolyo Platformu (Web + Desktop)"),
        meta: localized("Jan 2024 – Present", "Ocak 2024 – Günümüz"),
        summary: localized(
          "Full-stack portfolio system with 60+ API endpoints, JWT/RBAC, GitHub caching, Supabase assets, SMTP notifications, and staged Vercel/Railway deployments.",
          "60+ API endpoint, JWT/RBAC, GitHub cache, Supabase varlık yönetimi, SMTP bildirimleri ve aşamalı Vercel/Railway dağıtımlarına sahip full-stack portfolyo sistemi.",
        ),
        tags: ["FastAPI", "Next.js", "PostgreSQL", "Docker", "Vercel", "Railway"],
        href: "https://github.com/TurkishKEBAB/Site",
      },
    ],
    skillsTitle: "Technical skills",
    skillGroups: [
      {
        title: localized("Cloud & DevOps", "Cloud ve DevOps"),
        summary: localized("Build, ship, and operate reliable delivery paths.", "Güvenilir teslimat yolları kurar, yayınlar ve işletirim."),
        skills: ["Docker", "Kubernetes", "GitHub Actions", "AWS EC2", "AWS S3", "Spring Cloud Config", "Zuul Gateway", "SonarQube"],
      },
      {
        title: localized("Observability & infrastructure", "Gözlemlenebilirlik ve altyapı"),
        summary: localized("Diagnose distributed systems with practical operational signals.", "Dağıtık sistemleri pratik operasyon sinyalleriyle teşhis ederim."),
        skills: ["ElasticSearch", "Kibana", "Redis", "RabbitMQ", "PostgreSQL", "Celery", "Vagrant"],
      },
      {
        title: localized("Backend & architecture", "Backend ve mimari"),
        summary: localized("Production Java/Spring and Python/FastAPI systems with clean boundaries.", "Temiz sınırları olan production Java/Spring ve Python/FastAPI sistemleri."),
        skills: ["Java", "Spring Boot", "Python", "FastAPI", "REST APIs", "Hibernate/JPA", "JSF/PrimeFaces", "Microservices", "JWT/RBAC"],
      },
      {
        title: localized("Frontend, testing & AI", "Frontend, test ve AI"),
        summary: localized("Enough product fluency to connect interfaces, quality, and AI workflows.", "Arayüzleri, kaliteyi ve AI iş akışlarını birleştirecek ürün yetkinliği."),
        skills: ["Vue.js", "React", "Next.js", "TypeScript", "TailwindCSS", "Electron", "JUnit", "Pytest", "LLMs", "RAG"],
      },
    ],
    leadershipTitle: "Leadership & community",
    leadership: [
      {
        title: localized("Vice President & Project Coordinator", "Başkan Yardımcısı ve Proje Koordinatörü"),
        meta: localized("Nov 2025 – Present", "Kasım 2025 – Günümüz"),
        organization: localized("IEEE Işık Student Branch", "IEEE Işık Öğrenci Kolu"),
        location: localized("Istanbul, Turkey", "İstanbul, Türkiye"),
        summary: localized(
          "Orchestrates 35+ technical workshops, hackathons, and industry networking events engaging 1,100+ students university-wide.",
          "Üniversite genelinde 1.100+ öğrenciyi bir araya getiren 35+ teknik workshop, hackathon ve sektör buluşmasını koordine ediyorum.",
        ),
        tags: ["Leadership", "Events", "Community"],
      },
      {
        title: localized("Organization Committee Member", "Organizasyon Komitesi Üyesi"),
        meta: localized("Nov 2025", "Kasım 2025"),
        organization: localized("2025 IEEE SIU Conference", "2025 IEEE SIU Konferansı"),
        location: localized("Türkiye", "Türkiye"),
        summary: localized(
          "Coordinated venue logistics and technical session infrastructure for 300+ attendees.",
          "300+ katılımcı için mekan lojistiği ve teknik oturum altyapısını koordine ettim.",
        ),
        href: "https://isikieee.com.tr/siu",
      },
      {
        title: localized("Lead Organizer", "Baş Organizator"),
        meta: localized("Jul 2024", "Temmuz 2024"),
        organization: localized("IEEEXtreme'24 Programming Camp", "IEEEXtreme'24 Programlama Kampı"),
        location: localized("Istanbul, Turkey", "İstanbul, Türkiye"),
        summary: localized(
          "Directed a national programming bootcamp focused on competitive programming, algorithms, and data structures for 200+ participants.",
          "200+ katılımcı için rekabetçi programlama, algoritmalar ve veri yapıları odaklı ulusal programlama kampını yönettim.",
        ),
        href: "https://isikieee.com.tr/xtreme",
      },
    ],
    certificationsTitle: "Certifications & continuous learning",
    certifications: [
      {
        title: localized("Cloud & DevOps", "Cloud ve DevOps"),
        meta: localized("Continuous learning", "Sürekli öğrenme"),
        summary: localized(
          "Linux for Cloud & DevOps Engineers; Master System Design & Software Architecture; Networking Fundamentals (CCNA); DevSecOps.",
          "Linux for Cloud & DevOps Engineers; Master System Design & Software Architecture; Networking Fundamentals (CCNA); DevSecOps.",
        ),
      },
      {
        title: localized("AI & Engineering", "AI ve mühendislik"),
        meta: localized("Continuous learning", "Sürekli öğrenme"),
        summary: localized(
          "Complete A.I. & Machine Learning Bootcamp (Miuul); Master the Coding Interview: Data Structures + Algorithms; TechCamp.",
          "Complete A.I. & Machine Learning Bootcamp (Miuul); Master the Coding Interview: Data Structures + Algorithms; TechCamp.",
        ),
      },
      {
        title: localized("Language & communication", "Dil ve iletişim"),
        meta: localized("English C1", "İngilizce C1"),
        summary: localized(
          "Cambridge University & American Culture Institute; Diction and Effective Public Speaking Training; Java Programming certificate.",
          "Cambridge University ve American Culture Institute; Diksiyon ve Etkili Konuşma Eğitimi; Java Programming sertifikası.",
        ),
      },
    ],
    achievementsTitle: "Achievements & interests",
    achievements: [
      {
        title: localized("FRC Houston World Championship Finalist", "FRC Houston Dünya Şampiyonası Finalisti"),
        meta: localized("2019", "2019"),
        organization: localized("FIRST Robotics Competition – Team 7840 EMONER", "FIRST Robotics Competition – Team 7840 EMONER"),
        summary: localized(
          "Reached the Houston world championship finals with Team 7840.",
          "Team 7840 ile Houston dünya şampiyonası finallerine ulaştım.",
        ),
      },
      {
        title: localized("TÜBİTAK 4009 research", "TÜBİTAK 4009 araştırması"),
        meta: localized("Research", "Araştırma"),
        summary: localized(
          "Research experience in physics, optics, and CRISPR-Cas9 technology.",
          "Fizik, optik ve CRISPR-Cas9 teknolojisi alanlarında araştırma deneyimi.",
        ),
      },
      {
        title: localized("Community volunteering", "Topluluk gönüllülüğü"),
        meta: localized("Ongoing", "Devam ediyor"),
        organization: localized("TEMA Foundation, WWF Türkiye, IEEE communities", "TEMA Vakfı, WWF Türkiye, IEEE toplulukları"),
        summary: localized(
          "Active in environmental and engineering communities including IEEE AESS, IEEE CS, IEEE EMBS, IEEE RAS, IEEE KÖK, and Türkiye Teknoloji Takımı.",
          "IEEE AESS, IEEE CS, IEEE EMBS, IEEE RAS, IEEE KÖK ve Türkiye Teknoloji Takımı dahil çevre ve mühendislik topluluklarında aktifim.",
        ),
      },
    ],
    interestsTitle: "Interests",
    interests: ["Chess", "Guitar", "Piano", "Vocal training", "Fitness", "Swimming"],
  },
  tr: {
    sectionLabel: "CV dosyası",
    sectionTitle: "Profesyonel profil",
    sectionSubtitle: "Portfolyonun arkasındaki deneyim, sistemler ve topluluk çalışmalarının daha kapsamlı görünümü.",
    summaryTitle: "Profesyonel özet",
    summary:
      "Işık Üniversitesi'nde üçüncü sınıf Yazılım Mühendisliği öğrencisiyim; part-time yazılım mühendisliği veya Cloud/DevOps rolü arıyorum. NETAŞ'ta kurumsal Java mikroservis platformunda production sistemlere katkı sağladım; CI/CD, Docker, PostgreSQL ve SonarQube kullanan kişisel projeler geliştirip yayınlıyorum.",
    educationTitle: "Eğitim",
    education: [
      {
        title: localized("B.Sc. Software Engineering", "Yazılım Mühendisliği Lisans Programı"),
        meta: localized("2023 – 2027 (Expected)", "2023 – 2027 (Beklenen)"),
        organization: localized("Işık University", "Işık Üniversitesi"),
        location: localized("Istanbul, Turkey", "İstanbul, Türkiye"),
        summary: localized("Third-year Software Engineering student.", "Üçüncü sınıf Yazılım Mühendisliği öğrencisi."),
      },
      {
        title: localized("High School Diploma", "Lise Diploması"),
        meta: localized("2019 – 2023", "2019 – 2023"),
        organization: localized("Ergün Öner-Mehmet Öner Anatolian High School", "Ergün Öner-Mehmet Öner Anadolu Lisesi"),
        location: localized("Istanbul, Turkey", "İstanbul, Türkiye"),
        summary: localized("Software and electronics focused high school education.", "Yazılım ve elektronik odaklı lise eğitimi."),
      },
    ],
    experienceTitle: "İş deneyimi",
    experience: [
      {
        title: localized("Software Engineering Intern", "Yazılım Mühendisliği Stajyeri"),
        meta: localized("Jan 2026 – Feb 2026", "Ocak 2026 – Şubat 2026"),
        organization: localized("NETAŞ Telekomünikasyon A.Ş.", "NETAŞ Telekomünikasyon A.Ş."),
        location: localized("Istanbul, Turkey", "İstanbul, Türkiye"),
        summary: localized("Contributed production-grade code and tests to the KKTC e-Nüfus enterprise digitization project within a six-person team.", "Altı kişilik ekip içinde KKTC e-Nüfus kurumsal dijitalleştirme projesine production seviyesinde kod ve test katkısı sağladım."),
        bullets: [
          localized("Independently identified a critical v1/v2 timezone mismatch (UTC vs UTC+3) in YAML configuration and proved the silent date-boundary errors with 600+ lines of unit and integration tests.", "YAML yapılandırmasındaki kritik v1/v2 timezone uyumsuzluğunu (UTC ve UTC+3) bağımsız olarak tespit ettim; sessiz tarih-sınırı hatasını 600+ satır unit ve integration testiyle kanıtladım."),
          localized("Navigated Spring Cloud Config, Zuul Gateway, REST/SOAP, Redis, RabbitMQ, PostgreSQL, ElasticSearch, and Kibana across reviewed GitLab merge requests.", "İncelenen GitLab merge request'leri boyunca Spring Cloud Config, Zuul Gateway, REST/SOAP, Redis, RabbitMQ, PostgreSQL, ElasticSearch ve Kibana teknolojileriyle çalıştım."),
          localized("Optimized JSF/PrimeFaces autocomplete queries and implemented date-aware address resolution, Vue.js formatting, Turkish locale collation, i18n, and null-safety guards.", "JSF/PrimeFaces autocomplete sorgularını optimize ettim; tarih duyarlı adres çözümleme, Vue.js formatlama, Türkçe locale sıralaması, i18n ve null-safety kontrolleri geliştirdim."),
        ],
        tags: ["Java", "Spring Cloud", "ELK", "Redis", "RabbitMQ", "PostgreSQL"],
      },
      {
        title: localized("Project Management Intern (Remote)", "Proje Yönetimi Stajyeri (Uzaktan)"),
        meta: localized("Nov 2025 – Jan 2026", "Kasım 2025 – Ocak 2026"),
        organization: localized("Arch of Sigma", "Arch of Sigma"),
        location: localized("Remote", "Uzaktan"),
        summary: localized("Supported cross-border architecture and engineering projects across Türkiye and the Balkans by coordinating documentation, deliverables, and milestones.", "Türkiye ve Balkanlar'daki sınır ötesi mimarlık ve mühendislik projelerinde dokümantasyon, teslimatlar ve kilometre taşlarını koordine ettim."),
        bullets: [localized("Acquired SketchUp and Rhinoceros 3D for multidisciplinary design workflows in an unfamiliar domain.", "Farklı disiplinlerdeki tasarım iş akışlarına uyum sağlamak için SketchUp ve Rhinoceros 3D öğrendim.")],
        tags: ["Project coordination", "SketchUp", "Rhinoceros 3D"],
      },
      {
        title: localized("Student Assistant", "Öğrenci Asistanı"),
        meta: localized("Feb 2024 – Present", "Şubat 2024 – Günümüz"),
        organization: localized("Işık University – CSE Department", "Işık Üniversitesi – CSE Bölümü"),
        location: localized("Istanbul, Turkey", "İstanbul, Türkiye"),
        summary: localized("Mentors students during OOP lab sessions, reviewing code and reinforcing clean-code principles and software design fundamentals.", "OOP laboratuvarlarında öğrencilere mentorluk yapıyor, kod inceleyerek clean code ve yazılım tasarım temellerini güçlendiriyorum."),
        tags: ["OOP", "Clean code", "Mentoring"],
      },
    ],
    projectsTitle: "Teknik projeler",
    projects: [
      {
        title: localized("IşıkSchedule Platform", "IşıkSchedule Platformu"),
        meta: localized("2024 – Present", "2024 – Günümüz"),
        summary: localized("Dual-platform scheduling product with a constraint-aware engine and a desktop deployment serving approximately 1,000 active users.", "Yaklaşık 1.000 aktif kullanıcıya hizmet veren masaüstü dağıtımı ve kısıt farkındalıklı motoru olan çift platformlu programlama ürünü."),
        bullets: [localized("Built a 13-algorithm scheduling engine including Genetic, Simulated Annealing, Tabu Search, PSO, and Hybrid GA+SA with hard constraints and preference optimization.", "Genetic, Simulated Annealing, Tabu Search, PSO ve Hybrid GA+SA dahil 13 algoritmalı; sert kısıtlar ve tercih optimizasyonu kullanan programlama motoru geliştirdim."), localized("Architected the migration from a standalone PyQt6 application to a dual-platform product with FastAPI, Next.js, PostgreSQL, Redis, Celery, JWT/RBAC, and 24 API routes.", "Bağımsız PyQt6 uygulamasından FastAPI, Next.js, PostgreSQL, Redis, Celery, JWT/RBAC ve 24 API route içeren çift platformlu ürüne geçiş mimarisini tasarladım."), localized("Maintained 86.97% test coverage with SonarQube Cloud integration and 1.9% duplication across 14k lines.", "SonarQube Cloud entegrasyonuyla %86,97 test kapsamını ve 14 bin satırda %1,9 kod tekrarını korudum.")],
        tags: ["PyQt6", "FastAPI", "Next.js", "PostgreSQL", "Redis", "Docker"],
        href: "https://github.com/TurkishKEBAB/isikschedule-core",
      },
      {
        title: localized("Agentic IDE (Thesis Project)", "Agentic IDE (Bitirme Projesi)"),
        meta: localized("Nov 2025 – Present", "Kasım 2025 – Günümüz"),
        summary: localized("Early architectural phase for a ground-up AI-native IDE built around Observe → Plan → Approve → Apply with human-in-the-loop controls.", "Observe → Plan → Approve → Apply döngüsü ve human-in-the-loop kontrolleri etrafında tasarlanan AI-native IDE'nin erken mimari aşaması."),
        bullets: [localized("Designing hybrid local/cloud LLM orchestration with privacy-by-design routing for sensitive code.", "Hassas kod için privacy-by-design yönlendirmesiyle hibrit local/cloud LLM orkestrasyonu tasarlıyorum."), localized("Establishing a CI-backed unit, integration, and E2E testing strategy before the first implementation commit.", "İlk implementasyon commit'inden önce CI destekli unit, integration ve E2E test stratejisi oluşturuyorum.")],
        tags: ["TypeScript", "Electron", "Monaco", "LLMs", "RAG"],
      },
      {
        title: localized("Teknofest Sarkan UAV Defense Platform", "Teknofest Sarkan İHA Savunma Platformu"),
        meta: localized("May 2024 – May 2025", "Mayıs 2024 – Mayıs 2025"),
        summary: localized("Software lead for anti-jamming telemetry and control algorithms; ranked 3rd among 700+ projects in preliminary evaluation.", "Anti-jamming telemetri ve kontrol algoritmaları için yazılım liderliği; ön değerlendirmede 700+ proje arasında 3.lük."),
        bullets: [localized("Secured and managed a 200,000₺ budget including a 165,000₺ TÜBİTAK R&D grant and Savronik Defense sponsorship.", "165.000₺ TÜBİTAK Ar-Ge hibesi ve Savronik Defense sponsorluğu dahil 200.000₺ bütçeyi temin ve yönettim."), localized("Coordinated mechanics, electronics, and software teams around the telemetry platform.", "Mekanik, elektronik ve yazılım ekiplerini telemetri platformu etrafında koordine ettim.")],
        tags: ["Python", "Telemetry", "RF systems"],
      },
      {
        title: localized("Automated Web Crawler", "Otomatik Web Crawler"),
        meta: localized("Aug 2025 – Nov 2025", "Ağustos 2025 – Kasım 2025"),
        summary: localized("High-throughput concurrent scraping system with strict robots.txt compliance, retries, fault tolerance, and an 89.9% successful execution rate.", "Sıkı robots.txt uyumu, retry ve hata toleransı ile %89,9 başarılı çalışma oranına ulaşan yüksek verimli eşzamanlı scraping sistemi."),
        tags: ["Python", "Scrapy", "FastAPI", "PostgreSQL"],
      },
      {
        title: localized("Portfolio Platform (Web + Desktop)", "Portfolyo Platformu (Web + Desktop)"),
        meta: localized("Jan 2024 – Present", "Ocak 2024 – Günümüz"),
        summary: localized("Full-stack portfolio system with 60+ API endpoints, JWT/RBAC, GitHub caching, Supabase assets, SMTP notifications, and staged Vercel/Railway deployments.", "60+ API endpoint, JWT/RBAC, GitHub cache, Supabase varlık yönetimi, SMTP bildirimleri ve aşamalı Vercel/Railway dağıtımlarına sahip full-stack portfolyo sistemi."),
        tags: ["FastAPI", "Next.js", "PostgreSQL", "Docker", "Vercel", "Railway"],
        href: "https://github.com/TurkishKEBAB/Site",
      },
    ],
    skillsTitle: "Teknik beceriler",
    skillGroups: [
      { title: localized("Cloud & DevOps", "Cloud ve DevOps"), summary: localized("Build, ship, and operate reliable delivery paths.", "Güvenilir teslimat yolları kurar, yayınlar ve işletirim."), skills: ["Docker", "Kubernetes", "GitHub Actions", "AWS EC2", "AWS S3", "Spring Cloud Config", "Zuul Gateway", "SonarQube"] },
      { title: localized("Observability & infrastructure", "Gözlemlenebilirlik ve altyapı"), summary: localized("Diagnose distributed systems with practical operational signals.", "Dağıtık sistemleri pratik operasyon sinyalleriyle teşhis ederim."), skills: ["ElasticSearch", "Kibana", "Redis", "RabbitMQ", "PostgreSQL", "Celery", "Vagrant"] },
      { title: localized("Backend & architecture", "Backend ve mimari"), summary: localized("Production Java/Spring and Python/FastAPI systems with clean boundaries.", "Temiz sınırları olan production Java/Spring ve Python/FastAPI sistemleri."), skills: ["Java", "Spring Boot", "Python", "FastAPI", "REST APIs", "Hibernate/JPA", "JSF/PrimeFaces", "Microservices", "JWT/RBAC"] },
      { title: localized("Frontend, testing & AI", "Frontend, test ve AI"), summary: localized("Enough product fluency to connect interfaces, quality, and AI workflows.", "Arayüzleri, kaliteyi ve AI iş akışlarını birleştirecek ürün yetkinliği."), skills: ["Vue.js", "React", "Next.js", "TypeScript", "TailwindCSS", "Electron", "JUnit", "Pytest", "LLMs", "RAG"] },
    ],
    leadershipTitle: "Liderlik ve topluluk",
    leadership: [
      { title: localized("Vice President & Project Coordinator", "Başkan Yardımcısı ve Proje Koordinatörü"), meta: localized("Nov 2025 – Present", "Kasım 2025 – Günümüz"), organization: localized("IEEE Işık Student Branch", "IEEE Işık Öğrenci Kolu"), location: localized("Istanbul, Turkey", "İstanbul, Türkiye"), summary: localized("Orchestrates 35+ technical workshops, hackathons, and industry networking events engaging 1,100+ students university-wide.", "Üniversite genelinde 1.100+ öğrenciyi bir araya getiren 35+ teknik workshop, hackathon ve sektör buluşmasını koordine ediyorum."), tags: ["Leadership", "Events", "Community"] },
      { title: localized("Organization Committee Member", "Organizasyon Komitesi Üyesi"), meta: localized("Nov 2025", "Kasım 2025"), organization: localized("2025 IEEE SIU Conference", "2025 IEEE SIU Konferansı"), location: localized("Türkiye", "Türkiye"), summary: localized("Coordinated venue logistics and technical session infrastructure for 300+ attendees.", "300+ katılımcı için mekan lojistiği ve teknik oturum altyapısını koordine ettim."), href: "https://isikieee.com.tr/siu" },
      { title: localized("Lead Organizer", "Baş Organizatör"), meta: localized("Jul 2024", "Temmuz 2024"), organization: localized("IEEEXtreme'24 Programming Camp", "IEEEXtreme'24 Programlama Kampı"), location: localized("Istanbul, Turkey", "İstanbul, Türkiye"), summary: localized("Directed a national programming bootcamp focused on competitive programming, algorithms, and data structures for 200+ participants.", "200+ katılımcı için rekabetçi programlama, algoritmalar ve veri yapıları odaklı ulusal programlama kampını yönettim."), href: "https://isikieee.com.tr/xtreme" },
    ],
    certificationsTitle: "Sertifikalar ve sürekli öğrenme",
    certifications: [
      { title: localized("Cloud & DevOps", "Cloud ve DevOps"), meta: localized("Continuous learning", "Sürekli öğrenme"), summary: localized("Linux for Cloud & DevOps Engineers; Master System Design & Software Architecture; Networking Fundamentals (CCNA); DevSecOps.", "Linux for Cloud & DevOps Engineers; Master System Design & Software Architecture; Networking Fundamentals (CCNA); DevSecOps.") },
      { title: localized("AI & Engineering", "AI ve mühendislik"), meta: localized("Continuous learning", "Sürekli öğrenme"), summary: localized("Complete A.I. & Machine Learning Bootcamp (Miuul); Master the Coding Interview: Data Structures + Algorithms; TechCamp.", "Complete A.I. & Machine Learning Bootcamp (Miuul); Master the Coding Interview: Data Structures + Algorithms; TechCamp.") },
      { title: localized("Language & communication", "Dil ve iletişim"), meta: localized("English C1", "İngilizce C1"), summary: localized("Cambridge University & American Culture Institute; Diction and Effective Public Speaking Training; Java Programming certificate.", "Cambridge University ve American Culture Institute; Diksiyon ve Etkili Konuşma Eğitimi; Java Programming sertifikası.") },
    ],
    achievementsTitle: "Başarılar ve ilgi alanları",
    achievements: [
      { title: localized("FRC Houston World Championship Finalist", "FRC Houston Dünya Şampiyonası Finalisti"), meta: localized("2019", "2019"), organization: localized("FIRST Robotics Competition – Team 7840 EMONER", "FIRST Robotics Competition – Team 7840 EMONER"), summary: localized("Reached the Houston world championship finals with Team 7840.", "Team 7840 ile Houston dünya şampiyonası finallerine ulaştım.") },
      { title: localized("TÜBİTAK 4009 research", "TÜBİTAK 4009 araştırması"), meta: localized("Research", "Araştırma"), summary: localized("Research experience in physics, optics, and CRISPR-Cas9 technology.", "Fizik, optik ve CRISPR-Cas9 teknolojisi alanlarında araştırma deneyimi.") },
      { title: localized("Community volunteering", "Topluluk gönüllülüğü"), meta: localized("Ongoing", "Devam ediyor"), organization: localized("TEMA Foundation, WWF Türkiye, IEEE communities", "TEMA Vakfı, WWF Türkiye, IEEE toplulukları"), summary: localized("Active in environmental and engineering communities including IEEE AESS, IEEE CS, IEEE EMBS, IEEE RAS, IEEE KÖK, and Türkiye Teknoloji Takımı.", "IEEE AESS, IEEE CS, IEEE EMBS, IEEE RAS, IEEE KÖK ve Türkiye Teknoloji Takımı dahil çevre ve mühendislik topluluklarında aktifim.") },
    ],
    interestsTitle: "İlgi alanları",
    interests: ["Satranç", "Gitar", "Piyano", "Ses eğitimi", "Fitness", "Yüzme"],
  },
};

export const aboutDossier = dossier;
