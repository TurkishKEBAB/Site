"""
Seed database with CV v6 data for Yigit Okur.
"""

import os
from datetime import date, datetime, timezone
from typing import Dict, List, Optional

from app.database import SessionLocal
from app.models import (
    AdminActionLog,
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
from slugify import slugify
from sqlalchemy.orm import Session


def seed_admin_user(db: Session) -> User:
    """Create portfolio owner user."""
    seed_admin_password = os.getenv("SEED_ADMIN_PASSWORD")
    if not seed_admin_password:
        raise RuntimeError("SEED_ADMIN_PASSWORD is required to seed the admin user.")

    user = User(
        email="yigitokur@ieee.org",
        username="yigitokur",
        password_hash=get_password_hash(seed_admin_password),
        is_active=True,
        is_admin=True,
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
        {
            "name": "Java",
            "category": "language",
            "icon": "devicon-java-plain",
            "color": "#007396",
        },
        {
            "name": "Spring Boot",
            "category": "framework",
            "icon": "devicon-spring-plain",
            "color": "#6DB33F",
        },
        {
            "name": "Python",
            "category": "language",
            "icon": "devicon-python-plain",
            "color": "#3776AB",
        },
        {
            "name": "FastAPI",
            "category": "framework",
            "icon": "devicon-fastapi-plain",
            "color": "#009688",
        },
        {
            "name": "TypeScript",
            "category": "language",
            "icon": "devicon-typescript-plain",
            "color": "#3178C6",
        },
        {
            "name": "JavaScript",
            "category": "language",
            "icon": "devicon-javascript-plain",
            "color": "#F7DF1E",
        },
        {
            "name": "SQL",
            "category": "language",
            "icon": "devicon-azuresqldatabase-plain",
            "color": "#336791",
        },
        {
            "name": "SQLite",
            "category": "database",
            "icon": None,
            "color": "#003B57",
        },
        {
            "name": "C#",
            "category": "language",
            "icon": "devicon-csharp-plain",
            "color": "#239120",
        },
        {
            "name": "Docker",
            "category": "tool",
            "icon": "devicon-docker-plain",
            "color": "#2496ED",
        },
        {
            "name": "Kubernetes",
            "category": "tool",
            "icon": "devicon-kubernetes-plain",
            "color": "#326CE5",
        },
        {
            "name": "GitHub Actions",
            "category": "tool",
            "icon": "devicon-githubactions-plain",
            "color": "#2088FF",
        },
        {
            "name": "AWS EC2",
            "category": "cloud",
            "icon": "devicon-amazonwebservices-plain-wordmark",
            "color": "#FF9900",
        },
        {
            "name": "AWS S3",
            "category": "cloud",
            "icon": "devicon-amazonwebservices-plain-wordmark",
            "color": "#FF9900",
        },
        {
            "name": "Spring Cloud Config",
            "category": "framework",
            "icon": "devicon-spring-plain",
            "color": "#6DB33F",
        },
        {
            "name": "Zuul Gateway",
            "category": "framework",
            "icon": None,
            "color": "#0F172A",
        },
        {
            "name": "SonarQube",
            "category": "tool",
            "icon": "devicon-sonarqube-plain",
            "color": "#4E9BCD",
        },
        {
            "name": "ElasticSearch",
            "category": "database",
            "icon": "devicon-elasticsearch-plain",
            "color": "#005571",
        },
        {"name": "Kibana", "category": "tool", "icon": None, "color": "#005571"},
        {
            "name": "Redis",
            "category": "database",
            "icon": "devicon-redis-plain",
            "color": "#DC382D",
        },
        {
            "name": "RabbitMQ",
            "category": "tool",
            "icon": "devicon-rabbitmq-plain",
            "color": "#FF6600",
        },
        {
            "name": "PostgreSQL",
            "category": "database",
            "icon": "devicon-postgresql-plain",
            "color": "#4169E1",
        },
        {"name": "Celery", "category": "tool", "icon": None, "color": "#37814A"},
        {
            "name": "Vagrant",
            "category": "tool",
            "icon": "devicon-vagrant-plain",
            "color": "#1868F2",
        },
        {
            "name": "Hibernate/JPA",
            "category": "framework",
            "icon": None,
            "color": "#59666C",
        },
        {
            "name": "JSF/PrimeFaces",
            "category": "framework",
            "icon": None,
            "color": "#4B5563",
        },
        {
            "name": "Vue.js",
            "category": "framework",
            "icon": "devicon-vuejs-plain",
            "color": "#4FC08D",
        },
        {
            "name": "React",
            "category": "framework",
            "icon": "devicon-react-original",
            "color": "#61DAFB",
        },
        {
            "name": "Next.js",
            "category": "framework",
            "icon": "devicon-nextjs-original",
            "color": "#111111",
        },
        {
            "name": "Tailwind CSS",
            "category": "framework",
            "icon": "devicon-tailwindcss-plain",
            "color": "#06B6D4",
        },
        {
            "name": "Electron",
            "category": "framework",
            "icon": "devicon-electron-original",
            "color": "#47848F",
        },
        {"name": "LLMs", "category": "library", "icon": None, "color": "#7C3AED"},
        {"name": "RAG", "category": "library", "icon": None, "color": "#9333EA"},
        {
            "name": "Git",
            "category": "tool",
            "icon": "devicon-git-plain",
            "color": "#F05032",
        },
        {
            "name": "GitLab",
            "category": "tool",
            "icon": "devicon-gitlab-plain",
            "color": "#FC6D26",
        },
        {
            "name": "GitHub",
            "category": "tool",
            "icon": "devicon-github-original",
            "color": "#181717",
        },
        {
            "name": "Maven",
            "category": "tool",
            "icon": "devicon-maven-plain",
            "color": "#C71A36",
        },
        {
            "name": "Gradle",
            "category": "tool",
            "icon": "devicon-gradle-plain",
            "color": "#02303A",
        },
        {
            "name": "Linux (Ubuntu)",
            "category": "tool",
            "icon": "devicon-linux-plain",
            "color": "#FCC624",
        },
        {
            "name": "Azure DevOps",
            "category": "tool",
            "icon": "devicon-azure-plain",
            "color": "#0078D4",
        },
        {"name": "PyQt6", "category": "framework", "icon": None, "color": "#41CD52"},
        {"name": "Scrapy", "category": "framework", "icon": None, "color": "#60A839"},
        {
            "name": "BeautifulSoup",
            "category": "library",
            "icon": None,
            "color": "#1D4ED8",
        },
        {
            "name": "Pytest",
            "category": "tool",
            "icon": "devicon-pytest-plain",
            "color": "#0A9EDC",
        },
        {"name": "JUnit", "category": "tool", "icon": None, "color": "#25A162"},
        {"name": "JWT", "category": "tool", "icon": None, "color": "#F59E0B"},
        {"name": "RBAC", "category": "tool", "icon": None, "color": "#D97706"},
        {
            "name": "Supabase",
            "category": "cloud",
            "icon": "devicon-supabase-plain",
            "color": "#3ECF8E",
        },
        {
            "name": "Vercel",
            "category": "cloud",
            "icon": "devicon-vercel-original",
            "color": "#111111",
        },
        {"name": "Railway", "category": "cloud", "icon": None, "color": "#4C1D95"},
        {
            "name": "Monaco Editor",
            "category": "framework",
            "icon": None,
            "color": "#3B82F6",
        },
        {"name": "MDX", "category": "library", "icon": None, "color": "#F9AC00"},
        {"name": "MySQL", "category": "database", "icon": None, "color": "#4479A1"},
        {"name": "Leaflet", "category": "library", "icon": None, "color": "#199900"},
        {"name": "HFST", "category": "tool", "icon": None, "color": "#7C3AED"},
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
        "Observability & Infra": "Gözlemlenebilirlik ve Altyapı",
        "Backend": "Backend",
        "Architecture": "Mimari",
        "Testing & Automation": "Test ve Otomasyon",
        "Frontend": "Frontend",
        "Languages": "Diller",
        "AI & Data": "Yapay Zeka ve Veri",
        "Tooling": "Araçlar",
    }
    skills_data = [
        {
            "name": "Docker",
            "name_tr": "Docker",
            "category": "Cloud & DevOps",
            "proficiency": 90,
            "icon": "🐳",
        },
        {
            "name": "Kubernetes",
            "name_tr": "Kubernetes",
            "category": "Cloud & DevOps",
            "proficiency": 75,
            "icon": "☸️",
        },
        {
            "name": "GitHub Actions (CI/CD)",
            "name_tr": "GitHub Actions (CI/CD)",
            "category": "Cloud & DevOps",
            "proficiency": 86,
            "icon": "⚙️",
        },
        {
            "name": "AWS (EC2, S3)",
            "name_tr": "AWS (EC2, S3)",
            "category": "Cloud & DevOps",
            "proficiency": 78,
            "icon": "☁️",
        },
        {
            "name": "Spring Cloud Config",
            "name_tr": "Spring Cloud Config",
            "category": "Cloud & DevOps",
            "proficiency": 82,
            "icon": "🧩",
        },
        {
            "name": "Zuul Gateway",
            "name_tr": "Zuul Gateway",
            "category": "Cloud & DevOps",
            "proficiency": 80,
            "icon": "🛣️",
        },
        {
            "name": "SonarQube",
            "name_tr": "SonarQube",
            "category": "Cloud & DevOps",
            "proficiency": 84,
            "icon": "📈",
        },
        {
            "name": "ElasticSearch",
            "name_tr": "ElasticSearch",
            "category": "Observability & Infra",
            "proficiency": 78,
            "icon": "🔍",
        },
        {
            "name": "Kibana",
            "name_tr": "Kibana",
            "category": "Observability & Infra",
            "proficiency": 80,
            "icon": "📊",
        },
        {
            "name": "Redis",
            "name_tr": "Redis",
            "category": "Observability & Infra",
            "proficiency": 82,
            "icon": "🟥",
        },
        {
            "name": "RabbitMQ",
            "name_tr": "RabbitMQ",
            "category": "Observability & Infra",
            "proficiency": 76,
            "icon": "🐇",
        },
        {
            "name": "PostgreSQL",
            "name_tr": "PostgreSQL",
            "category": "Observability & Infra",
            "proficiency": 88,
            "icon": "🐘",
        },
        {
            "name": "Celery",
            "name_tr": "Celery",
            "category": "Observability & Infra",
            "proficiency": 74,
            "icon": "🌿",
        },
        {
            "name": "Vagrant",
            "name_tr": "Vagrant",
            "category": "Observability & Infra",
            "proficiency": 70,
            "icon": "📦",
        },
        {
            "name": "Java/Spring Boot",
            "name_tr": "Java/Spring Boot",
            "category": "Backend",
            "proficiency": 92,
            "icon": "☕",
        },
        {
            "name": "Python/FastAPI",
            "name_tr": "Python/FastAPI",
            "category": "Backend",
            "proficiency": 90,
            "icon": "🐍",
        },
        {
            "name": "REST APIs",
            "name_tr": "REST API'ler",
            "category": "Backend",
            "proficiency": 91,
            "icon": "🔌",
        },
        {
            "name": "Hibernate/JPA",
            "name_tr": "Hibernate/JPA",
            "category": "Backend",
            "proficiency": 82,
            "icon": "🗄️",
        },
        {
            "name": "JSF/PrimeFaces",
            "name_tr": "JSF/PrimeFaces",
            "category": "Backend",
            "proficiency": 76,
            "icon": "🧱",
        },
        {
            "name": "Microservices",
            "name_tr": "Mikroservisler",
            "category": "Architecture",
            "proficiency": 86,
            "icon": "🧬",
        },
        {
            "name": "Clean Architecture",
            "name_tr": "Temiz Mimari",
            "category": "Architecture",
            "proficiency": 87,
            "icon": "🏛️",
        },
        {
            "name": "JWT/RBAC",
            "name_tr": "JWT/RBAC",
            "category": "Architecture",
            "proficiency": 85,
            "icon": "🔐",
        },
        {
            "name": "Constraint Optimization",
            "name_tr": "Kısıt Optimizasyonu",
            "category": "Architecture",
            "proficiency": 88,
            "icon": "🧠",
        },
        {
            "name": "JUnit",
            "name_tr": "JUnit",
            "category": "Testing & Automation",
            "proficiency": 84,
            "icon": "✅",
        },
        {
            "name": "Pytest",
            "name_tr": "Pytest",
            "category": "Testing & Automation",
            "proficiency": 88,
            "icon": "🧪",
        },
        {
            "name": "CI/CD Pipelines",
            "name_tr": "CI/CD İş Akışları",
            "category": "Testing & Automation",
            "proficiency": 86,
            "icon": "🔁",
        },
        {
            "name": "Defect Tracking (Jira, GitLab)",
            "name_tr": "Hata Takibi (Jira, GitLab)",
            "category": "Testing & Automation",
            "proficiency": 83,
            "icon": "🗂️",
        },
        {
            "name": "Test Automation",
            "name_tr": "Test Otomasyonu",
            "category": "Testing & Automation",
            "proficiency": 85,
            "icon": "🤖",
        },
        {
            "name": "Vue.js",
            "name_tr": "Vue.js",
            "category": "Frontend",
            "proficiency": 78,
            "icon": "🟢",
        },
        {
            "name": "React",
            "name_tr": "React",
            "category": "Frontend",
            "proficiency": 86,
            "icon": "⚛️",
        },
        {
            "name": "Next.js",
            "name_tr": "Next.js",
            "category": "Frontend",
            "proficiency": 80,
            "icon": "▲",
        },
        {
            "name": "JavaScript/TypeScript",
            "name_tr": "JavaScript/TypeScript",
            "category": "Frontend",
            "proficiency": 90,
            "icon": "📜",
        },
        {
            "name": "Tailwind CSS",
            "name_tr": "Tailwind CSS",
            "category": "Frontend",
            "proficiency": 82,
            "icon": "🎨",
        },
        {
            "name": "Electron",
            "name_tr": "Electron",
            "category": "Frontend",
            "proficiency": 70,
            "icon": "💡",
        },
        {
            "name": "Java",
            "name_tr": "Java",
            "category": "Languages",
            "proficiency": 93,
            "icon": "☕",
        },
        {
            "name": "Python",
            "name_tr": "Python",
            "category": "Languages",
            "proficiency": 92,
            "icon": "🐍",
        },
        {
            "name": "TypeScript/JavaScript",
            "name_tr": "TypeScript/JavaScript",
            "category": "Languages",
            "proficiency": 90,
            "icon": "🧾",
        },
        {
            "name": "SQL",
            "name_tr": "SQL",
            "category": "Languages",
            "proficiency": 86,
            "icon": "🗃️",
        },
        {
            "name": "C#",
            "name_tr": "C#",
            "category": "Languages",
            "proficiency": 80,
            "icon": "#️⃣",
        },
        {
            "name": "LLMs",
            "name_tr": "LLM'ler",
            "category": "AI & Data",
            "proficiency": 74,
            "icon": "🧠",
        },
        {
            "name": "Retrieval-Augmented Generation (RAG)",
            "name_tr": "Bilgi Erişimiyle Zenginleştirilmiş Üretim (RAG)",
            "category": "AI & Data",
            "proficiency": 72,
            "icon": "📚",
        },
        {
            "name": "Git/GitLab/GitHub",
            "name_tr": "Git/GitLab/GitHub",
            "category": "Tooling",
            "proficiency": 92,
            "icon": "🔧",
        },
        {
            "name": "Maven/Gradle",
            "name_tr": "Maven/Gradle",
            "category": "Tooling",
            "proficiency": 82,
            "icon": "🏗️",
        },
        {
            "name": "Linux (Ubuntu)",
            "name_tr": "Linux (Ubuntu)",
            "category": "Tooling",
            "proficiency": 88,
            "icon": "🐧",
        },
        {
            "name": "Azure DevOps",
            "name_tr": "Azure DevOps",
            "category": "Tooling",
            "proficiency": 76,
            "icon": "📦",
        },
    ]
    domain_by_category = {
        "Cloud & DevOps": "cloud",
        "Architecture": "backend",
        "Backend": "backend",
        "Testing & Automation": "testing",
        "Frontend": "product",
        "Languages": "backend",
        "AI & Data": "research",
        "Tooling": "cloud",
    }

    def _ring(prof: int) -> str:
        if prof >= 88:
            return "adopt"
        if prof >= 78:
            return "trial"
        if prof >= 66:
            return "assess"
        return "hold"

    for index, item in enumerate(skills_data, start=1):
        skill = Skill(
            name=item["name"],
            category=item["category"],
            domain=domain_by_category.get(item["category"], "backend"),
            ring=_ring(item["proficiency"]),
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
            "title_tr": "Yazılım Mühendisliği Lisans Programı",
            "organization_en": "Işık University",
            "organization_tr": "Işık Üniversitesi",
            "location_en": "Istanbul, Turkey",
            "location_tr": "İstanbul, Türkiye",
            "experience_type": "education",
            "start_date": date(2023, 9, 1),
            "end_date": date(2027, 6, 1),
            "is_current": True,
            "description_en": "Third-year Software Engineering student. Expected graduation in 2027.",
            "description_tr": "Üçüncü sınıf Yazılım Mühendisliği öğrencisi. Beklenen mezuniyet: 2027.",
        },
        {
            "title_en": "High School Diploma",
            "title_tr": "Lise Diploması",
            "organization_en": "Ergün Öner-Mehmet Öner Anatolian High School",
            "organization_tr": "Ergün Öner-Mehmet Öner Anadolu Lisesi",
            "location_en": "Istanbul, Turkey",
            "location_tr": "İstanbul, Türkiye",
            "experience_type": "education",
            "start_date": date(2019, 9, 1),
            "end_date": date(2023, 6, 1),
            "is_current": False,
            "description_en": "Software and electronics focused high school education.",
            "description_tr": "Yazılım ve elektronik odaklı lise eğitimi.",
        },
        {
            "title_en": "Software Engineering Intern",
            "title_tr": "Yazılım Mühendisliği Stajyeri",
            "organization_en": "NETAŞ Telecommunications Inc.",
            "organization_tr": "NETAŞ Telekomünikasyon A.Ş.",
            "location_en": "Istanbul, Turkey",
            "location_tr": "İstanbul, Türkiye",
            "experience_type": "work",
            "start_date": date(2026, 1, 1),
            "end_date": date(2026, 2, 1),
            "is_current": False,
            "description_en": "Contributed production-grade code and tests to an enterprise Java microservices platform. Identified a critical v1/v2 timezone mismatch through YAML configuration and ELK analysis, and documented remediation with 600+ lines of tests.",
            "description_tr": "Kurumsal Java mikroservis platformunda üretim ortamına giden kod ve test katkısı sağladım. YAML yapılandırması ve ELK analiziyle kritik v1/v2 saat dilimi uyumsuzluğunu tespit edip çözümü 600'den fazla satır testle belgeledim.",
        },
        {
            "title_en": "Project Management Intern (Remote)",
            "title_tr": "Proje Yönetimi Stajyeri (Uzaktan)",
            "organization_en": "Arch of Sigma",
            "organization_tr": "Arch of Sigma",
            "location_en": "Remote",
            "location_tr": "Uzaktan",
            "experience_type": "work",
            "start_date": date(2025, 11, 1),
            "end_date": date(2026, 1, 1),
            "is_current": False,
            "description_en": "Supported cross-border architecture and engineering projects across Turkiye and the Balkans by coordinating documentation, deliverables, and milestone tracking.",
            "description_tr": "Türkiye ve Balkanlar'daki sınır ötesi mimarlık ve mühendislik projelerinde dokümantasyon, teslimat ve kilometre taşı takibi koordinasyonunu sağladım.",
        },
        {
            "title_en": "Student Assistant",
            "title_tr": "Öğrenci Asistanı",
            "organization_en": "Işık University - CSE Department",
            "organization_tr": "Işık Üniversitesi - CSE Bölümü",
            "location_en": "Istanbul, Turkey",
            "location_tr": "İstanbul, Türkiye",
            "experience_type": "work",
            "start_date": date(2024, 2, 1),
            "end_date": None,
            "is_current": True,
            "description_en": "Mentors students in OOP lab sessions with focus on clean code and software design fundamentals.",
            "description_tr": "OOP laboratuvarlarında öğrencilere temiz kod ve yazılım tasarımı temelleri üzerine mentorluk sağlıyorum.",
        },
        {
            "title_en": "Vice President & Project Coordinator",
            "title_tr": "Başkan Yardımcısı ve Proje Koordinatörü",
            "organization_en": "IEEE Işık Student Branch",
            "organization_tr": "IEEE Işık Öğrenci Kolu",
            "location_en": "Istanbul, Turkey",
            "location_tr": "İstanbul, Türkiye",
            "experience_type": "volunteer",
            "start_date": date(2025, 11, 1),
            "end_date": None,
            "is_current": True,
            "description_en": "Leads operations, workshops, hackathons, and industry networking events for 1,100+ students.",
            "description_tr": "1.100'den fazla öğrenciye ulaşan teknik etkinlikler, hackathonlar ve sektör buluşmaları dâhil operasyonları yönetiyorum.",
        },
        {
            "title_en": "Organization Committee Member",
            "title_tr": "Organizasyon Komitesi Üyesi",
            "organization_en": "2025 IEEE Signal Processing & Communications Applications (SIU) Conference",
            "organization_tr": "2025 IEEE Sinyal İşleme ve İletişim Uygulamaları (SIU) Konferansı",
            "location_en": "Turkey",
            "location_tr": "Türkiye",
            "experience_type": "volunteer",
            "start_date": date(2025, 11, 1),
            "end_date": date(2025, 11, 30),
            "is_current": False,
            "description_en": "Coordinated venue logistics and technical session infrastructure for 300+ attendees.",
            "description_tr": "300'den fazla katılımcı için mekân lojistiği ve teknik oturum altyapısının koordinasyonuna katkıda bulundum.",
        },
        {
            "title_en": "Lead Organizer",
            "title_tr": "Baş Organizatör",
            "organization_en": "IEEEXtreme'24 Programming Camp",
            "organization_tr": "IEEEXtreme'24 Programlama Kampı",
            "location_en": "Istanbul, Turkey",
            "location_tr": "İstanbul, Türkiye",
            "experience_type": "volunteer",
            "start_date": date(2024, 7, 1),
            "end_date": date(2024, 7, 31),
            "is_current": False,
            "description_en": "Directed a national programming bootcamp focused on competitive programming, algorithms, and data structures.",
            "description_tr": "Rekabetçi programlama, algoritma ve veri yapıları odaklı ulusal çapta bir programlama kampını yönettim.",
        },
        {
            "title_en": "Environmental Volunteer",
            "title_tr": "Çevre Gönüllüsü",
            "organization_en": "TEMA Foundation & WWF Türkiye",
            "organization_tr": "TEMA Vakfı ve WWF Türkiye",
            "location_en": "Turkey",
            "location_tr": "Türkiye",
            "experience_type": "volunteer",
            "start_date": date(2022, 1, 1),
            "end_date": None,
            "is_current": True,
            "description_en": "Participates in reforestation, environmental protection, and wildlife awareness initiatives.",
            "description_tr": "Ağaçlandırma, çevre koruma ve yaban hayatı farkındalığı çalışmalarına gönüllü destek veriyorum.",
        },
        {
            "title_en": "Software Lead",
            "title_tr": "Yazılım Takım Lideri",
            "organization_en": "Teknofest Sarkan UAV Defense Platform",
            "organization_tr": "Teknofest Sarkan İHA Savunma Platformu",
            "location_en": "Turkey",
            "location_tr": "Türkiye",
            "experience_type": "activity",
            "start_date": date(2024, 5, 1),
            "end_date": date(2025, 5, 1),
            "is_current": False,
            "description_en": "Led anti-jamming telemetry software and team coordination. Project ranked 3rd among 700+ proposals in preliminary evaluation.",
            "description_tr": "Karıştırma önleme telemetri yazılımına ve ekip koordinasyonuna liderlik ettim. Proje ön değerlendirmede 700'den fazla başvuru arasında üçüncü oldu.",
        },
        {
            "title_en": "FRC Houston World Championship Finalist",
            "title_tr": "FRC Houston Dünya Şampiyonası Finalisti",
            "organization_en": "FIRST Robotics Competition - Team 7840 EMONER",
            "organization_tr": "FIRST Robotics Competition - Team 7840 EMONER",
            "location_en": "Houston, USA",
            "location_tr": "Houston, ABD",
            "experience_type": "activity",
            "start_date": date(2019, 4, 1),
            "end_date": date(2019, 4, 30),
            "is_current": False,
            "description_en": "Reached world championship finals with Team 7840 and gained competitive robotics experience.",
            "description_tr": "Team 7840 ile dünya şampiyonası finallerine katılarak rekabetçi robotik deneyimi kazandım.",
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
            "title_en": "IşıkSchedule Platform",
            "title_tr": "IşıkSchedule Platformu",
            "short_en": "Independent desktop and web scheduling products for Işık University catalogs",
            "short_tr": "Işık Üniversitesi katalogları için bağımsız masaüstü ve web ders programı oluşturma ürünleri",
            "description_en": (
                "The portfolio tracks multiple independent scheduling codebases rather than a shared solver package: "
                "the PyQt6 desktop client has a verified 13-solver registry, while the FastAPI + Next.js web product "
                "uses its own synchronous exact search and SQLite persistence. The public web repository also contains "
                "JWT/admin controls, Excel catalog ingestion, and shareable schedule flows."
            ),
            "description_tr": (
                "Portföyde ortak bir çözücü paketi olarak değil, bağımsız ders programlama kod tabanları olarak izlenir: "
                "PyQt6 masaüstü istemcisinde doğrulanmış 13 çözücü kayıtlıdır; FastAPI + Next.js web ürünü ise "
                "kendi senkron kesin aramasını ve SQLite kalıcılığını kullanır. Web deposunda ayrıca JWT/yönetici kontrolleri, "
                "Excel katalog alımı ve paylaşılabilir program akışları bulunur."
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
            "short_en": "Safety-oriented Agentic IDE thesis planning and requirements repository",
            "short_tr": "Güvenlik odaklı Agentic IDE tez planlama ve gereksinim deposu",
            "description_en": (
                "A thesis planning repository, not a shipped IDE implementation. Its accepted ADRs and backlog define "
                "an Electron + Monaco MVP, a single-agent plan-first approval loop, local retrieval, explicit model "
                "selection, workspace-bound writes, rollback, audit events, and a 20-task evaluation target."
            ),
            "description_tr": (
                "Henüz dağıtılmış bir IDE uygulaması değil, tez planlama deposudur. Kabul edilmiş ADR'leri ve iş listesini; "
                "Electron + Monaco MVP'sini, tek ajanlı plan-önce/onaylı akışı, yerel bilgi erişimini, açık model seçimini, "
                "çalışma alanı sınırlarını, geri almayı, denetim olaylarını ve 20 görevlik değerlendirme hedefini tanımlar."
            ),
            "github_url": "https://github.com/TurkishKEBAB/Agentic-Ide",
            "demo_url": None,
            "featured": True,
            "display_order": 2,
        },
        {
            "slug": "teknofest-sarkan-uav-defense-platform",
            "title_en": "Teknofest Sarkan UAV Defense Platform",
            "title_tr": "Teknofest Sarkan İHA Savunma Platformu",
            "short_en": "Project record pending technical source and publication clearance",
            "short_tr": "Teknik kaynak ve yayın izni bekleyen proje kaydı",
            "description_en": (
                "The portfolio record is retained, but no source repository or publishable technical report was found "
                "in the audited workspaces. Architecture, performance, ranking, budget, and gallery claims remain pending "
                "owner-provided evidence and publication clearance."
            ),
            "description_tr": (
                "Portföy kaydı korunmuştur; ancak denetlenen çalışma alanlarında kaynak repo veya yayınlanabilir teknik rapor "
                "bulunamadı. Mimari, performans, derece, bütçe ve galeri iddiaları sahibinden kanıt ve yayın izni gelene kadar beklemededir."
            ),
            "github_url": None,
            "demo_url": None,
            "featured": True,
            "display_order": 3,
        },
        {
            "slug": "automated-web-crawler",
            "title_en": "Automated Web Crawler",
            "title_tr": "Otomatik Web Tarayıcısı",
            "short_en": "Project record pending crawler source and benchmark evidence",
            "short_tr": "Tarayıcı kaynağı ve karşılaştırma kanıtı bekleyen proje kaydı",
            "description_en": (
                "No crawler repository, archive, runnable benchmark, or operational screenshot was found in the audited "
                "workspaces. Scrapy, FastAPI, PostgreSQL, worker count, retry policy, robots enforcement, and success-rate "
                "claims are therefore not published as verified project architecture."
            ),
            "description_tr": (
                "Denetlenen çalışma alanlarında tarayıcı deposu, arşivi, çalıştırılabilir karşılaştırması veya operasyon ekranı "
                "bulunamadı. Bu nedenle Scrapy, FastAPI, PostgreSQL, işçi sayısı, yeniden deneme politikası, robots uygulaması ve "
                "başarı oranı iddiaları doğrulanmış proje mimarisi olarak yayınlanmıyor."
            ),
            "github_url": None,
            "demo_url": None,
            "featured": True,
            "display_order": 4,
        },
        {
            "slug": "portfolio-platform-web-desktop",
            "title_en": "Portfolio Platform (Web + Desktop)",
            "title_tr": "Portfolyo Platformu (Web + Masaüstü)",
            "short_en": "Full-stack multi-platform portfolio with admin operations and CI/CD",
            "short_tr": "Yönetici operasyonları ve CI/CD içeren tam kapsamlı çok platformlu portfolyo sistemi",
            "description_en": (
                "Multi-platform system with 72 API endpoints, JWT/RBAC auth, 24h GitHub API caching "
                "with in-memory fallback, Supabase asset operations, SMTP notifications, and independent "
                "Vercel (frontend) and Railway (backend) deployments via each provider's GitHub integration."
            ),
            "description_tr": (
                "72 API uç noktası, JWT/RBAC kimlik doğrulama, bellek yedeklemeli 24 saatlik GitHub API önbelleği, "
                "Supabase varlık yönetimi, SMTP bildirimleri ve her sağlayıcının GitHub entegrasyonu üzerinden "
                "bağımsız Vercel (ön yüz) ve Railway (arka uç) dağıtımlarını içeren çok platformlu sistem."
            ),
            "github_url": "https://github.com/TurkishKEBAB/Site",
            "demo_url": None,
            "featured": True,
            "display_order": 5,
        },
        {
            "slug": "ramazan-kopru-academic-site",
            "title_en": "Ramazan Kopru Academic Site",
            "title_tr": "Ramazan Köprü Akademik Sitesi",
            "short_en": "Next.js academic publishing site with MDX content and admin routes",
            "short_tr": "MDX içeriği ve yönetici rotaları olan Next.js akademik yayın sitesi",
            "description_en": "A source-backed Next.js 14 App Router academic site with TypeScript, Tailwind CSS, MDX longform content, JSON-managed academic records, and admin route handlers.",
            "description_tr": "TypeScript, Tailwind CSS, MDX, JSON akademik kayıtlar ve yönetici rota işleyicileri kullanan kaynak destekli Next.js 14 akademik sitesi.",
            "github_url": "https://github.com/TurkishKEBAB/RamazanKopru",
            "demo_url": None,
            "featured": False,
            "display_order": 6,
        },
        {
            "slug": "travel-planner-platform",
            "title_en": "Rovera Travel Planner",
            "title_tr": "Rovera Seyahat Planlayıcısı",
            "short_en": "Split React travel planner with Express authentication and MySQL persistence",
            "short_tr": "Express kimlik doğrulamalı ve MySQL kalıcılıklı React seyahat planlayıcısı",
            "description_en": "A source-backed Vite + React 19 frontend and Express 5 backend with TanStack Router, HeroUI, Leaflet, JWT, bcrypt, MySQL, and multer avatar uploads.",
            "description_tr": "TanStack Router, HeroUI, Leaflet, JWT, bcrypt, MySQL ve multer avatar yüklemeleri kullanan Vite + React 19 ön yüzü ve Express 5 arka ucu projesi.",
            "github_url": "https://github.com/Soft3112-TravelPlanner/travel-planner",
            "demo_url": None,
            "featured": False,
            "display_order": 7,
        },
        {
            "slug": "turkish-morphology-fst",
            "title_en": "Turkish Morphological Analyzer (HFST)",
            "title_tr": "Türkçe Morfolojik Analizörü (HFST)",
            "short_en": "HFST morphology specification with lexicon, rule, and derivation diagrams",
            "short_tr": "Sözlük, kural ve türetim diyagramlarıyla HFST morfoloji spesifikasyonu",
            "description_en": "A research/specification repository documenting lexicon, morphotactics, phonology, derivation, and a compiled-analyzer target without claiming a shipped HFST artifact.",
            "description_tr": "Sözlük, morfotaktik, fonoloji ve türetim katmanlarını belgeleyen, yayımlanmış HFST artefaktı iddiası yapmayan araştırma ve spesifikasyon deposu.",
            "github_url": "https://github.com/TurkishKEBAB/turkish-morphology-fst",
            "demo_url": None,
            "featured": False,
            "display_order": 8,
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


def link_project_technologies(
    db: Session, tech_map: Dict[str, str], projects: List[Project]
) -> None:
    """Connect projects to technologies."""
    print("Linking project technologies...")
    mapping = {
        "isikschedule-platform": [
            "Python",
            "TypeScript",
            "FastAPI",
            "Next.js",
            "SQLite",
            "PyQt6",
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
            # No technical source was available during the evidence audit.
        ],
        "automated-web-crawler": [
            # No crawler source or benchmark was available during the evidence audit.
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
        "ramazan-kopru-academic-site": [
            "TypeScript",
            "Next.js",
            "React",
            "Tailwind CSS",
            "MDX",
            "GitHub Actions",
        ],
        "travel-planner-platform": [
            "TypeScript",
            "React",
            "JavaScript",
            "SQL",
            "JWT",
            "MySQL",
            "Leaflet",
        ],
        "turkish-morphology-fst": ["Git", "HFST"],
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
        {
            "key": "site_title",
            "value": "Yigit Okur | Software Engineer · Cloud & DevOps",
            "description": "SEO title",
        },
        {
            "key": "site_description",
            "value": "Software Engineering student focused on enterprise backend systems, cloud-native architecture, and DevOps automation.",
            "description": "SEO description",
        },
        {
            "key": "contact_email",
            "value": "yigitokur@ieee.org",
            "description": "Primary contact",
        },
        {
            "key": "github_url",
            "value": "https://github.com/TurkishKEBAB",
            "description": "GitHub profile",
        },
        {
            "key": "linkedin_url",
            "value": "https://www.linkedin.com/in/yigit-okur-050b5b278",
            "description": "LinkedIn profile",
        },
        {
            "key": "meta_keywords",
            "value": "Yigit Okur, Software Engineer, Cloud, DevOps, Spring Boot, FastAPI, React, Portfolio",
            "description": "SEO keywords",
        },
        {
            "key": "maintenance_mode",
            "value": "false",
            "description": "Maintenance flag",
        },
    ]
    for item in config_data:
        db.add(
            SiteConfig(
                key=item["key"], value=item["value"], description=item["description"]
            )
        )
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
        ("tr", "nav_about", "Hakkımda"),
        ("tr", "nav_projects", "Projeler"),
        ("tr", "nav_blog", "Blog"),
        ("tr", "nav_contact", "İletişim"),
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
            "title_tr": "Kurumsal Mikroservislerde Sessiz Bir Saat Dilimi Hatasını Ayıklamak",
            "excerpt_tr": "YAML ve ELK izleriyle v1/v2 saat dilimi uyuşmazlığını saptamaya dair kısa bir vaka çalışması.",
            "content_tr": (
                "NETAS'taki stajım sırasında UTC ve UTC+3 yapılandırmaları arasındaki sessiz tarih sınırı "
                "uyuşmazlığını inceledim. Sorun istemci tarafı doğrulamasıyla yakalanmıyordu. Hedefli loglar "
                "üzerinden hatayı yeniden ürettim ve regresyonları belgelemek ve önlemek için 600'den fazla "
                "satırdan oluşan bir test matrisi uyguladım."
            ),
            "reading_time": 5,
        },
        {
            "slug": "building-constraint-aware-schedulers",
            "title": "Building Constraint-Aware Schedulers Across Desktop and Web",
            "excerpt": "Notes from IşıkSchedule architecture decisions and algorithmic tradeoffs.",
            "content": (
                "IşıkSchedule combines hard constraints and preference optimization with a set of heuristic and "
                "metaheuristic algorithms. This post summarizes architecture choices that made desktop and web "
                "versions share the same core domain logic."
            ),
            "title_tr": "Masaüstü ve Web'de Kısıt Farkındalıklı Ders Programı Oluşturucular Geliştirmek",
            "excerpt_tr": "IşıkSchedule mimari kararları ve algoritmik ödünleşimler üzerine notlar.",
            "content_tr": (
                "IşıkSchedule, sert kısıtları tercih optimizasyonuyla bir dizi buluşsal ve meta-sezgisel "
                "algoritmayla birleştiriyor. Bu yazı, masaüstü ve web sürümlerinin aynı temel alan mantığını "
                "paylaşmasını sağlayan mimari tercihleri özetliyor."
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
                title=item["title_tr"],
                content=item["content_tr"],
                excerpt=item["excerpt_tr"],
            )
        )
    db.commit()
    print(f"Added {len(posts)} blog posts")


def clear_existing_data(db: Session) -> None:
    """Clear all mutable data in dependency-safe order."""
    print("Clearing existing data...")
    models_in_order = [
        AdminActionLog,
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
