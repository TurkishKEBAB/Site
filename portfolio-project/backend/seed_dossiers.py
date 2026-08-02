"""
Seed project dossiers (C4 / ADR / log / diagrams / gallery).

Seed content is evidence-led and loads through crud.dossier.upsert_dossier, so
it is idempotent per project; existing dossiers are skipped unless --force.
The dossier map is intentionally limited to projects with a verified source
package or a first-party evidence ledger. The project catalog map also carries
pending cards so --sync can repair their metadata without inventing a dossier.

Usage (inside the backend container or with DATABASE_URL exported):
    python seed_dossiers.py           # seed projects that have no dossier yet
    python seed_dossiers.py --force   # overwrite existing dossiers too
    python seed_dossiers.py --sync    # apply the current source revision once

Gallery images are referenced as /projects/* and must exist in
frontend/public/projects/ to render; missing files only affect the gallery.

Research-backed payloads that must be available to the seed image live in
backend/dossier_payloads/ and are loaded by project slug below.
"""

import json
import sys
from pathlib import Path

from sqlalchemy.orm import Session

from app.crud.dossier import delete_dossier, get_dossier_by_project_id, upsert_dossier
from app.crud.site import get_site_config, set_site_config
from app.database import SessionLocal
from app.models.project import Project, ProjectTechnology, ProjectTranslation
from app.models.technology import Technology
from app.schemas.dossier import ProjectDossierUpsert

DOSSIER_SEED_REVISION_KEY = "dossier_seed_revision"
DOSSIER_SEED_REVISION = "2026-08-02-localization-audit-v1"
DOSSIER_REMOVED_SLUGS = (
    "teknofest-sarkan-uav-defense-platform",
    "automated-web-crawler",
)

PROJECT_CATALOG_CONTENT: dict[str, dict] = {
    "isikschedule-platform": {
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
        "technologies": [
            "Python",
            "TypeScript",
            "FastAPI",
            "Next.js",
            "SQLite",
            "PyQt6",
            "JWT",
            "RBAC",
        ],
    },
    "agentic-ide-thesis-project": {
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
        "technologies": [
            "TypeScript",
            "Electron",
            "Monaco Editor",
            "LLMs",
            "RAG",
            "GitHub Actions",
        ],
    },
    "teknofest-sarkan-uav-defense-platform": {
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
            "bulunamadı. Mimari, performans, derece, bütçe ve galeri iddiaları sahibinden kanıt ve yayın izni gelene kadar "
            "beklemededir."
        ),
        "github_url": None,
        "demo_url": None,
        "featured": True,
        "display_order": 3,
        "technologies": [],
    },
    "automated-web-crawler": {
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
        "technologies": [],
    },
    "portfolio-platform-web-desktop": {
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
        "technologies": [
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
    },
    "ramazan-kopru-academic-site": {
        "title_en": "Ramazan Kopru Academic Site",
        "title_tr": "Ramazan Köprü Akademik Sitesi",
        "short_en": "Next.js academic publishing site with MDX content and admin routes",
        "short_tr": "MDX içeriği ve yönetici rotaları olan Next.js akademik yayın sitesi",
        "description_en": (
            "A source-backed academic website built with Next.js 14 App Router, TypeScript, "
            "Tailwind CSS, MDX longform content, JSON-managed academic records, and "
            "route handlers for administrative content operations."
        ),
        "description_tr": (
            "Next.js 14 App Router, TypeScript, Tailwind CSS, uzun MDX içeriği, JSON tabanlı "
            "akademik kayıtlar ve yönetim işlemleri için rota işleyicileri kullanan akademik site."
        ),
        "github_url": "https://github.com/TurkishKEBAB/RamazanKopru",
        "demo_url": None,
        "featured": False,
        "display_order": 6,
        "technologies": [
            "TypeScript",
            "Next.js",
            "React",
            "Tailwind CSS",
            "MDX",
            "GitHub Actions",
        ],
    },
    "travel-planner-platform": {
        "title_en": "Rovera Travel Planner",
        "title_tr": "Rovera Seyahat Planlayıcısı",
        "short_en": "Split React travel planner with Express authentication and MySQL persistence",
        "short_tr": "Express kimlik doğrulamalı ve MySQL kalıcılıklı React seyahat planlayıcısı",
        "description_en": (
            "A source-backed two-runtime student project: a Vite + React 19 frontend with "
            "TanStack Router, HeroUI, Tailwind CSS, Leaflet, trips, favorites, budget, and "
            "profile routes; plus an Express 5 backend with JWT authentication, bcrypt, "
            "MySQL access, and multer avatar uploads."
        ),
        "description_tr": (
            "Vite + React 19 ön yüzü ve Express 5 arka ucu olarak ayrılan öğrenci projesi. "
            "Ön yüz TanStack Router, HeroUI, Tailwind CSS, Leaflet ve seyahat rotaları; "
            "arka uç JWT, bcrypt, MySQL ve multer avatar yüklemeleri içerir."
        ),
        "github_url": "https://github.com/Soft3112-TravelPlanner/travel-planner",
        "demo_url": None,
        "featured": False,
        "display_order": 7,
        "technologies": ["TypeScript", "React", "JavaScript", "SQL", "JWT", "MySQL", "Leaflet"],
    },
    "turkish-morphology-fst": {
        "title_en": "Turkish Morphological Analyzer (HFST)",
        "title_tr": "Türkçe Morfolojik Analizörü (HFST)",
        "short_en": "HFST morphology specification with lexicon, rule, and derivation diagrams",
        "short_tr": "Sözlük, kural ve türetim diyagramlarıyla HFST morfoloji spesifikasyonu",
        "description_en": (
            "A research/specification repository for a Turkish morphological analyzer. Its "
            "README and diagrams define lexicon, morphotactics, phonology, derivation, and "
            "a compiled-analyzer target; the audited workspace does not contain a compiled "
            "HFST artifact, so this record does not present a shipped runtime."
        ),
        "description_tr": (
            "Türkçe morfolojik analizörü için araştırma ve spesifikasyon deposu. README ve "
            "diyagramlar sözlük, morfotaktik, fonoloji, türetim ve derlenmiş analizör hedefini "
            "tanımlar; denetlenen çalışma alanı derlenmiş HFST artefaktı içermediği için çalışan "
            "bir çalışma zamanı iddiası yapılmaz."
        ),
        "github_url": "https://github.com/TurkishKEBAB/turkish-morphology-fst",
        "demo_url": None,
        "featured": False,
        "display_order": 8,
        "technologies": ["Git", "HFST"],
    },
}

