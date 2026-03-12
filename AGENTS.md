# AGENTS.md

This file provides guidance to AI agents (Claude Code, Codex, Warp, etc.) when working with code in this repository.

## Project Overview

Full-stack portfolio site for Yigit Okur (yigitokur.me). FastAPI backend + Next.js 15 App Router frontend (migration in progress from React/Vite). Repo root contains CI/CD workflows in `.github/workflows/` and a convenience `start.ps1` launcher.

**Current status:** Full refactor in progress on `feat/nextjs-rewrite`. See `REFACTOR_PLAN.md` for all architectural decisions, phase breakdown, and implementation steps. This is the single source of truth — do not rely on other historical `.md` files in `portfolio-project/`.

## Repository Structure

```
Site/
├── .github/workflows/
│   ├── ci.yml                         # PR/push quality gate (Backend Quality + Frontend Quality + Sonar)
│   ├── deploy-production.yml          # Main merge -> Railway + Vercel deploy + smoke tests
│   ├── deploy-railway-staging.yml     # Staging backend deploy
│   ├── deploy-vercel-preview.yml      # Preview frontend deploy
│   ├── sonar-pr-gate.yml              # SonarCloud PR analysis
│   └── backup-restore-drill.yml       # Weekly PostgreSQL backup/restore drill
├── portfolio-project/
│   ├── backend/                       # FastAPI application
│   │   ├── app/
│   │   │   ├── main.py                # App factory, lifespan, CORS, middleware
│   │   │   ├── config.py              # pydantic-settings, production validation
│   │   │   ├── database.py            # SQLAlchemy 2 engine + SessionLocal
│   │   │   ├── api/
│   │   │   │   ├── v1/                # Versioned routers (auth, admin, blog, contact, github, etc.)
│   │   │   │   └── deps.py            # Dependencies: get_current_user, require_admin, get_db
│   │   │   ├── crud/                  # DB operations per domain
│   │   │   ├── models/                # SQLAlchemy ORM models
│   │   │   ├── schemas/               # Pydantic v2 request/response schemas
│   │   │   ├── services/              # cache, email, captcha, github, storage services
│   │   │   ├── core/rate_limit.py     # slowapi Limiter instance
│   │   │   └── utils/                 # logger, security (JWT/bcrypt)
│   │   ├── alembic/                   # Versioned DB migrations (Faz 1 target)
│   │   ├── tests/                     # pytest suite (SQLite in-memory)
│   │   ├── Dockerfile                 # Python 3.13-slim, non-root user
│   │   ├── docker-compose.yml         # PostgreSQL 15 + Redis 7 + API
│   │   ├── requirements.txt           # Production dependencies
│   │   └── .env.example
│   ├── frontend/                      # Next.js 15 App Router + TypeScript + Tailwind + shadcn/ui
│   │   ├── src/app/                   # App Router: (public), (protected)/admin, login, layout
│   │   ├── src/components/            # ui/ (shadcn), layout/, sections/, admin/
│   │   ├── src/contexts/              # AuthContext, LanguageContext
│   │   ├── src/lib/                   # api.ts (Axios), motion.ts (Framer variants), utils.ts
│   │   ├── src/services/              # Domain API call functions
│   │   ├── next.config.ts
│   │   └── .env.example              # NEXT_PUBLIC_API_BASE_URL required
│   ├── database/migrations/           # Raw SQL schema reference (01_portfolio_db_schema.sql)
│   ├── CI_CD_SETUP.md                 # CI/CD secret contract and smoke scope
│   ├── set-production-env-github.ps1  # GitHub production secrets/vars helper
│   ├── sonar-project.properties       # SonarCloud config
│   └── pytest.ini                     # testpaths, pythonpath, coverage thresholds
├── AGENTS.md                          # This file
├── REFACTOR_PLAN.md                   # PRIMARY REFERENCE -- all tech decisions, phases, implementation steps
├── README.md
└── start.ps1                          # Launches backend + frontend in separate shells
```

## Build & Run Commands

All commands assume `portfolio-project/` as the working directory unless noted.

### Quick Start (from repo root)

```powershell
./start.ps1
```

Boots both backend (uvicorn :8000) and frontend (Next.js :3000) in separate shells, creating venvs and installing deps if needed.

### Backend

