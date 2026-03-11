# AGENTS.md

This file provides guidance to AI agents (Claude Code, Codex, Warp, etc.) when working with code in this repository.

## Project Overview

Full-stack portfolio site for Yigit Okur. The main application lives under `portfolio-project/` with a FastAPI backend and React/TypeScript frontend. The repo root contains CI/CD workflows in `.github/workflows/` and a convenience `start.ps1` launcher.

**Current status:** Preparing for production launch on `Codex_Implementation` branch. See `PRODUCTION_PLAN.md` for the full go-live plan with phases and acceptance criteria.

## Repository Structure

```
Site/
├── .github/workflows/
│   ├── ci.yml                      # PR/push quality gate (Backend Quality + Frontend Quality + Sonar)
│   ├── deploy-production.yml       # Main merge -> Railway + Vercel deploy + smoke tests
│   ├── deploy-railway-staging.yml  # Staging backend deploy
│   ├── deploy-vercel-preview.yml   # Preview frontend deploy
│   ├── sonar-pr-gate.yml           # SonarCloud PR analysis
│   └── backup-restore-drill.yml    # Weekly PostgreSQL backup/restore drill
├── portfolio-project/
│   ├── backend/                    # FastAPI application
│   │   ├── app/
│   │   │   ├── main.py             # App factory, lifespan, CORS, middleware
│   │   │   ├── config.py           # pydantic-settings, production validation
│   │   │   ├── database.py         # SQLAlchemy 2 engine + SessionLocal
│   │   │   ├── api/
│   │   │   │   ├── v1/             # Versioned routers (auth, admin, blog, contact, github, etc.)
│   │   │   │   └── deps.py         # Dependencies: get_current_user, require_admin, get_db
│   │   │   ├── crud/               # DB operations per domain
│   │   │   ├── models/             # SQLAlchemy ORM models
│   │   │   ├── schemas/            # Pydantic v2 request/response schemas
│   │   │   ├── services/           # cache, email, captcha, github, storage services
│   │   │   ├── core/rate_limit.py  # slowapi Limiter instance
│   │   │   └── utils/              # logger, security (JWT/bcrypt)
│   │   ├── tests/                  # pytest suite (SQLite in-memory)
│   │   ├── Dockerfile              # Python 3.13-slim, non-root user
│   │   ├── docker-compose.yml      # PostgreSQL 15 + Redis 7 + API
│   │   ├── requirements.txt        # Production dependencies
│   │   └── .env.example
│   ├── frontend/                   # React 18 + TypeScript + Vite
│   │   ├── src/
│   │   │   ├── App.tsx             # Provider hierarchy + lazy routes
│   │   │   ├── services/api.ts     # Axios instance, JWT interceptor, refresh logic
│   │   │   ├── contexts/           # AuthContext, LanguageContext
│   │   │   ├── components/         # Layout, ProtectedRoute, Toast, SEO, etc.
│   │   │   └── pages/              # Home, About, Projects, Blog, Contact, Admin, Login
│   │   ├── package.json
│   │   ├── vite.config.ts          # Path alias @->src, chunk splitting, proxy
│   │   └── .env.example
│   ├── database/migrations/        # Raw SQL (mounted in Docker initdb)
│   ├── CI_CD_SETUP.md              # CI/CD documentation, secret contract, smoke scope
│   ├── set-production-env-github.ps1  # GitHub production secrets/vars helper
│   ├── sonar-project.properties    # SonarCloud config
│   └── pytest.ini                  # testpaths, pythonpath, coverage thresholds
├── AGENTS.md                       # This file
├── PRODUCTION_PLAN.md              # Go-live plan with phases and checklists
└── start.ps1                       # Launches backend + frontend in separate shells
```

## Build & Run Commands

All commands assume `portfolio-project/` as the working directory unless noted.

### Quick Start (from repo root)

```powershell
./start.ps1
```