# Active dossier payloads are source-backed. Projects without source or approved evidence remain cards only.
DOSSIER_CONTENT: dict[str, dict] = {
    "portfolio-platform-web-desktop": {
        # Re-authored from first-party evidence; see
        # docs/superpowers/specs/2026-07-25-portfolio-platform-evidence-ledger.md.
        # Gallery paths below point to the real WebP captures in
        # frontend/public/projects/; no placeholder paths are used.
        "impact_en": (
            "This portfolio ships as two independently deployed tiers: a Next.js 16 "
            "App Router frontend on Vercel and a FastAPI backend (72 route handlers, "
            "JWT/RBAC) on Railway, each released through the provider's own GitHub "
            "integration rather than a CI-driven deploy. Public pages render "
            "server-side with ISR (revalidate) so a cold backend never blanks the "
            "site, and GitHub stats sit behind a 24h Redis cache that degrades to an "
            "in-process store when Redis is absent. Every push runs a 16-workflow CI "
            "wall — tests, OpenAPI-drift, CodeQL, dependency and supply-chain audits, "
            "and an enforced SonarCloud quality gate — followed by post-deploy smoke "
            "checks that curl the live site and exercise an admin API round-trip."
        ),
        "impact_tr": (
            "Bu portfolyo, birbirinden bağımsız dağıtılan iki katman olarak yayımlanır: "
            "Vercel üzerinde Next.js 16 App Router ön yüzü ve Railway üzerinde FastAPI "
            "arka ucu (72 rota işleyicisi, JWT/RBAC); her biri CI odaklı dağıtım yerine "
            "sağlayıcının kendi GitHub entegrasyonuyla yayımlanır. Herkese açık sayfalar ISR "
            "(revalidate) ile sunucuda oluşturulur, böylece arka uç hazır değilken bile site boş kalmaz; "
            "GitHub istatistikleri, Redis yoksa süreç-içi belleğe düşen 24 "
            "saatlik Redis önbelleğinin arkasındadır. Her gönderim, 16 iş akışlı bir CI "
            "duvarını (testler, OpenAPI-drift, CodeQL, bağımlılık ve tedarik zinciri "
            "denetimleri, zorunlu SonarCloud kalite kapısı) ve ardından canlı siteyi "
            "curl ile kontrol edip yönetici API gidiş-dönüşünü deneyen dağıtım sonrası "
            "duman testlerini "
            "çalıştırır."
        ),
        "metrics": [
            {"value": "72", "numeric_value": 72, "label": "API endpoints", "note": "FastAPI v1 route handlers · 12 routers", "display_order": 0},
            {"value": "24h", "numeric_value": 24, "label": "GitHub cache", "note": "Redis TTL · in-memory fallback", "display_order": 1},
            {"value": "2", "numeric_value": 2, "label": "deploy targets", "note": "Vercel FE · Railway BE (provider-native)", "display_order": 2},
            {"value": "16", "numeric_value": 16, "label": "CI/CD workflows", "note": "tests · CodeQL · audits · Sonar gate", "display_order": 3},
            {"value": "5", "numeric_value": 5, "label": "DB migrations", "note": "Alembic schema versions", "display_order": 4},
        ],
        "c4": [
            {
                "label": "Context",
                "note": "visitors, an admin, and third-party services",
                "display_order": 0,
                "tiers": [
                    [
                        {"kind": "person", "title": "Visitor", "sub": "reads the public site (EN/TR)"},
                        {"kind": "person", "title": "Admin (Yiğit)", "sub": "manages content via JWT/RBAC"},
                    ],
                    [{"kind": "system", "title": "Portfolio Platform", "sub": "public site + admin surface"}],
                    [
                        {"kind": "external", "title": "GitHub API", "sub": "repo & contribution stats", "leaf": True},
                        {"kind": "external", "title": "Supabase", "sub": "file/asset storage", "leaf": True},
                        {"kind": "external", "title": "SMTP", "sub": "contact notifications", "leaf": True},
                    ],
                ],
            },
            {
                "label": "Containers",
                "note": "two tiers, deployed independently by Vercel and Railway",
                "display_order": 1,
                "tiers": [
                    [{"kind": "client", "title": "Next.js Frontend", "sub": "Vercel · App Router · ISR"}],
                    [{"kind": "container", "title": "FastAPI Backend", "sub": "Railway · 72 endpoints · JWT/RBAC"}],
                    [
                        {"kind": "store", "title": "PostgreSQL", "sub": "content, messages & dossiers", "leaf": True},
                        {"kind": "store", "title": "Redis", "sub": "24h cache · memory fallback", "leaf": True},
                    ],
                ],
            },
        ],
        "adrs": [
            {
                "id": "ADR-001",
                "title": "Provider-native deploys over CI-driven deploys",
                "status": "Accepted",
                "date": "2026-07",
                "context": "A CI-side `vercel build --prebuilt` once raced Vercel's own integration and shipped a bundle with the localhost API fallback baked in, blanking every backend-driven section. Railway also exposes no inbound deploy hooks.",
                "decision": "Let Vercel and Railway each deploy from their own GitHub integration on push to main; CI is reduced to a quality gate plus post-deploy smoke checks, not a deployer.",
                "tradeoff": "Two dashboards and two failure domains; mitigated by independent post-deploy smoke checks (frontend curl + backend admin round-trip).",
                "display_order": 0,
            },
            {
                "id": "ADR-002",
                "title": "Redis 24h cache with in-memory fallback",
                "status": "Accepted",
                "date": "2026-07",
                "context": "GitHub rate limits made live stats flaky under traffic, and a single-replica deploy cannot assume Redis is always present.",
                "decision": "Cache GitHub responses in Redis for 24h and, on any Redis connection failure, degrade to a process-local TTL cache instead of disabling caching; serve stale data if the GitHub fetch itself errors.",
                "tradeoff": "The memory backend resets on restart/deploy; acceptable for portfolio telemetry with one replica.",
                "display_order": 1,
            },
            {
                "id": "ADR-003",
                "title": "ISR (revalidate) over no-store for public reads",
                "status": "Accepted",
                "date": "2026-07",
                "context": "Server components fetching with `no-store` aborted and blanked public pages whenever the Railway backend was cold-starting.",
                "decision": "Public server-side fetches use `next: { revalidate }` so a successful response is cached and served stale-while-revalidate; a sleeping backend no longer empties the page.",
                "tradeoff": "Public content can lag by the revalidate window; correctness of live edits is traded for resilience.",
                "display_order": 2,
            },
            {
                "id": "ADR-004",
                "title": "SonarCloud quality gate consolidated and enforced in CI",
                "status": "Accepted",
                "date": "2026-07",
                "context": "The Sonar gate previously lived in a separate, skippable workflow and could pass silently without a valid token.",
                "decision": "One CI job runs the scan with `-Dsonar.qualitygate.wait=true` and hard-fails when the token/organization is missing on trusted runs; fork and Dependabot PRs get a documented safe-skip because secrets are unavailable to them.",
                "tradeoff": "Fork PRs cannot run Sonar; covered by CodeQL, dependency, and workflow-security checks that still run.",
                "display_order": 3,
            },
        ],
        "log": [
            {"hash": "ce948d7", "date": "2026-07-25", "title": "Evidence-first dossier authoring guide", "note": "Working contract to rebuild every project dossier from first-party evidence.", "display_order": 0},
            {"hash": "21df8b1", "tag": "PR #79", "date": "2026-07-25", "title": "Public frontend performance pass", "note": "Server-rendered project index and slimmer public payloads.", "display_order": 1},
            {"hash": "3e8f028", "date": "2026-07-18", "title": "SonarCloud gate consolidated into CI", "note": "Single enforced job with qualitygate.wait=true.", "display_order": 2},
            {"hash": "707906d", "date": "2026-07-13", "title": "Project dossier API + migration", "note": "ProjectDossier aggregate exposed behind admin PUT / public GET.", "display_order": 3},
            {"hash": "905d39a", "date": "2026-04-22", "title": "Public site migrated to Next.js App Router", "display_order": 4},
            {"hash": "3d00c11", "tag": "v0.0", "date": "2025-11-02", "title": "Initial commit", "display_order": 5},
        ],
        "diagrams": [
            {
                "id": "seq-public",
                "kind": "sequence",
                "title": "Sequence — public request (ISR)",
                "note": "server components fetch with revalidate; a cold backend serves stale, not blank",
                "display_order": 0,
                "data": {
                    "actors": ["Visitor", "Next (Vercel)", "FastAPI (Railway)", "PostgreSQL"],
                    "messages": [
                        {"from": "Visitor", "to": "Next (Vercel)", "label": "GET /projects"},
                        {"from": "Next (Vercel)", "to": "Next (Vercel)", "label": "ISR cache fresh?"},
                        {"from": "Next (Vercel)", "to": "FastAPI (Railway)", "label": "miss/stale → GET /api/v1/projects"},
                        {"from": "FastAPI (Railway)", "to": "PostgreSQL", "label": "query projects"},
                        {"from": "PostgreSQL", "to": "FastAPI (Railway)", "label": "rows", "kind": "return"},
                        {"from": "FastAPI (Railway)", "to": "Next (Vercel)", "label": "200 · projects", "kind": "return"},
                        {"from": "Next (Vercel)", "to": "Visitor", "label": "SSR HTML + hydrate", "kind": "return"},
                    ],
                },
            },
            {
                "id": "seq-github",
                "kind": "sequence",
                "title": "Sequence — GitHub stats cache",
                "note": "24h Redis cache shields the rate limit; stale served on fetch error",
                "display_order": 1,
                "data": {
                    "actors": ["Visitor", "Next", "FastAPI", "Redis", "GitHub API"],
                    "messages": [
                        {"from": "Visitor", "to": "Next", "label": "view Command Center"},
                        {"from": "Next", "to": "FastAPI", "label": "GET /api/v1/github/stats"},
                        {"from": "FastAPI", "to": "Redis", "label": "get github_stats"},
                        {"from": "Redis", "to": "FastAPI", "label": "hit (≤24h) → stats", "kind": "return"},
                        {"from": "FastAPI", "to": "GitHub API", "label": "miss → GraphQL fetch"},
                        {"from": "GitHub API", "to": "FastAPI", "label": "aggregate stats", "kind": "return"},
                        {"from": "FastAPI", "to": "Redis", "label": "setex 24h"},
                        {"from": "FastAPI", "to": "Next", "label": "200 · stats", "kind": "return"},
                    ],
                },
            },
            {
                "id": "authz",
                "kind": "matrix",
                "title": "Authorization Matrix",
                "note": "JWT/RBAC — require_admin on every mutating route",
                "display_order": 2,
                "data": {
                    "cols": ["visitor", "admin"],
                    "rows": [
                        {"label": "view site, projects & dossiers", "cells": ["✓", "✓"]},
                        {"label": "send contact message", "cells": ["✓", "✓"]},
                        {"label": "CRUD projects / skills / blog", "cells": ["—", "✓"]},
                        {"label": "PUT / DELETE project dossier", "cells": ["—", "✓"]},
                        {"label": "read messages inbox", "cells": ["—", "✓"]},
                        {"label": "upload assets (Supabase)", "cells": ["—", "✓"]},
                        {"label": "view admin stats & audit log", "cells": ["—", "✓"]},
                    ],
                },
            },
            {
                "id": "cicd-pf",
                "kind": "tiers",
                "title": "CI/CD — gate + provider deploys",
                "note": "CI is the quality gate and smoke checker, not the deployer",
                "display_order": 3,
                "data": {
                    "tiers": [
                        [{"kind": "start", "title": "push → main"}],
                        [{"kind": "step", "title": "CI quality wall", "sub": "flake8 · pytest · OpenAPI-drift · type-check · builds"}],
                        [{"kind": "decision", "title": "SonarCloud gate?", "sub": "qualitygate.wait=true"}],
                        [
                            {"kind": "step", "title": "Providers deploy", "sub": "Vercel + Railway native integrations", "via": "pass"},
                            {"kind": "error", "title": "blocked", "sub": "gate fails · PR annotated", "via": "fail"},
                        ],
                        [{"kind": "step", "title": "Railway release", "sub": "alembic upgrade head → uvicorn"}],
                        [{"kind": "step", "title": "Post-deploy smoke", "sub": "FE curl · BE admin login → /admin/stats"}],
                        [{"kind": "end", "title": "live"}],
                    ],
                    "notes": ["Vercel/Railway deploy on push independently of CI; the gate and smoke checks run alongside, not as a deploy step."],
                },
            },
            {
                "id": "flow-dossier",
                "kind": "tiers",
                "title": "Flow — dossier render",
                "note": "project selection → dossier API → renderer → gallery",
                "display_order": 4,
                "data": {
                    "tiers": [
                        [{"kind": "start", "title": "select project", "sub": "ProjectIndex"}],
                        [{"kind": "step", "title": "GET /dossiers/{slug}", "sub": "on-demand · cache 60s SWR 300s"}],
                        [{"kind": "decision", "title": "dossier found?"}],
                        [
                            {"kind": "step", "title": "map + synthesize C4", "sub": "toProjectDetail prepends c4 chip", "via": "200"},
                            {"kind": "error", "title": "dossier unavailable", "sub": "retry button", "via": "404 / error"},
                        ],
                        [{"kind": "step", "title": "render tabs", "sub": "overview · arch · adr · log · gallery"}],
                        [{"kind": "end", "title": "DiagramGallery + gallery"}],
                    ],
                    "notes": ["arch tab shows the synthesized C4 chip plus every diagram; gallery figures read /public/projects paths"],
                },
            },
            {
                "id": "erd",
                "kind": "schema",
                "title": "ERD — dossier data model",
                "note": "one dossier per project; children cascade on delete",
                "display_order": 5,
                "data": {
                    "tiers": [
                        [{"name": "projects", "kind": "table", "rows": ["id · pk", "slug · uniq", "title", "featured"]}],
                        [{"name": "project_dossiers", "kind": "table", "rows": ["id · pk", "project_id · fk · uniq", "impact_en", "impact_tr"]}],
                        [
                            {"name": "dossier_metrics", "kind": "table", "rows": ["value", "numeric_value", "label", "display_order"]},
                            {"name": "dossier_c4_levels", "kind": "table", "rows": ["label", "note", "display_order"]},
                            {"name": "dossier_adrs", "kind": "table", "rows": ["identifier", "status", "context", "decision"]},
                        ],
                        [
                            {"name": "dossier_c4_nodes", "kind": "table", "rows": ["level_id · fk", "kind", "title", "tier_order"]},
                            {"name": "dossier_log_entries", "kind": "table", "rows": ["commit_hash", "tag", "date", "title"]},
                            {"name": "dossier_diagrams", "kind": "table", "rows": ["identifier", "kind", "data · JSON"]},
                            {"name": "dossier_gallery_items", "kind": "table", "rows": ["identifier", "source_url", "caption"]},
                        ],
                    ],
                    "relations": [
                        {"from": "projects", "label": "1:1", "to": "project_dossiers"},
                        {"from": "project_dossiers", "label": "1:N", "to": "dossier_metrics"},
                        {"from": "project_dossiers", "label": "1:N", "to": "dossier_c4_levels"},
                        {"from": "dossier_c4_levels", "label": "1:N", "to": "dossier_c4_nodes"},
                        {"from": "project_dossiers", "label": "1:N", "to": "dossier_adrs"},
                        {"from": "project_dossiers", "label": "1:N", "to": "dossier_diagrams"},
                        {"from": "project_dossiers", "label": "1:N", "to": "dossier_gallery_items"},
                    ],
                },
            },
        ],
        "gallery": [
            {"id": "pf-home", "src": "/projects/portfolio-platform-web-desktop-home.webp", "caption": "fig 01 — public home · server-rendered system profile & command center", "display_order": 0},
            {"id": "pf-projects", "src": "/projects/portfolio-platform-web-desktop-projects.webp", "caption": "fig 02 — project index · each entry opens a full dossier", "display_order": 1},
            {"id": "pf-dossier-arch", "src": "/projects/portfolio-platform-web-desktop-dossier-arch.webp", "caption": "fig 03 — dossier · interactive C4 (context → containers)", "display_order": 2},
            {"id": "pf-dossier-cicd", "src": "/projects/portfolio-platform-web-desktop-dossier-cicd.webp", "caption": "fig 04 — dossier · CI/CD gate + provider-native deploys", "display_order": 3},
            {"id": "pf-admin-dossier", "src": "/projects/portfolio-platform-web-desktop-admin-dossier.webp", "caption": "fig 05 — admin dossier editor · JWT/RBAC PUT round-trip", "display_order": 4},
            {"id": "pf-home-mobile", "src": "/projects/portfolio-platform-web-desktop-home-mobile.webp", "caption": "fig 06 — responsive mobile layout (390px)", "display_order": 5},
        ],
    },
}