```powershell
cd portfolio-project/backend
python -m venv venv
./venv/Scripts/Activate.ps1
pip install -r requirements.txt
copy .env.example .env   # then fill in secrets
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Docker alternative (PostgreSQL 15, Redis 7, API):

```powershell
cd portfolio-project/backend
docker-compose up -d
# Apply migrations:
alembic upgrade head
```

Seed data: `python seed_data.py` (from `backend/`).

### Frontend

```powershell
cd portfolio-project/frontend
npm install
npm run dev
```

Next.js dev server on port 3000. Set `NEXT_PUBLIC_API_BASE_URL` in `.env.local` before first run.

### Environment Variables

**Backend:** `portfolio-project/backend/.env.example`
- Required: `DATABASE_URL`, `SECRET_KEY`, `SMTP_USERNAME`, `SMTP_PASSWORD`
- Optional: `SUPABASE_URL`, `SUPABASE_KEY`, `GITHUB_API_TOKEN`, `REDIS_URL`
- Production-required: `ENVIRONMENT=production`, `FRONTEND_URL`, `ADMIN_EMAILS`, `CAPTCHA_ENABLED=true`, `CAPTCHA_PROVIDER=turnstile`, `CAPTCHA_SECRET_KEY`

**Frontend:** `NEXT_PUBLIC_API_BASE_URL` (required -- build fails without it in production).

## Testing

### Backend Tests (pytest)

```powershell
cd portfolio-project
python -m pytest -q
```

Root `pytest.ini` sets `testpaths = backend/tests`, `pythonpath = backend`, coverage threshold `--cov-fail-under=90` on `app.api.v1`, `app.crud`, `app.api.deps`.

Tests use in-memory SQLite with `StaticPool`. `conftest.py` provides: `client`, `db_session`, `admin_user`, `admin_headers`, factory fixtures. Redis and DB health checks are monkeypatched out.

```powershell
# Single file
python -m pytest backend/tests/test_blog.py -q

# With coverage report
python -m pytest --cov=app.api.v1 --cov=app.crud --cov=app.api.deps --cov-report=term-missing -q
```

### Frontend Tests (Vitest)

```powershell
cd portfolio-project/frontend
npm run test            # single run
npm run test:watch      # watch mode
npm run test:coverage   # with v8 coverage (target >= 90%)
```

Environment: jsdom. Setup: `src/test/setup.ts`.

### Quality Gate (full suite)

```powershell
cd portfolio-project
./quality.ps1                     # backend tests + frontend lint/test/build
./quality.ps1 -SkipFrontend       # backend only
./quality.ps1 -SkipBackend        # frontend only
```

### Linting

```powershell
# Frontend
cd portfolio-project/frontend
npm run lint           # ESLint (--max-warnings 0)
npm run type-check     # tsc --noEmit
npm run build          # next build

# Backend
cd portfolio-project/backend
python -m black app/
python -m isort app/
python -m flake8 app/
```

## Architecture

### Backend (`portfolio-project/backend/app/`)

Layered FastAPI application:

- **`main.py`** -- App factory with lifespan events (DB check, Redis connect/disconnect), CORS, request logging middleware, rate limiting (slowapi), global exception handlers. System endpoints: `/health`, `/ready` (503 if DB down), `/live`.
- **`config.py`** -- `pydantic-settings` `Settings` class. `production_validation_errors()` enforces: non-localhost `FRONTEND_URL`, SECRET_KEY >= 32 chars with known-insecure-key rejection, CAPTCHA enabled with secret key.
- **`database.py`** -- SQLAlchemy 2 engine + `SessionLocal` sessionmaker. `get_db()` yields sessions.
- **`alembic/`** -- Versioned migrations. Run `alembic upgrade head` to apply schema. Do not use `init_db()` in production.
- **`api/v1/`** -- Versioned routers under `/api/v1`: `auth`, `admin`, `blog`, `projects`, `skills`, `experiences`, `contact`, `github`, `translations`, `technologies`.
- **`api/deps.py`** -- `get_current_user` (JWT + blacklist check), `require_admin` (email allowlist), `get_current_user_optional`.
- **`crud/`** -- Database operations per domain.
- **`models/`** -- SQLAlchemy ORM models.
- **`schemas/`** -- Pydantic v2 request/response schemas. `/auth/me` returns `is_admin: bool`.
- **`services/`** -- `cache_service.py` (Redis singleton, graceful fallback), `email_service.py` (aiosmtplib, all user input html.escape()'d), `captcha_service.py` (Turnstile/hCaptcha/reCAPTCHA), `github_service.py` (httpx + 24h cache), `storage_service.py` (Supabase).
- **`core/rate_limit.py`** -- slowapi `Limiter` instance.
- **`utils/`** -- `logger.py` (loguru), `security.py` (JWT creation, bcrypt hashing).

**Auth flow:** JWT-based with refresh token rotation.
1. Login issues access (15min) + refresh (14 days) tokens.
2. Refresh rotates: old JTI blacklisted, new pair issued, server-side session tracked.
3. Logout blacklists access JTI and revokes refresh session.
4. Admin = email in `ADMIN_EMAILS` env var (comma-separated allowlist).

**Rate limits:** Login/refresh at `5/minute`, contact at `5/minute`. CAPTCHA required on `/contact/` in production.

### Frontend (`portfolio-project/frontend/`)

Next.js 15 App Router SPA:

- **`app/layout.tsx`** -- Root layout: Geist fonts, Providers wrapper, metadata.
- **`app/(public)/`** -- Public pages (Home, About, Projects, Blog, Contact) rendered with ISR/SSG.
- **`app/(protected)/admin/`** -- Admin dashboard with auth guard layout. Full CRUD for projects/blog/skills/experiences/messages.
- **`app/login/`** -- JWT login form (client component).
- **`src/providers.tsx`** -- QueryClientProvider + AuthProvider + LanguageProvider.
- **`src/lib/api.ts`** -- Axios instance. Request interceptor attaches JWT + language param. Response interceptor handles 401 with silent token refresh.
- **`src/contexts/AuthContext.tsx`** -- Auth state: `isAuthenticated`, `user`, `isAdmin`, `login`, `logout`.
- **`src/contexts/LanguageContext.tsx`** -- EN/TR i18n via backend `/translations` API.
- **`src/components/ui/`** -- shadcn/ui components (button, card, badge, dialog, sheet, etc.).
- **`src/lib/motion.ts`** -- Shared Framer Motion variants (fadeInUp, stagger, scaleIn).
- **Design:** Dark minimalist tech aesthetic, accent color cyan `#06b6d4`, Geist Sans + Geist Mono fonts.