Boots both backend (uvicorn :8000) and frontend (Vite :5173) in separate shells, creating venvs and installing deps if needed.

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
```

Seed data: `python seed_data.py` (from `backend/`).

### Frontend

```powershell
cd portfolio-project/frontend
npm install
npm run dev -- --host
```

Vite dev server proxies `/api` to `http://localhost:8000`.

### Environment Variables

**Backend:** `portfolio-project/backend/.env.example`
- Required: `DATABASE_URL`, `SECRET_KEY`, `SMTP_USERNAME`, `SMTP_PASSWORD`
- Optional: `SUPABASE_URL`, `SUPABASE_KEY`, `GITHUB_API_TOKEN`, `REDIS_URL`
- Production-required: `ENVIRONMENT=production`, `FRONTEND_URL`, `ADMIN_EMAILS`, `CAPTCHA_ENABLED=true`, `CAPTCHA_PROVIDER=turnstile`, `CAPTCHA_SECRET_KEY`

**Frontend:** `VITE_API_BASE_URL` (required -- no default in production).

## Testing

### Backend Tests (pytest)

```powershell
cd portfolio-project
python -m pytest -q
```

Root `pytest.ini` sets `testpaths = backend/tests`, `pythonpath = backend`, coverage threshold `--cov-fail-under=80` on `app.api.v1`, `app.crud`, `app.api.deps`.

Tests use in-memory SQLite with `StaticPool`. `conftest.py` provides: `client`, `db_session`, `admin_user`, `admin_headers`, factory fixtures. Redis and DB health checks are monkeypatched out.

```powershell
# Single file
python -m pytest backend/tests/test_blog.py -q

# Single test
python -m pytest -k "test_create_blog_post" -q
```

### Frontend Tests (Vitest)