def _load_external_dossier_payloads() -> None:
    payload_root = Path(__file__).resolve().parent / "dossier_payloads"
    for slug in (
        "isikschedule-platform",
        *PROJECT_CATALOG_CONTENT,
    ):
        payload_path = payload_root / f"{slug}.json"
        if not payload_path.is_file():
            continue
        DOSSIER_CONTENT[slug] = json.loads(payload_path.read_text(encoding="utf-8"))


_load_external_dossier_payloads()

# These two records have no source repository, technical archive, or approved
# visual evidence in the audited workspaces. Keep the project cards visible,
# but do not publish the old marketing dossier as if it described a verified
# implementation. A pending-source report lives under docs/dossiers/.
for _pending_slug in (
    "teknofest-sarkan-uav-defense-platform",
    "automated-web-crawler",
):
    DOSSIER_CONTENT.pop(_pending_slug, None)

# Agentic-Ide is a real repository, but it is currently a planning/readiness
# project. Its dossier describes accepted design decisions and repository
# evidence; it does not present the proposed Electron application as shipped.
DOSSIER_CONTENT["agentic-ide-thesis-project"] = {
    "impact_en": (
        "Agentic IDE is a safety-oriented graduation-thesis repository, not a shipped IDE. "
        "It turns the problem of unsafe, opaque multi-file AI edits into a measurable plan-first "
        "workflow: a single agent observes context, proposes a change, passes policy checks, "
        "waits for human approval, and only then writes within a workspace boundary. The repository "
        "supports this direction with 9 ADRs, 57 non-epic backlog issues, 5 MVP scenarios, and a "
        "planned 20-task evaluation target; implementation results are not claimed yet."
    ),
    "impact_tr": (
        "Agentic IDE, dağıtılmış bir IDE değil; güvenlik odaklı bitirme tezi planlama deposudur. "
        "Güvensiz ve opak çok dosyalı yapay zekâ değişikliklerini ölçülebilir bir plan-önce iş akışına dönüştürür: "
        "tek ajan bağlamı gözlemler, değişiklik önerir, politika kontrollerinden geçer, insan onayı bekler "
        "ve ancak bundan sonra çalışma alanı sınırları içinde yazar. Depo bu yönü 9 ADR, 57 epik dışı iş listesi "
        "girdisi, 5 MVP senaryosu ve planlanan 20 görevlik değerlendirme hedefiyle destekliyor; henüz "
        "uygulama sonucu iddia edilmiyor."
    ),
    "metrics": [
        {"value": "9", "numeric_value": 9, "label": "accepted ADRs", "note": "docs/adr/ADR-001..009; planning evidence, not runtime features", "display_order": 0},
        {"value": "57", "numeric_value": 57, "label": "non-epic backlog issues", "note": "github-projects/requirements-analysis.json; 69 total items including 12 epics", "display_order": 1},
        {"value": "5", "numeric_value": 5, "label": "MVP scenarios", "note": "PRODUCT_PLAN.md; planned evaluation surface", "display_order": 2},
        {"value": "20", "numeric_value": 20, "label": "benchmark target", "note": "planned task set in PRODUCT_PLAN.md and EVALUATION_PLAN.md; not yet executed", "display_order": 3},
    ],
    "c4": [
        {
            "label": "Context",
            "note": "Repository-defined thesis scope; no production implementation is present.",
            "display_order": 0,
            "tiers": [
                [{"kind": "person", "title": "Developer", "sub": "requests, reviews, approves or rejects changes"}],
                [{"kind": "system", "title": "Agentic IDE thesis artifact", "sub": "planned safety-oriented coding workflow"}],
                [
                    {"kind": "external", "title": "Local workspace", "sub": "files and project context inside a bounded directory", "leaf": True},
                    {"kind": "external", "title": "Local model path", "sub": "Ollama-compatible provider boundary", "leaf": True},
                    {"kind": "external", "title": "Cloud model path", "sub": "Anthropic-compatible provider boundary", "leaf": True},
                ],
            ],
        },
        {
            "label": "Planned MVP containers",
            "note": "Architecture recorded in ADRs and system plans; these are design boundaries, not shipped services.",
            "display_order": 1,
            "tiers": [
                [{"kind": "client", "title": "Electron + Monaco shell", "sub": "editor and diff surface; ADR-001"}],
                [{"kind": "container", "title": "Single-agent orchestrator", "sub": "observe → plan → approval-gated apply"}],
                [
                    {"kind": "component", "title": "Context and retrieval", "sub": "layered retrieval with SQLite + sqlite-vec candidate"},
                    {"kind": "component", "title": "Model provider boundary", "sub": "manual local/cloud selection; ADR-004/005"},
                ],
                [
                    {"kind": "component", "title": "Safety and write boundary", "sub": "path normalization, protected files, approval, rollback"},
                    {"kind": "store", "title": "Audit and benchmark artifacts", "sub": "versioned evidence contracts; planned persistence", "leaf": True},
                ],
            ],
        },
    ],
    "adrs": [
        {
            "id": "ADR-001",
            "title": "Electron + Monaco editor shell",
            "status": "Accepted",
            "date": "2026-05-01",
            "context": "The thesis needs a desktop coding surface with local file access, diff review, and a TypeScript ecosystem without inheriting the full VS Code maintenance surface.",
            "decision": "Use Electron with Monaco Editor for the MVP shell; keep the application structure minimal until implementation and evaluation begin.",
            "tradeoff": "Higher memory and bundle cost than Tauri or a browser app; renderer/main-process security boundaries become a first-class risk.",
            "display_order": 0,
        },
        {
            "id": "ADR-003",
            "title": "Local retrieval storage",
            "status": "Accepted",
            "date": "2026-05-01",
            "context": "Codebase Q&A and evidence-backed planning need local-first storage without requiring a hosted vector database.",
            "decision": "Use SQLite for local metadata and keep sqlite-vec behind a small ContextStore-style adapter candidate.",
            "tradeoff": "Portable privacy boundary is gained, but sqlite-vec maturity and multilingual retrieval remain implementation risks.",
            "display_order": 1,
        },
        {
            "id": "ADR-004",
            "title": "Manual model selection for MVP",
            "status": "Accepted",
            "date": "2026-05-01",
            "context": "Automatic routing would add another evaluation variable and could surprise users by changing privacy, cost, or latency characteristics.",
            "decision": "Let the user choose local-only, manual hybrid, or cloud-only behavior; do not add an opaque automatic router to the MVP.",
            "tradeoff": "The user carries provider-selection friction, while benchmark runs remain explainable and comparable.",
            "display_order": 2,
        },
        {
            "id": "ADR-006",
            "title": "No shell execution in the MVP",
            "status": "Accepted",
            "date": "2026-05-01",
            "context": "Terminal and arbitrary process execution would expand the safety problem beyond the thesis variable of controlled, approval-gated file changes.",
            "decision": "Limit the MVP tool surface to controlled reads, retrieval, diff generation, approval-gated writes, rollback, and explanation.",
            "tradeoff": "The agent cannot run tests or package commands automatically; a future command runner needs its own ADR and threat model.",
            "display_order": 3,
        },
    ],
    "log": [
        {"hash": "caa3376", "date": "2026-05-02", "title": "Thesis backlog governance automation", "note": "Added validation and setup automation around the requirements project seed.", "display_order": 0},
        {"hash": "da4af95", "date": "2026-05-01", "title": "Readiness validation and VDD planning", "note": "Added implementation-readiness gates, ADRs, schemas, and verification-driven planning.", "display_order": 1},
        {"hash": "cbe238d", "date": "2026-04-27", "title": "Repository governance and project seed", "note": "Introduced the structured GitHub Project requirements seed and repository automation.", "display_order": 2},
        {"hash": "ac75994", "date": "2026-03-10", "title": "Product and system planning completed", "note": "Established the research question, MVP boundary, agent loop, safety model, and evaluation plan.", "display_order": 3},
        {"hash": "e6da815", "date": "2026-01-02", "title": "Initial thesis architecture and roadmap", "note": "First repository milestone; no application implementation is claimed.", "display_order": 4},
    ],
    "diagrams": [
        {
            "id": "agent-loop",
            "kind": "tiers",
            "title": "Planned flow — observe to verify",
            "note": "Design contract from SYSTEM_PLAN.md; not an executed runtime trace.",
            "display_order": 0,
            "data": {
                "tiers": [
                    [{"kind": "start", "title": "user request"}],
                    [{"kind": "step", "title": "Observe", "sub": "active file + layered retrieval"}],
                    [{"kind": "step", "title": "Plan", "sub": "files, edits, order, risks"}],
                    [{"kind": "decision", "title": "policy check passes?"}],
                    [{"kind": "step", "title": "Request approval", "sub": "diff and rationale", "via": "yes"}, {"kind": "error", "title": "Block or replan", "via": "no"}],
                    [{"kind": "decision", "title": "developer approves?"}],
                    [{"kind": "step", "title": "Atomic apply", "sub": "workspace write boundary", "via": "yes"}, {"kind": "error", "title": "Discard", "via": "no"}],
                    [{"kind": "end", "title": "verify + audit"}],
                ],
                "notes": ["Rollback is an explicit MVP requirement; shell execution is explicitly out of scope."],
            },
        },
        {
            "id": "approval-sequence",
            "kind": "sequence",
            "title": "Planned sequence — approval gate",
            "note": "Proposed interaction boundary recorded by the repository ADRs.",
            "display_order": 1,
            "data": {
                "actors": ["Developer", "Monaco UI", "Orchestrator", "Model provider", "Safety policy", "Workspace"],
                "messages": [
                    {"from": "Developer", "to": "Monaco UI", "label": "prompt + active context"},
                    {"from": "Monaco UI", "to": "Orchestrator", "label": "start run"},
                    {"from": "Orchestrator", "to": "Model provider", "label": "request plan"},
                    {"from": "Model provider", "to": "Orchestrator", "label": "plan + change-set", "kind": "return"},
                    {"from": "Orchestrator", "to": "Safety policy", "label": "validate paths, secrets, protected files"},
                    {"from": "Safety policy", "to": "Orchestrator", "label": "allow / warning / block", "kind": "return"},
                    {"from": "Orchestrator", "to": "Monaco UI", "label": "render diff for approval", "kind": "return"},
                    {"from": "Developer", "to": "Monaco UI", "label": "approve or reject"},
                    {"from": "Monaco UI", "to": "Workspace", "label": "atomic write only after approval"},
                ],
            },
        },
        {
            "id": "safety-matrix",
            "kind": "matrix",
            "title": "MVP safety boundary",
            "note": "Repository decision surface; no shell/process executor is implemented.",
            "display_order": 2,
            "data": {
                "cols": ["MVP policy", "Evidence state"],
                "rows": [
                    {"label": "Read files inside workspace", "cells": ["allowed", "planned requirement"]},
                    {"label": "Generate retrieval context and diff", "cells": ["allowed", "planned requirement"]},
                    {"label": "Write files before human approval", "cells": ["blocked", "accepted ADR-006 boundary"]},
                    {"label": "Shell / exec / package install", "cells": ["out of scope", "accepted ADR-006"]},
                    {"label": "Rollback applied change-set", "cells": ["required", "planned evaluation evidence"]},
                ],
            },
        },
        {
            "id": "design-contracts",
            "kind": "schema",
            "title": "Design contracts — evidence chain",
            "note": "JSON schemas exist in the repository; runtime persistence is not implemented.",
            "display_order": 3,
            "data": {
                "tiers": [
                    [{"name": "Requirement", "kind": "table", "rows": ["source", "acceptance criteria", "risk"]}],
                    [{"name": "Plan", "kind": "table", "rows": ["context", "files", "proposed actions"]}, {"name": "ChangeSet", "kind": "table", "rows": ["diff", "affected paths", "policy result"]}],
                    [{"name": "Approval", "kind": "table", "rows": ["decision", "timestamp", "selected changes"]}, {"name": "AuditEvent", "kind": "table", "rows": ["event", "run id", "policy version"]}],
                    [{"name": "BenchmarkRun", "kind": "table", "rows": ["condition", "task id", "evidence", "outcome"]}],
                ],
                "relations": [
                    {"from": "Requirement", "label": "1:N", "to": "Plan"},
                    {"from": "Plan", "label": "1:1", "to": "ChangeSet"},
                    {"from": "ChangeSet", "label": "1:1", "to": "Approval"},
                    {"from": "Approval", "label": "1:N", "to": "AuditEvent"},
                    {"from": "AuditEvent", "label": "N:1", "to": "BenchmarkRun"},
                ],
            },
        },
        {
            "id": "readiness-flow",
            "kind": "tiers",
            "title": "Readiness flow — planning to implementation",
            "note": "Current repository state stops before the application scaffold.",
            "display_order": 4,
            "data": {
                "tiers": [
                    [{"kind": "start", "title": "research scope"}],
                    [{"kind": "step", "title": "ADR + threat model"}],
                    [{"kind": "step", "title": "schemas + validation CI"}],
                    [{"kind": "decision", "title": "advisor/readiness gate?"}],
                    [{"kind": "step", "title": "Electron scaffold", "via": "pass"}, {"kind": "error", "title": "revise plan", "via": "fail"}],
                    [{"kind": "end", "title": "MVP implementation queue"}],
                ],
                "notes": ["Current HEAD contains the planning and governance phases; no TypeScript application files are present."],
            },
        },
    ],
    "gallery": [],
}