### CI/CD (`.github/workflows/`)

| Workflow | Trigger | Jobs |
|----------|---------|------|
| `ci.yml` | Push/PR to main, Codex_Implementation | Backend Quality, Frontend Quality, SonarCloud Scan |
| `deploy-production.yml` | Push to main + manual | Backend Quality -> Deploy Railway -> Frontend Quality -> Deploy Vercel -> Smoke Tests |
| `deploy-railway-staging.yml` | Manual | Staging backend deploy |
| `deploy-vercel-preview.yml` | PR | Preview frontend deploy |
| `sonar-pr-gate.yml` | PR to main | SonarCloud PR analysis |
| `backup-restore-drill.yml` | Weekly (Mon 04:00 UTC) + manual | PostgreSQL backup + restore verification |

**Required checks for main merge:** `Backend Quality`, `Frontend Quality`, `Sonar PR Gate`.

**Production smoke scope:** `/live`, `/health`, `/ready`, admin login, admin stats, frontend root. `/contact/` excluded (CAPTCHA required).

### Database

PostgreSQL 15 in production/docker. Tests use SQLite in-memory. Schema managed via Alembic (`alembic/versions/`). Reference SQL in `database/migrations/01_portfolio_db_schema.sql`.

### Key Ports

- Backend API: `8000`
- Frontend dev: `3000`
- PostgreSQL: `5432`
- Redis: `6379`

## Known Issues & Technical Debt

- `token_blacklist` and `refresh_tokens` tables have no automatic cleanup (periodic purge needed)
- SQLite (tests) vs PostgreSQL (production) type mismatches (UUID, INET) -- handled in conftest.py
- Single Uvicorn worker (no Gunicorn process manager)
- `gcc` left in production Docker image (should use multi-stage build)
- GitHub API: no pagination, legacy `token` auth prefix

## Agent Instructions

When working on this project:

1. **Always read `REFACTOR_PLAN.md` first** to understand current phase and implementation steps. All tech decisions are documented there.
2. **Backend changes:** Run `python -m pytest -q` from `portfolio-project/` to verify. Coverage must stay >= 90%.
3. **Frontend changes:** Run `npm run lint && npm run test && npm run build` from `portfolio-project/frontend/`.
4. **Never commit `.env` files or secrets.** Check `.gitignore` coverage.
5. **Production config:** Any new env var must be added to `config.py`, `.env.example`, and `CI_CD_SETUP.md`.
6. **Database schema changes:** Add an Alembic migration (`alembic revision --autogenerate -m "description"`). Never edit existing migration files.
7. **Security:** All public endpoints need rate limiting. User input in HTML must be escaped with `html.escape()`. Production validation in `config.py` must catch misconfigurations.
8. **Do not reference** `PRODUCTION_PLAN.md`, `COMPREHENSIVE_PROJECT_ANALYSIS.md`, `IMPLEMENTATION_AUDIT.md`, `PROGRESS.md`, or other historical snapshot files -- they are outdated.