```powershell
cd portfolio-project/frontend
npm run test            # single run
npm run test:watch      # watch mode
npm run test:coverage   # with v8 coverage
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
npm run build          # tsc + vite build

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
- **`config.py`** -- `pydantic-settings` `Settings` class. `production_validation_errors()` enforces: non-localhost `FRONTEND_URL`, SECRET_KEY >= 32 chars, CAPTCHA enabled with secret key. App crashes at startup if validation fails.
- **`database.py`** -- SQLAlchemy 2 engine + `SessionLocal` sessionmaker. `get_db()` yields sessions.
- **`api/v1/`** -- Versioned routers under `/api/v1`: `auth`, `admin`, `blog`, `projects`, `skills`, `experiences`, `contact`, `github`, `translations`, `technologies`.
- **`api/deps.py`** -- `get_current_user` (JWT + blacklist check), `require_admin` (email allowlist), `get_current_user_optional`.
- **`crud/`** -- Database operations per domain.
- **`models/`** -- SQLAlchemy ORM models.
- **`schemas/`** -- Pydantic v2 request/response schemas.
- **`services/`** -- `cache_service.py` (Redis singleton, graceful fallback), `email_service.py` (aiosmtplib), `captcha_service.py` (Turnstile/hCaptcha/reCAPTCHA), `github_service.py` (httpx + 24h cache), `storage_service.py` (Supabase).
- **`core/rate_limit.py`** -- slowapi `Limiter` instance.
- **`utils/`** -- `logger.py` (loguru), `security.py` (JWT creation, bcrypt hashing).

**Auth flow:** JWT-based with refresh token rotation.
1. Login issues access (15min) + refresh (14 days) tokens.
2. Refresh rotates: old JTI blacklisted, new pair issued, server-side session tracked.
3. Logout blacklists access JTI and revokes refresh session.
4. Admin = email in `ADMIN_EMAILS` env var (comma-separated allowlist).

**Rate limits:** Login/refresh at `5/minute`, contact at `5/minute`. CAPTCHA required on `/contact/` in production.

### Frontend (`portfolio-project/frontend/src/`)

React 18 SPA with client-side routing (react-router-dom v6):

- **`App.tsx`** -- Provider hierarchy: `QueryClientProvider` > `ToastProvider` > `LanguageProvider` > `AuthProvider` > `Routes`. All pages lazy-loaded. `/admin` wrapped in `ProtectedRoute`.
- **`services/api.ts`** -- Axios instance. Request interceptor attaches JWT + language param. Response interceptor handles 401 with silent token refresh using refresh token queue pattern.
- **`contexts/AuthContext.tsx`** -- Auth state (`isAuthenticated`, `user`, `login`, `logout`). Uses `/auth/login/json` for login, `/auth/me` for user info.
- **`contexts/LanguageContext.tsx`** -- i18n via `/translations` API.
- **`components/ProtectedRoute.tsx`** -- Guards `/admin`. Currently checks `isAuthenticated` only; admin RBAC is server-side.
- **`pages/`** -- Home, About, Projects, Blog, BlogDetail, Contact, Login, Admin, NotFound.
- **Path alias:** `@` maps to `./src`.
- **Build:** Chunk splitting: `react-vendor`, `markdown-vendor`, `motion-vendor`.

### CI/CD (`.github/workflows/`)

| Workflow | Trigger | Jobs |
|----------|---------|------|
| `ci.yml` | Push/PR to main, Codex_Implementation, develop | Backend Quality, Frontend Quality, SonarCloud Scan |
| `deploy-production.yml` | Push to main + manual | Backend Quality -> Deploy Railway -> Frontend Quality -> Deploy Vercel -> Smoke Tests |
| `deploy-railway-staging.yml` | Manual | Staging backend deploy |
| `deploy-vercel-preview.yml` | PR | Preview frontend deploy |
| `sonar-pr-gate.yml` | PR to main | SonarCloud PR analysis |
| `backup-restore-drill.yml` | Weekly (Mon 04:00 UTC) + manual | PostgreSQL backup + restore verification |

**Required checks for main merge:** `Backend Quality`, `Frontend Quality`, `Sonar PR Gate`.

**Production smoke scope:** `/live`, `/health`, `/ready`, admin login, admin stats, frontend root. `/contact/` excluded (CAPTCHA required).

### Database

PostgreSQL 15 in production/docker. Tests use SQLite in-memory. Schema in `database/migrations/01_portfolio_db_schema.sql` (mounted into Docker initdb). No Alembic version tracking -- raw SQL migrations.

### Key Ports

- Backend API: `8000`
- Frontend dev: `5173` or `3000`
- PostgreSQL: `5432`
- Redis: `6379`

## Production Go-Live Reference

See `PRODUCTION_PLAN.md` for the complete plan. Quick summary of phases:

1. **Faz 1:** Security hardening (code changes on Codex_Implementation)
2. **Faz 2:** Commit, PR, CI validation
3. **Faz 3:** GitHub/Railway/Vercel/Turnstile configuration
4. **Faz 4:** Merge, deploy, smoke + CAPTCHA + backup drill verification
5. **Faz 5:** Post-launch ops (token cleanup, monitoring, secret rotation)

## Known Issues & Technical Debt

- Email templates use f-string HTML interpolation (XSS risk) -- fix in Faz 1
- `token_blacklist` and `refresh_tokens` tables have no automatic cleanup
- SQLite (tests) vs PostgreSQL (production) type mismatches (UUID, INET)
- Single Uvicorn worker (no Gunicorn process manager)
- `gcc` left in production Docker image (should use multi-stage build)
- GitHub API: no pagination, legacy `token` auth prefix
- No Alembic -- manual SQL migrations only

## Agent Instructions

When working on this project:

1. **Always read `PRODUCTION_PLAN.md` first** to understand current phase and remaining work.
2. **Backend changes:** Run `python -m pytest -q` from `portfolio-project/` to verify. Coverage must stay >= 80%.
3. **Frontend changes:** Run `npm run lint && npm run test && npm run build` from `portfolio-project/frontend/`.
4. **Never commit `.env` files or secrets.** Check `.gitignore` coverage.
5. **Production config:** Any new env var must be added to `config.py`, `.env.example`, and `CI_CD_SETUP.md`.
6. **CI workflow changes:** Test with `act` or push to a non-main branch first.
7. **Security:** All public endpoints need rate limiting. User input in HTML must be escaped. Production validation in `config.py` must catch misconfigurations.