# The diagram data union discriminates on `kind`, which must match the outer
# diagram kind; inject it once here instead of repeating it in every literal.
for _content in DOSSIER_CONTENT.values():
    for _diagram in _content["diagrams"]:
        _diagram["data"].setdefault("kind", _diagram["kind"])


def seed_dossiers(db: Session, force: bool = False) -> None:
    """Upsert the recovered dossier content for every known project slug."""
    for slug, content in DOSSIER_CONTENT.items():
        project = db.query(Project).filter(Project.slug == slug).first()
        if project is None:
            print(f"  ! {slug}: project not found, skipped")
            continue
        if not force and get_dossier_by_project_id(db, project.id) is not None:
            print(f"  = {slug}: dossier exists, skipped (use --force to overwrite)")
            continue
        payload = ProjectDossierUpsert.model_validate(content)
        upsert_dossier(db, project.id, payload)
        print(f"  + {slug}: dossier seeded")


def sync_project_catalog(db: Session) -> None:
    """Upsert every audited project card and its evidence-backed technologies."""
    for slug, content in PROJECT_CATALOG_CONTENT.items():
        project = db.query(Project).filter(Project.slug == slug).first()
        if project is None:
            project = Project(
                slug=slug,
                title=content["title_en"],
                short_description=content["short_en"],
                description=content["description_en"],
                github_url=content["github_url"],
                demo_url=content["demo_url"],
                featured=content["featured"],
                display_order=content["display_order"],
            )
            db.add(project)
            db.flush()

        project.title = content["title_en"]
        project.short_description = content["short_en"]
        project.description = content["description_en"]
        project.github_url = content["github_url"]
        project.demo_url = content["demo_url"]
        project.featured = content["featured"]
        project.display_order = content["display_order"]

        for language, title_key, short_key, description_key in (
            ("en", "title_en", "short_en", "description_en"),
            ("tr", "title_tr", "short_tr", "description_tr"),
        ):
            translation = (
                db.query(ProjectTranslation)
                .filter_by(project_id=project.id, language=language)
                .first()
            )
            if translation is None:
                translation = ProjectTranslation(project_id=project.id, language=language)
                db.add(translation)
            translation.title = content[title_key]
            translation.short_description = content[short_key]
            translation.description = content[description_key]

        desired_technology_ids = set()
        for technology_name in content["technologies"]:
            technology = (
                db.query(Technology).filter(Technology.name == technology_name).first()
            )
            if technology is None:
                technology = Technology(
                    name=technology_name,
                    slug=technology_name.lower().replace(" ", "-").replace("/", "-"),
                    category="tool",
                )
                db.add(technology)
                db.flush()
            desired_technology_ids.add(technology.id)
            link = (
                db.query(ProjectTechnology)
                .filter_by(project_id=project.id, technology_id=technology.id)
                .first()
            )
            if link is None:
                db.add(
                    ProjectTechnology(
                        project_id=project.id,
                        technology_id=technology.id,
                    )
                )

        for link in db.query(ProjectTechnology).filter_by(project_id=project.id).all():
            if link.technology_id not in desired_technology_ids:
                db.delete(link)

    db.commit()


