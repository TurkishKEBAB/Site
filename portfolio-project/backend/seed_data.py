"""
Seed database with CV v6 data for Yigit Okur.
"""

from datetime import date, datetime, timezone
from typing import Dict, List, Optional
import os
import secrets

from sqlalchemy.orm import Session
from slugify import slugify

from app.database import SessionLocal
from app.models import (
    BlogPost,
    BlogTranslation,
    ContactMessage,
    Experience,
    ExperienceTranslation,
    GitHubRepo,
    PageView,
    Project,
    ProjectImage,
    ProjectTechnology,
    ProjectTranslation,
    RefreshTokenSession,
    SiteConfig,
    Skill,
    SkillTranslation,
    Technology,
    TokenBlacklist,
    Translation,
    User,
)
from app.utils.security import get_password_hash


def seed_admin_user(db: Session) -> User:
    """Create portfolio owner user."""
    seed_admin_password = os.getenv("SEED_ADMIN_PASSWORD")
    if not seed_admin_password:
        seed_admin_password = secrets.token_urlsafe(18)
        print("SEED_ADMIN_PASSWORD not set. Generated one-time random admin password for seed run.")
        print(f"Generated seed admin password: {seed_admin_password}")

    user = User(
        email="yigitokur@ieee.org",
        username="yigitokur",
        password_hash=get_password_hash(seed_admin_password),
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    print("Added admin user")
    return user


def seed_technologies(db: Session) -> Dict[str, str]:
    """Seed all technologies used by projects."""
    print("Adding technologies...")
    technologies_data: List[Dict[str, Optional[str]]] = [
        {"name": "Java", "category": "language", "icon": "devicon-java-plain", "color": "#007396"},
        {"name": "Spring Boot", "category": "framework", "icon": "devicon-spring-plain", "color": "#6DB33F"},
        {"name": "Python", "category": "language", "icon": "devicon-python-plain", "color": "#3776AB"},
        {"name": "FastAPI", "category": "framework", "icon": "devicon-fastapi-plain", "color": "#009688"},
        {"name": "TypeScript", "category": "language", "icon": "devicon-typescript-plain", "color": "#3178C6"},
        {"name": "JavaScript", "category": "language", "icon": "devicon-javascript-plain", "color": "#F7DF1E"},
        {"name": "SQL", "category": "language", "icon": "devicon-azuresqldatabase-plain", "color": "#336791"},
        {"name": "C#", "category": "language", "icon": "devicon-csharp-plain", "color": "#239120"},
        {"name": "Docker", "category": "tool", "icon": "devicon-docker-plain", "color": "#2496ED"},
        {"name": "Kubernetes", "category": "tool", "icon": "devicon-kubernetes-plain", "color": "#326CE5"},
        {"name": "GitHub Actions", "category": "tool", "icon": "devicon-githubactions-plain", "color": "#2088FF"},
        {"name": "AWS EC2", "category": "cloud", "icon": "devicon-amazonwebservices-plain-wordmark", "color": "#FF9900"},
        {"name": "AWS S3", "category": "cloud", "icon": "devicon-amazonwebservices-plain-wordmark", "color": "#FF9900"},
        {"name": "Spring Cloud Config", "category": "framework", "icon": "devicon-spring-plain", "color": "#6DB33F"},
        {"name": "Zuul Gateway", "category": "framework", "icon": None, "color": "#0F172A"},
        {"name": "SonarQube", "category": "tool", "icon": "devicon-sonarqube-plain", "color": "#4E9BCD"},
        {"name": "ElasticSearch", "category": "database", "icon": "devicon-elasticsearch-plain", "color": "#005571"},
        {"name": "Kibana", "category": "tool", "icon": None, "color": "#005571"},
        {"name": "Redis", "category": "database", "icon": "devicon-redis-plain", "color": "#DC382D"},
        {"name": "RabbitMQ", "category": "tool", "icon": "devicon-rabbitmq-plain", "color": "#FF6600"},
        {"name": "PostgreSQL", "category": "database", "icon": "devicon-postgresql-plain", "color": "#4169E1"},
        {"name": "Celery", "category": "tool", "icon": None, "color": "#37814A"},
        {"name": "Vagrant", "category": "tool", "icon": "devicon-vagrant-plain", "color": "#1868F2"},
        {"name": "Hibernate/JPA", "category": "framework", "icon": None, "color": "#59666C"},
        {"name": "JSF/PrimeFaces", "category": "framework", "icon": None, "color": "#4B5563"},
        {"name": "Vue.js", "category": "framework", "icon": "devicon-vuejs-plain", "color": "#4FC08D"},
        {"name": "React", "category": "framework", "icon": "devicon-react-original", "color": "#61DAFB"},
        {"name": "Next.js", "category": "framework", "icon": "devicon-nextjs-original", "color": "#111111"},
        {"name": "Tailwind CSS", "category": "framework", "icon": "devicon-tailwindcss-plain", "color": "#06B6D4"},
        {"name": "Electron", "category": "framework", "icon": "devicon-electron-original", "color": "#47848F"},
        {"name": "LLMs", "category": "library", "icon": None, "color": "#7C3AED"},
        {"name": "RAG", "category": "library", "icon": None, "color": "#9333EA"},
        {"name": "Git", "category": "tool", "icon": "devicon-git-plain", "color": "#F05032"},
        {"name": "GitLab", "category": "tool", "icon": "devicon-gitlab-plain", "color": "#FC6D26"},
        {"name": "GitHub", "category": "tool", "icon": "devicon-github-original", "color": "#181717"},
        {"name": "Maven", "category": "tool", "icon": "devicon-maven-plain", "color": "#C71A36"},
        {"name": "Gradle", "category": "tool", "icon": "devicon-gradle-plain", "color": "#02303A"},
        {"name": "Linux (Ubuntu)", "category": "tool", "icon": "devicon-linux-plain", "color": "#FCC624"},
        {"name": "Azure DevOps", "category": "tool", "icon": "devicon-azure-plain", "color": "#0078D4"},
        {"name": "PyQt6", "category": "framework", "icon": None, "color": "#41CD52"},
        {"name": "Scrapy", "category": "framework", "icon": None, "color": "#60A839"},
        {"name": "BeautifulSoup", "category": "library", "icon": None, "color": "#1D4ED8"},
        {"name": "Pytest", "category": "tool", "icon": "devicon-pytest-plain", "color": "#0A9EDC"},
        {"name": "JUnit", "category": "tool", "icon": None, "color": "#25A162"},
        {"name": "JWT", "category": "tool", "icon": None, "color": "#F59E0B"},
        {"name": "RBAC", "category": "tool", "icon": None, "color": "#D97706"},
        {"name": "Supabase", "category": "cloud", "icon": "devicon-supabase-plain", "color": "#3ECF8E"},
        {"name": "Vercel", "category": "cloud", "icon": "devicon-vercel-original", "color": "#111111"},
        {"name": "Railway", "category": "cloud", "icon": None, "color": "#4C1D95"},
        {"name": "Monaco Editor", "category": "framework", "icon": None, "color": "#3B82F6"},
    ]
    for tech_data in technologies_data:
        db.add(
            Technology(
                name=tech_data["name"],
                slug=slugify(tech_data["name"]),
                category=tech_data["category"],
                icon=tech_data["icon"],
                color=tech_data["color"],
            )
        )
    db.commit()
    tech_map = {tech.name: str(tech.id) for tech in db.query(Technology).all()}
    print(f"Added {len(tech_map)} technologies")
    return tech_map


def seed_skills(db: Session) -> None:
    """Seed skills with TR/EN translations."""
    print("Adding skills...")
    category_tr = {
        "Cloud & DevOps": "Bulut ve DevOps",
        "Observability & Infra": "Gozlemlenebilirlik ve Altyapi",
        "Backend": "Backend",
        "Architecture": "Mimari",
        "Testing & Automation": "Test ve Otomasyon",
        "Frontend": "Frontend",
        "Languages": "Diller",
        "AI & Data": "Yapay Zeka ve Veri",
        "Tooling": "Araclar",
    }
    skills_data = [
        {"name": "Docker", "name_tr": "Docker", "category": "Cloud & DevOps", "proficiency": 90, "icon": "🐳"},
        {"name": "Kubernetes", "name_tr": "Kubernetes", "category": "Cloud & DevOps", "proficiency": 75, "icon": "☸️"},
        {"name": "GitHub Actions (CI/CD)", "name_tr": "GitHub Actions (CI/CD)", "category": "Cloud & DevOps", "proficiency": 86, "icon": "⚙️"},
        {"name": "AWS (EC2, S3)", "name_tr": "AWS (EC2, S3)", "category": "Cloud & DevOps", "proficiency": 78, "icon": "☁️"},
        {"name": "Spring Cloud Config", "name_tr": "Spring Cloud Config", "category": "Cloud & DevOps", "proficiency": 82, "icon": "🧩"},
        {"name": "Zuul Gateway", "name_tr": "Zuul Gateway", "category": "Cloud & DevOps", "proficiency": 80, "icon": "🛣️"},
        {"name": "SonarQube", "name_tr": "SonarQube", "category": "Cloud & DevOps", "proficiency": 84, "icon": "📈"},
        {"name": "ElasticSearch", "name_tr": "ElasticSearch", "category": "Observability & Infra", "proficiency": 78, "icon": "🔍"},
        {"name": "Kibana", "name_tr": "Kibana", "category": "Observability & Infra", "proficiency": 80, "icon": "📊"},
        {"name": "Redis", "name_tr": "Redis", "category": "Observability & Infra", "proficiency": 82, "icon": "🟥"},
        {"name": "RabbitMQ", "name_tr": "RabbitMQ", "category": "Observability & Infra", "proficiency": 76, "icon": "🐇"},
        {"name": "PostgreSQL", "name_tr": "PostgreSQL", "category": "Observability & Infra", "proficiency": 88, "icon": "🐘"},
        {"name": "Celery", "name_tr": "Celery", "category": "Observability & Infra", "proficiency": 74, "icon": "🌿"},
        {"name": "Vagrant", "name_tr": "Vagrant", "category": "Observability & Infra", "proficiency": 70, "icon": "📦"},
        {"name": "Java/Spring Boot", "name_tr": "Java/Spring Boot", "category": "Backend", "proficiency": 92, "icon": "☕"},
        {"name": "Python/FastAPI", "name_tr": "Python/FastAPI", "category": "Backend", "proficiency": 90, "icon": "🐍"},
        {"name": "REST APIs", "name_tr": "REST API'ler", "category": "Backend", "proficiency": 91, "icon": "🔌"},
        {"name": "Hibernate/JPA", "name_tr": "Hibernate/JPA", "category": "Backend", "proficiency": 82, "icon": "🗄️"},
        {"name": "JSF/PrimeFaces", "name_tr": "JSF/PrimeFaces", "category": "Backend", "proficiency": 76, "icon": "🧱"},
        {"name": "Microservices", "name_tr": "Mikroservisler", "category": "Architecture", "proficiency": 86, "icon": "🧬"},
        {"name": "Clean Architecture", "name_tr": "Clean Architecture", "category": "Architecture", "proficiency": 87, "icon": "🏛️"},
        {"name": "JWT/RBAC", "name_tr": "JWT/RBAC", "category": "Architecture", "proficiency": 85, "icon": "🔐"},
        {"name": "Constraint Optimization", "name_tr": "Kisit Optimizasyonu", "category": "Architecture", "proficiency": 88, "icon": "🧠"},
        {"name": "JUnit", "name_tr": "JUnit", "category": "Testing & Automation", "proficiency": 84, "icon": "✅"},
        {"name": "Pytest", "name_tr": "Pytest", "category": "Testing & Automation", "proficiency": 88, "icon": "🧪"},
        {"name": "CI/CD Pipelines", "name_tr": "CI/CD Pipeline'lari", "category": "Testing & Automation", "proficiency": 86, "icon": "🔁"},
        {"name": "Defect Tracking (Jira, GitLab)", "name_tr": "Hata Takibi (Jira, GitLab)", "category": "Testing & Automation", "proficiency": 83, "icon": "🗂️"},
        {"name": "Test Automation", "name_tr": "Test Otomasyonu", "category": "Testing & Automation", "proficiency": 85, "icon": "🤖"},
        {"name": "Vue.js", "name_tr": "Vue.js", "category": "Frontend", "proficiency": 78, "icon": "🟢"},
        {"name": "React", "name_tr": "React", "category": "Frontend", "proficiency": 86, "icon": "⚛️"},
        {"name": "Next.js", "name_tr": "Next.js", "category": "Frontend", "proficiency": 80, "icon": "▲"},
        {"name": "JavaScript/TypeScript", "name_tr": "JavaScript/TypeScript", "category": "Frontend", "proficiency": 90, "icon": "📜"},
        {"name": "Tailwind CSS", "name_tr": "Tailwind CSS", "category": "Frontend", "proficiency": 82, "icon": "🎨"},
        {"name": "Electron", "name_tr": "Electron", "category": "Frontend", "proficiency": 70, "icon": "💡"},
        {"name": "Java", "name_tr": "Java", "category": "Languages", "proficiency": 93, "icon": "☕"},
        {"name": "Python", "name_tr": "Python", "category": "Languages", "proficiency": 92, "icon": "🐍"},
        {"name": "TypeScript/JavaScript", "name_tr": "TypeScript/JavaScript", "category": "Languages", "proficiency": 90, "icon": "🧾"},
        {"name": "SQL", "name_tr": "SQL", "category": "Languages", "proficiency": 86, "icon": "🗃️"},
        {"name": "C#", "name_tr": "C#", "category": "Languages", "proficiency": 80, "icon": "#️⃣"},
        {"name": "LLMs", "name_tr": "LLM'ler", "category": "AI & Data", "proficiency": 74, "icon": "🧠"},
        {"name": "Retrieval-Augmented Generation (RAG)", "name_tr": "Retrieval-Augmented Generation (RAG)", "category": "AI & Data", "proficiency": 72, "icon": "📚"},
        {"name": "Git/GitLab/GitHub", "name_tr": "Git/GitLab/GitHub", "category": "Tooling", "proficiency": 92, "icon": "🔧"},
        {"name": "Maven/Gradle", "name_tr": "Maven/Gradle", "category": "Tooling", "proficiency": 82, "icon": "🏗️"},
        {"name": "Linux (Ubuntu)", "name_tr": "Linux (Ubuntu)", "category": "Tooling", "proficiency": 88, "icon": "🐧"},
        {"name": "Azure DevOps", "name_tr": "Azure DevOps", "category": "Tooling", "proficiency": 76, "icon": "📦"},
    ]
    for index, item in enumerate(skills_data, start=1):
        skill = Skill(
            name=item["name"],
            category=item["category"],
            proficiency=item["proficiency"],
            icon=item["icon"],
            display_order=index,
        )
        db.add(skill)
        db.flush()
        db.add(
            SkillTranslation(
                skill_id=skill.id,
                language="en",
                name=item["name"],
                category=item["category"],
            )
        )
        db.add(
            SkillTranslation(
                skill_id=skill.id,
                language="tr",
                name=item["name_tr"],
                category=category_tr[item["category"]],
            )
        )
    db.commit()
    print(f"Added {len(skills_data)} skills with TR/EN translations")


def seed_experiences(db: Session) -> None:
    """Seed education, work, leadership and community experiences."""
    print("Adding experiences...")
    experiences_data = [
        {
            "title_en": "B.Sc. Software Engineering",
            "title_tr": "Yazilim Muhendisligi Lisans Programi",
            "organization_en": "Isik University",
            "organization_tr": "Isik Universitesi",
            "location_en": "Istanbul, Turkiye",
            "location_tr": "Istanbul, Turkiye",
            "experience_type": "education",
            "start_date": date(2023, 9, 1),
            "end_date": date(2027, 6, 1),
            "is_current": True,
            "description_en": "Third-year Software Engineering student. Expected graduation in 2027.",
            "description_tr": "Ucuncu sinif Yazilim Muhendisligi ogrencisi. Beklenen mezuniyet: 2027.",
        },
        {
            "title_en": "High School Diploma",
            "title_tr": "Lise Diplomasi",
            "organization_en": "Ergun Oner-Mehmet Oner Anatolian High School",
            "organization_tr": "Ergun Oner-Mehmet Oner Anadolu Lisesi",
            "location_en": "Istanbul, Turkiye",
            "location_tr": "Istanbul, Turkiye",
            "experience_type": "education",
            "start_date": date(2019, 9, 1),
            "end_date": date(2023, 6, 1),
            "is_current": False,
            "description_en": "Software and electronics focused high school education.",
            "description_tr": "Yazilim ve elektronik odakli lise egitimi.",
        },
        {
            "title_en": "Software Engineering Intern",
            "title_tr": "Yazilim Muhendisligi Stajyeri",
            "organization_en": "NETAS Telekomunikasyon A.S.",
            "organization_tr": "NETAS Telekomunikasyon A.S.",
            "location_en": "Istanbul, Turkiye",
            "location_tr": "Istanbul, Turkiye",
            "experience_type": "work",
            "start_date": date(2026, 1, 1),
            "end_date": date(2026, 2, 1),
            "is_current": False,
            "description_en": "Contributed production-grade code and tests to an enterprise Java microservices platform. Identified a critical v1/v2 timezone mismatch through YAML configuration and ELK analysis, and documented remediation with 600+ lines of tests.",
            "description_tr": "Kurumsal Java mikroservis platformunda canli ortama giden kod ve test katkisi saglandi. YAML konfigurasyonu ve ELK analizi ile kritik v1/v2 timezone uyumsuzlugu tespit edilip 600+ satir test ile cozum dokumante edildi.",
        },
        {
            "title_en": "Project Management Intern (Remote)",
            "title_tr": "Proje Yonetimi Stajyeri (Uzaktan)",
            "organization_en": "Arch of Sigma",
            "organization_tr": "Arch of Sigma",
            "location_en": "Remote",
            "location_tr": "Uzaktan",
            "experience_type": "work",
            "start_date": date(2025, 11, 1),
            "end_date": date(2026, 1, 1),
            "is_current": False,
            "description_en": "Supported cross-border architecture and engineering projects across Turkiye and the Balkans by coordinating documentation, deliverables, and milestone tracking.",
            "description_tr": "Turkiye ve Balkanlar'daki sinir otesi mimarlik/muhendislik projelerinde dokumantasyon, teslimat ve kilometre tasi takibi koordinasyonu saglandi.",
        },
        {
            "title_en": "Student Assistant",
            "title_tr": "Ogrenci Asistani",
            "organization_en": "Isik University - CSE Department",
            "organization_tr": "Isik Universitesi - CSE Bolumu",
            "location_en": "Istanbul, Turkiye",
            "location_tr": "Istanbul, Turkiye",
            "experience_type": "work",
            "start_date": date(2024, 2, 1),
            "end_date": None,
            "is_current": True,
            "description_en": "Mentors students in OOP lab sessions with focus on clean code and software design fundamentals.",
            "description_tr": "OOP laboratuvarlarinda ogrencilere clean code ve yazilim tasarim temelleri uzerine mentorluk sagliyor.",
        },
        {
            "title_en": "Research Assistant",
            "title_tr": "Arastirma Asistani",
            "organization_en": "AdaLab - Academic Data Analytics Lab",
            "organization_tr": "AdaLab - Akademik Veri Analitigi Laboratuvari",
            "location_en": "Istanbul, Turkiye",
            "location_tr": "Istanbul, Turkiye",
            "experience_type": "work",
            "start_date": date(2025, 12, 1),
            "end_date": None,
            "is_current": True,
            "description_en": "Supports AI and data analytics research with data processing pipelines and algorithmic evaluation.",
            "description_tr": "Yapay zeka ve veri analitigi arastirmalarina veri isleme pipeline'lari ve algoritmik degerlendirme ile katkida bulunuyor.",
        },
        {
            "title_en": "Vice President & Project Coordinator",
            "title_tr": "Baskan Yardimcisi ve Proje Koordinatoru",
            "organization_en": "IEEE Isik Student Branch",
            "organization_tr": "IEEE Isik Ogrenci Kolu",
            "location_en": "Istanbul, Turkiye",
            "location_tr": "Istanbul, Turkiye",
            "experience_type": "volunteer",
            "start_date": date(2025, 11, 1),
            "end_date": None,
            "is_current": True,
            "description_en": "Leads operations, workshops, hackathons, and industry networking events for 1,100+ students.",
            "description_tr": "1.100+ ogrenciye ulasan teknik etkinlikler, hackathonlar ve sektor bulusmalari dahil operasyonlari yonetiyor.",
        },
        {
            "title_en": "Organization Committee Member",
            "title_tr": "Organizasyon Komitesi Uyesi",
            "organization_en": "2025 IEEE Signal Processing & Communications Applications (SIU) Conference",
            "organization_tr": "2025 IEEE Sinyal Isleme ve Iletisim Uygulamalari (SIU) Konferansi",
            "location_en": "Turkiye",
            "location_tr": "Turkiye",
            "experience_type": "volunteer",
            "start_date": date(2025, 11, 1),
            "end_date": date(2025, 11, 30),
            "is_current": False,
            "description_en": "Coordinated venue logistics and technical session infrastructure for 300+ attendees.",
            "description_tr": "300+ katilimci icin mekan lojistigi ve teknik oturum altyapisinin koordinasyonuna katkida bulundu.",
        },
        {
            "title_en": "Lead Organizer",
            "title_tr": "Bas Organizator",
            "organization_en": "IEEEXtreme'24 Programming Camp",
            "organization_tr": "IEEEXtreme'24 Programlama Kampi",
            "location_en": "Istanbul, Turkiye",
            "location_tr": "Istanbul, Turkiye",
            "experience_type": "volunteer",
            "start_date": date(2024, 7, 1),
            "end_date": date(2024, 7, 31),
            "is_current": False,
            "description_en": "Directed a national programming bootcamp focused on competitive programming, algorithms, and data structures.",
            "description_tr": "Rekabetci programlama, algoritma ve veri yapilari odakli ulusal capta bir programlama kampini yonetti.",
        },
        {
            "title_en": "Environmental Volunteer",
            "title_tr": "Cevre Gonullusu",
            "organization_en": "TEMA Foundation & WWF Turkiye",
            "organization_tr": "TEMA Vakfi ve WWF Turkiye",
            "location_en": "Turkiye",
            "location_tr": "Turkiye",
            "experience_type": "volunteer",
            "start_date": date(2022, 1, 1),
            "end_date": None,
            "is_current": True,
            "description_en": "Participates in reforestation, environmental protection, and wildlife awareness initiatives.",
            "description_tr": "Agaclandirma, cevre koruma ve yaban hayati farkindalik calismalarina gonullu destek veriyor.",
        },
        {
            "title_en": "Software Lead",
            "title_tr": "Yazilim Takim Lideri",
            "organization_en": "Teknofest Sarkan UAV Defense Platform",
            "organization_tr": "Teknofest Sarkan IHA Savunma Platformu",
            "location_en": "Turkiye",
            "location_tr": "Turkiye",
            "experience_type": "activity",
            "start_date": date(2024, 5, 1),
            "end_date": date(2025, 5, 1),
            "is_current": False,
            "description_en": "Led anti-jamming telemetry software and team coordination. Project ranked 3rd among 700+ proposals in preliminary evaluation.",
            "description_tr": "Anti-jamming telemetri yazilimi ve ekip koordinasyonuna liderlik etti. Proje on degerlendirmede 700+ basvuru arasinda 3. oldu.",
        },
        {
            "title_en": "FRC Houston World Championship Finalist",
            "title_tr": "FRC Houston Dunya Sampiyonasi Finalisti",
            "organization_en": "FIRST Robotics Competition - Team 7840 EMONER",
            "organization_tr": "FIRST Robotics Competition - Team 7840 EMONER",
            "location_en": "Houston, USA",
            "location_tr": "Houston, ABD",
            "experience_type": "activity",
            "start_date": date(2019, 4, 1),
            "end_date": date(2019, 4, 30),
            "is_current": False,
            "description_en": "Reached world championship finals with Team 7840 and gained competitive robotics experience.",
            "description_tr": "Team 7840 ile dunya sampiyonasi finallerine katilarak rekabetci robotik deneyimi kazandi.",
        },
    ]
    for index, item in enumerate(experiences_data, start=1):
        experience = Experience(
            title=item["title_en"],
            organization=item["organization_en"],
            location=item["location_en"],
            experience_type=item["experience_type"],
            start_date=item["start_date"],
            end_date=item["end_date"],
            is_current=item["is_current"],
            description=item["description_en"],
            display_order=index,
        )
        db.add(experience)
        db.flush()
        db.add(
            ExperienceTranslation(
                experience_id=experience.id,
                language="en",
                title=item["title_en"],
                organization=item["organization_en"],
                location=item["location_en"],
                description=item["description_en"],
            )
        )
        db.add(
            ExperienceTranslation(
                experience_id=experience.id,
                language="tr",
                title=item["title_tr"],
                organization=item["organization_tr"],
                location=item["location_tr"],
                description=item["description_tr"],
            )
        )
    db.commit()
    print(f"Added {len(experiences_data)} experiences with TR/EN translations")


def seed_projects(db: Session) -> List[Project]:
    """Seed CV v6 projects with TR/EN translations."""
    print("Adding projects...")
    projects_data = [
        {
            "slug": "isikschedule-platform",
            "title_en": "IsikSchedule Platform",
            "title_tr": "IsikSchedule Platformu",
            "short_en": "Constraint-aware scheduling engine across desktop and web products",
            "short_tr": "Masaustu ve web urunlerinde kisit farkinda ders programi motoru",
            "description_en": (
                "Dual-platform scheduling system with shared domain logic. "
                "Desktop version serves around 1,000 active users. "
                "Core engine includes 13 optimization algorithms such as Genetic, SA, Tabu, PSO, and Hybrid GA+SA. "
                "Web architecture includes FastAPI, Next.js, PostgreSQL, Redis, Celery, JWT/RBAC, and Dockerized services."
            ),
            "description_tr": (
                "Paylasilan alan mantigina sahip cift platformlu ders programlama sistemi. "
                "Masaustu surumu yaklasik 1.000 aktif kullaniciya hizmet veriyor. "
                "Genetik, SA, Tabu, PSO ve Hybrid GA+SA dahil 13 optimizasyon algoritmasi iceriyor. "
                "Web mimarisinde FastAPI, Next.js, PostgreSQL, Redis, Celery, JWT/RBAC ve Dockerize servisler kullaniliyor."
            ),
            "github_url": "https://github.com/TurkishKEBAB/isikschedule-core",
            "demo_url": "https://github.com/TurkishKEBAB/isikschedule-web",
            "featured": True,
            "display_order": 1,
        },
        {
            "slug": "agentic-ide-thesis-project",
            "title_en": "Agentic IDE (Thesis Project)",
            "title_tr": "Agentic IDE (Tez Projesi)",
            "short_en": "Agent-first IDE architecture with human-in-the-loop controls",
            "short_tr": "Insan onayli kontrol akisina sahip agent-first IDE mimarisi",
            "description_en": (
                "Early architectural phase of a modular AI-native IDE built with TypeScript, Electron, and Monaco. "
                "The core loop is Observe -> Plan -> Approve -> Apply with prohibited command enforcement. "
                "Hybrid LLM orchestration is designed for local latency-sensitive tasks and cloud-based complex planning."
            ),
            "description_tr": (
                "TypeScript, Electron ve Monaco ile gelistirilen modul yapida AI-native IDE'nin erken mimari asamasi. "
                "Temel dongu Observe -> Plan -> Approve -> Apply seklinde tasarlandi ve riskli komutlara kisit uygulanacak. "
                "Hibrit LLM orkestrasyonu, gecikmeye hassas gorevlerde lokal; karmasik planlamada bulut modellerini hedefliyor."
            ),
            "github_url": None,
            "demo_url": None,
            "featured": True,
            "display_order": 2,
        },
        {
            "slug": "teknofest-sarkan-uav-defense-platform",
            "title_en": "Teknofest Sarkan UAV Defense Platform",
            "title_tr": "Teknofest Sarkan IHA Savunma Platformu",
            "short_en": "Anti-jamming telemetry software for a defense UAV platform",
            "short_tr": "Savunma odakli IHA platformu icin anti-jamming telemetri yazilimi",
            "description_en": (
                "Led software development for telemetry reliability and anti-jamming communication. "
                "Ranked 3rd among 700+ projects in preliminary evaluation. "
                "Managed a total 200,000 TL budget including a 165,000 TL TUBITAK R&D grant and Savronik sponsorship."
            ),
            "description_tr": (
                "Telemetri guvenilirligi ve anti-jamming iletisim odakli yazilim gelistirme sureclerine liderlik edildi. "
                "On degerlendirmede 700+ proje arasinda 3. sirada yer aldi. "
                "165.000 TL TUBITAK Ar-Ge hibesi ve Savronik sponsorlugu dahil toplam 200.000 TL butce yonetildi."
            ),
            "github_url": None,
            "demo_url": None,
            "featured": True,
            "display_order": 3,
        },
        {
            "slug": "automated-web-crawler",
            "title_en": "Automated Web Crawler",
            "title_tr": "Otomatik Web Tarayici",
            "short_en": "Concurrent scraping system with FastAPI and PostgreSQL backend",
            "short_tr": "FastAPI ve PostgreSQL destekli eszamanli web tarama sistemi",
            "description_en": (
                "High-throughput concurrent scraper built with Scrapy and BeautifulSoup. "
                "Backend services expose ingestion and monitoring endpoints via FastAPI + PostgreSQL. "
                "Includes robots.txt compliance, retry policies, and fault-tolerance controls with 89.9% successful execution."
            ),
            "description_tr": (
                "Scrapy ve BeautifulSoup ile gelistirilen yuksek throughput eszamanli tarama sistemi. "
                "Backend tarafinda FastAPI + PostgreSQL ile veri alim ve izleme endpoint'leri sunuluyor. "
                "robots.txt uyumlulugu, retry politikasi ve fault-tolerance mekanizmalari ile %89.9 basari orani saglandi."
            ),
            "github_url": None,
            "demo_url": None,
            "featured": True,
            "display_order": 4,
        },
        {
            "slug": "portfolio-platform-web-desktop",
            "title_en": "Portfolio Platform (Web + Desktop)",
            "title_tr": "Portfolyo Platformu (Web + Masaustu)",
            "short_en": "Full-stack multi-platform portfolio with admin operations and CI/CD",
            "short_tr": "Admin operasyonlari ve CI/CD iceren full-stack cok platformlu portfolyo sistemi",
            "description_en": (
                "Multi-platform system with 60+ API endpoints, JWT/RBAC auth, 24h GitHub API caching, "
                "Supabase asset operations, SMTP notifications, and staged deployments to Vercel and Railway."
            ),
            "description_tr": (
                "60+ API endpoint, JWT/RBAC kimlik dogrulama, 24 saatlik GitHub API cache, "
                "Supabase varlik yonetimi, SMTP bildirimleri ve Vercel/Railway asamali dagitimlarini iceren cok platformlu sistem."
            ),
            "github_url": "https://github.com/TurkishKEBAB/Site",
            "demo_url": None,
            "featured": True,
            "display_order": 5,
        },
    ]
    created_projects: List[Project] = []
    for item in projects_data:
        project = Project(
            slug=item["slug"],
            title=item["title_en"],
            short_description=item["short_en"],
            description=item["description_en"],
            cover_image=None,
            github_url=item["github_url"],
            demo_url=item["demo_url"],
            featured=item["featured"],
            display_order=item["display_order"],
        )
        db.add(project)
        db.flush()
        db.add(
            ProjectTranslation(
                project_id=project.id,
                language="en",
                title=item["title_en"],
                short_description=item["short_en"],
                description=item["description_en"],
            )
        )
        db.add(
            ProjectTranslation(
                project_id=project.id,
                language="tr",
                title=item["title_tr"],
                short_description=item["short_tr"],
                description=item["description_tr"],
            )
        )
        created_projects.append(project)
    db.commit()
    print(f"Added {len(created_projects)} projects with TR/EN translations")
    return created_projects


def link_project_technologies(db: Session, tech_map: Dict[str, str], projects: List[Project]) -> None:
    """Connect projects to technologies."""
    print("Linking project technologies...")
    mapping = {
        "isikschedule-platform": [
            "TypeScript",
            "FastAPI",
            "Next.js",
            "PostgreSQL",
            "Redis",
            "Docker",
            "PyQt6",
            "Celery",
            "JWT",
            "RBAC",
        ],
        "agentic-ide-thesis-project": [
            "TypeScript",
            "Electron",
            "Monaco Editor",
            "LLMs",
            "RAG",
            "GitHub Actions",
        ],
        "teknofest-sarkan-uav-defense-platform": [
            "Python",
            "Git",
            "PostgreSQL",
        ],
        "automated-web-crawler": [
            "Python",
            "Scrapy",
            "BeautifulSoup",
            "FastAPI",
            "PostgreSQL",
            "Pytest",
        ],
        "portfolio-platform-web-desktop": [
            "FastAPI",
            "React",
            "PostgreSQL",
            "Docker",
            "Redis",
            "JWT",
            "RBAC",
            "Supabase",
            "Vercel",
            "Railway",
            "SonarQube",
        ],
    }
    project_by_slug = {project.slug: project for project in projects}
    links = 0
    for slug, tech_names in mapping.items():
        project = project_by_slug.get(slug)
        if not project:
            continue
        for tech_name in tech_names:
            tech_id = tech_map.get(tech_name)
            if not tech_id:
                continue
            db.add(ProjectTechnology(project_id=project.id, technology_id=tech_id))
            links += 1
    db.commit()
    print(f"Linked {links} project-technology pairs")


def seed_site_config(db: Session) -> None:
    """Seed site level configuration."""
    print("Adding site config...")
    config_data = [
        {"key": "site_name", "value": "Yigit Okur", "description": "Display name"},
        {"key": "site_title", "value": "Yigit Okur | Software Engineer · Cloud & DevOps", "description": "SEO title"},
        {
            "key": "site_description",
            "value": "Software Engineering student focused on enterprise backend systems, cloud-native architecture, and DevOps automation.",
            "description": "SEO description",
        },
        {"key": "contact_email", "value": "yigitokur@ieee.org", "description": "Primary contact"},
        {"key": "github_url", "value": "https://github.com/TurkishKEBAB", "description": "GitHub profile"},
        {"key": "linkedin_url", "value": "https://www.linkedin.com/in/yigit-okur-050b5b278", "description": "LinkedIn profile"},
        {
            "key": "meta_keywords",
            "value": "Yigit Okur, Software Engineer, Cloud, DevOps, Spring Boot, FastAPI, React, Portfolio",
            "description": "SEO keywords",
        },
        {"key": "maintenance_mode", "value": "false", "description": "Maintenance flag"},
    ]
    for item in config_data:
        db.add(SiteConfig(key=item["key"], value=item["value"], description=item["description"]))
    db.commit()
    print(f"Added {len(config_data)} site config entries")


def seed_ui_translations(db: Session) -> None:
    """Seed minimal UI translations to avoid empty translation tables."""
    print("Adding UI translations...")
    entries = [
        ("en", "nav_home", "Home"),
        ("en", "nav_about", "About"),
        ("en", "nav_projects", "Projects"),
        ("en", "nav_blog", "Blog"),
        ("en", "nav_contact", "Contact"),
        ("tr", "nav_home", "Ana Sayfa"),
        ("tr", "nav_about", "Hakkimda"),
        ("tr", "nav_projects", "Projeler"),
        ("tr", "nav_blog", "Blog"),
        ("tr", "nav_contact", "Iletisim"),
    ]
    for language, key, value in entries:
        db.add(Translation(language=language, translation_key=key, value=value))
    db.commit()
    print(f"Added {len(entries)} translation entries")


def seed_blog_posts(db: Session, author: User) -> None:
    """Seed concise blog content aligned with portfolio topics."""
    print("Adding blog posts...")
    posts = [
        {
            "slug": "neta-timezone-investigation",
            "title": "Debugging a Silent Timezone Bug in Enterprise Microservices",
            "excerpt": "A short case study on v1/v2 timezone mismatch detection with YAML and ELK traces.",
            "content": (
                "During my internship at NETAS, I investigated a silent date-boundary mismatch between "
                "UTC and UTC+3 configurations. The issue was not detected by client-side validation. "
                "I reproduced the defect through targeted logs and implemented a test matrix with 600+ lines "
                "to document and prevent regressions."
            ),
            "reading_time": 5,
        },
        {
            "slug": "building-constraint-aware-schedulers",
            "title": "Building Constraint-Aware Schedulers Across Desktop and Web",
            "excerpt": "Notes from IsikSchedule architecture decisions and algorithmic tradeoffs.",
            "content": (
                "IsikSchedule combines hard constraints and preference optimization with a set of heuristic and "
                "metaheuristic algorithms. This post summarizes architecture choices that made desktop and web "
                "versions share the same core domain logic."
            ),
            "reading_time": 4,
        },
    ]
    for item in posts:
        post = BlogPost(
            slug=item["slug"],
            title=item["title"],
            content=item["content"],
            excerpt=item["excerpt"],
            cover_image=None,
            author_id=author.id,
            published=True,
            published_at=datetime.now(timezone.utc),
            reading_time=item["reading_time"],
            views=0,
        )
        db.add(post)
        db.flush()
        db.add(
            BlogTranslation(
                blog_post_id=post.id,
                language="tr",
                title=item["title"],
                content=item["content"],
                excerpt=item["excerpt"],
            )
        )
    db.commit()
    print(f"Added {len(posts)} blog posts")


def clear_existing_data(db: Session) -> None:
    """Clear all mutable data in dependency-safe order."""
    print("Clearing existing data...")
    models_in_order = [
        TokenBlacklist,
        RefreshTokenSession,
        ProjectTechnology,
        ProjectImage,
        ProjectTranslation,
        BlogTranslation,
        BlogPost,
        ExperienceTranslation,
        Experience,
        SkillTranslation,
        Skill,
        Translation,
        SiteConfig,
        Technology,
        GitHubRepo,
        ContactMessage,
        PageView,
        User,
    ]
    for model in models_in_order:
        db.query(model).delete(synchronize_session=False)
    db.commit()
    print("Existing records cleared")


def main() -> None:
    """Seed all portfolio data from CV v6."""
    print("\n" + "=" * 60)
    print("SEEDING DATABASE WITH CV V6 DATA")
    print("=" * 60 + "\n")
    db = SessionLocal()
    try:
        existing_data = {
            "skills": db.query(Skill).count(),
            "experiences": db.query(Experience).count(),
            "projects": db.query(Project).count(),
        }
        if any(existing_data.values()):
            print("Existing data detected:")
            for key, value in existing_data.items():
                print(f"  - {key}: {value}")
            clear_existing_data(db)

        admin_user = seed_admin_user(db)
        tech_map = seed_technologies(db)
        seed_skills(db)
        seed_experiences(db)
        projects = seed_projects(db)
        link_project_technologies(db, tech_map, projects)
        seed_site_config(db)
        seed_ui_translations(db)
        seed_blog_posts(db, admin_user)

        print("\n" + "=" * 60)
        print("DATABASE SEEDING COMPLETED")
        print("=" * 60)
        print(f"  - Users: {db.query(User).count()}")
        print(f"  - Skills: {db.query(Skill).count()}")
        print(f"  - Skill translations: {db.query(SkillTranslation).count()}")
        print(f"  - Experiences: {db.query(Experience).count()}")
        print(f"  - Experience translations: {db.query(ExperienceTranslation).count()}")
        print(f"  - Projects: {db.query(Project).count()}")
        print(f"  - Project translations: {db.query(ProjectTranslation).count()}")
        print(f"  - Project-technology links: {db.query(ProjectTechnology).count()}")
        print(f"  - Technologies: {db.query(Technology).count()}")
        print(f"  - Site config: {db.query(SiteConfig).count()}")
        print(f"  - UI translations: {db.query(Translation).count()}")
        print(f"  - Blog posts: {db.query(BlogPost).count()}")
    except Exception:
        print("\nError during seeding")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