def sync_dossiers(db: Session) -> bool:
    """Apply the source-controlled dossier revision once per database.

    The normal seed command is intentionally non-destructive. Production needs
    a separate, revisioned operation so an already-seeded database receives
    corrected source-backed content without running the destructive full seed.
    The revision marker is written last; a failed run remains retryable.
    """
    current = get_site_config(db, DOSSIER_SEED_REVISION_KEY)
    if current and current.value == DOSSIER_SEED_REVISION:
        print(f"  = dossier revision {DOSSIER_SEED_REVISION} already applied")
        return False

    sync_project_catalog(db)
    seed_dossiers(db, force=True)
    for slug in DOSSIER_REMOVED_SLUGS:
        project = db.query(Project).filter(Project.slug == slug).first()
        if project and delete_dossier(db, project.id):
            print(f"  - {slug}: obsolete dossier removed")

    set_site_config(
        db,
        DOSSIER_SEED_REVISION_KEY,
        DOSSIER_SEED_REVISION,
        description="Source-controlled dossier payload revision applied by deployment startup.",
    )
    print(f"  + dossier revision {DOSSIER_SEED_REVISION} recorded")
    return True


def main() -> None:
    force = "--force" in sys.argv[1:]
    sync = "--sync" in sys.argv[1:]
    db = SessionLocal()
    try:
        if sync:
            print(f"Synchronizing project dossiers (revision={DOSSIER_SEED_REVISION})...")
            sync_dossiers(db)
        else:
            print(f"Seeding project dossiers (force={force})...")
            seed_dossiers(db, force=force)
        print("Done.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
