# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Full-stack portfolio site for Yiğit Okur. The main application lives under `portfolio-project/` with a FastAPI backend and a Next.js/TypeScript frontend. The repo root contains a convenience `start.ps1` that forwards to `portfolio-project/start.ps1`.

## Git Workflow

Read `GIT_WORKFLOW.md` at the repo root for the full reference. The rules below are the mandatory subset every agent must follow before touching any code.

### Before Starting Any Task

1. Check the current branch and working tree state first:
   ```powershell
   git status --short --branch
   git fetch origin
   ```
2. If not on `main` and not on an appropriate feature branch, switch to `main` and create a new branch:
   ```powershell
   git switch main
   git reset --hard origin/main
   git switch -c <type>/<scope>-<topic>
   ```
3. Never commit directly to `main`.
4. Never continue work on `Codex_Implementation` — that branch no longer exists.

### Branch Naming Rules

Use the scope that matches the area of work:

| Scope | When to use |
|---|---|
| `feature/backend-<topic>` | New backend endpoint, model, service, or CRUD |
| `feature/frontend-<topic>` | New page, component, hook, or context |
| `fix/backend-<topic>` | Backend bug fix |
| `fix/frontend-<topic>` | Frontend bug fix |
| `refactor/backend-<topic>` | Backend refactor without behavior change |
| `refactor/frontend-<topic>` | Frontend refactor without behavior change |
| `test/backend-<topic>` | Backend test additions or fixes |
| `test/frontend-<topic>` | Frontend test additions or fixes |
| `chore/github-<topic>` | GitHub workflows, issue templates, automation |
| `chore/repo-<topic>` | Repository housekeeping, gitignore, tooling config |
| `ci/<topic>` | CI/CD pipeline changes |
| `docs/<topic>` | Documentation only |

Examples:
- `feature/backend-alembic-migrations`
- `feature/frontend-public-pages`
- `fix/backend-refresh-token`
- `test/backend-admin-coverage`

### Commit Convention

Use Conventional Commits. Format: `type(scope): short summary`

Allowed types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `ci`, `build`

Examples:
- `feat(backend): add Alembic migration for initial schema`
- `fix(auth): handle expired refresh token`
- `refactor(frontend): split query hooks by domain`
- `test(backend): add coverage for admin project endpoints`
- `chore(github): update stale workflow thresholds`

Rules:
- English only.
- One commit = one logical change.
- Do not use vague words like `update`, `improve`, `misc`, `fix stuff`.
- Do not mix backend and frontend changes in a single commit unless they are inseparable.

### Commit Frequency

- Commit after each meaningful self-contained unit of work.
- Do not accumulate a session's worth of changes into one commit.
- If implementing a feature that has multiple layers (model → crud → route → schema), commit each layer separately.

### Push and PR

- Push the branch and open a PR targeting `main`.
- PR title must follow the same Conventional Commits format as commits.
- Prefer `Squash and merge` when merging unless the commit history is deliberately granular.

### What Not To Do

- Do not create tags manually; tags are for releases only.
- Do not squash mid-session unless explicitly asked.
- Do not force-push without explicit user confirmation.
- Do not leave untracked `.idea/`, `logs/`, or `*.log` files — they are already in `.gitignore`.

---

## Build & Run Commands

All commands below assume `portfolio-project/` as the working directory unless noted otherwise.

### Quick Start (from repo root)

```powershell
./start.ps1
```

This boots the backend stack with Docker Compose (`postgres`, `redis`, `api`) and opens the frontend Next.js dev server on `:3000`. The script supports `-BackendOnly`, `-FrontendOnly`, `-ResetData`, and `-SkipSeed`.

### Backend

```powershell
cd portfolio-project/backend
python -m venv venv
./venv/Scripts/Activate.ps1
pip install -r requirements.txt
copy .env.example .env   # then fill in secrets
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Docker alternative (starts PostgreSQL 15, Redis 7, and the API):

```powershell
cd portfolio-project/backend
docker-compose up -d
```

Seed data: `python seed_data.py` (from `backend/`).

Windows helper: `./start_backend.ps1` (from `backend/`) runs uvicorn via `venv/Scripts/python.exe`.

### Frontend

```powershell
cd portfolio-project/frontend
npm install
npm run dev
```

The frontend dev server runs at `http://localhost:3000`. API calls are configured via `NEXT_PUBLIC_API_BASE_URL` (fallback `http://localhost:8000/api/v1` in `frontend/src/services/api.ts`).

### Environment Variables

Backend: `portfolio-project/backend/.env.example` — for local uvicorn runs, required: `DATABASE_URL`, `SECRET_KEY`, `SMTP_USERNAME`, `SMTP_PASSWORD`. For Docker Compose startup, also set `POSTGRES_PASSWORD` and `REDIS_PASSWORD`.

Frontend: `portfolio-project/frontend/.env.example` — `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_SITE_URL`, `VITE_GITHUB_USERNAME`.

## Testing

### Backend Tests (pytest)

Run from `portfolio-project/`:

```powershell
python -m pytest -q
```

The root `portfolio-project/pytest.ini` sets `testpaths = backend/tests`, `pythonpath = backend`, and enforces `--cov-fail-under=80` on `app.api.v1`, `app.crud`, and `app.api.deps`.

Tests use an in-memory SQLite database with `StaticPool`. The `conftest.py` provides fixtures like `client`, `db_session`, `admin_user`, `admin_headers`, and factory fixtures (`create_project`, `create_skill`, etc.). Redis and DB health checks are monkeypatched out.

Run a single test file:

```powershell
python -m pytest backend/tests/test_blog.py -q
```

Run a single test by name:

```powershell
python -m pytest -k "test_create_blog_post" -q
```

### Frontend Tests (Vitest)

Run from `portfolio-project/frontend/`:

```powershell
npm run test            # single run
npm run test:watch      # watch mode
npm run test:coverage   # with v8 coverage
```

Test setup: `src/test/setup.ts` imports `@testing-library/jest-dom/vitest`. Environment is jsdom.

### Quality Gate (full suite)

```powershell
cd portfolio-project
./quality.ps1                     # runs backend tests + frontend lint/test/build
./quality.ps1 -SkipFrontend       # backend only
./quality.ps1 -SkipBackend        # frontend only
```

### Linting & Type Checking

```powershell
# Frontend
cd portfolio-project/frontend
npm run lint           # ESLint (--max-warnings 0)
npm run type-check     # tsc --noEmit
npm run build          # next build (includes Next.js production checks)
```

Backend has `black`, `isort`, and `flake8` in requirements but no pre-configured scripts — run them directly:

```powershell
cd portfolio-project/backend
python -m black app/
python -m isort app/
python -m flake8 app/
```

## Architecture

### Backend (`portfolio-project/backend/app/`)

Layered FastAPI application:

- **`main.py`** — App factory with lifespan events (DB check, Redis connect/disconnect), CORS, request logging middleware, rate limiting (slowapi), and global exception handlers.
- **`config.py`** — `pydantic-settings` `Settings` class loading from `backend/.env`. Accessed via the singleton `settings = get_settings()`.
- **`database.py`** — SQLAlchemy 2 engine + `SessionLocal` sessionmaker. `get_db()` generator yields sessions for FastAPI `Depends`.
- **`api/v1/`** — Versioned routers, all mounted under `/api/v1`. Modules: `auth`, `admin`, `blog`, `projects`, `skills`, `experiences`, `contact`, `github`, `translations`, `technologies`.
- **`api/deps.py`** — FastAPI dependencies: `get_db`, `get_current_user` (JWT via `HTTPBearer`), `require_admin` (checks email against `ADMIN_EMAILS` allow list), `get_current_user_optional`.
- **`crud/`** — Database operations per domain (e.g., `crud/project.py`). These accept a `Session` and return ORM model instances.
- **`models/`** — SQLAlchemy ORM models inheriting from `Base` in `database.py`.
- **`schemas/`** — Pydantic v2 request/response schemas.
- **`services/`** — Stateful services: `cache_service.py` (Redis singleton with graceful fallback), `captcha_service.py` (Turnstile/hCaptcha/reCAPTCHA verification), email (aiosmtplib), GitHub API (httpx + 24h cache), Supabase storage.
- **`core/rate_limit.py`** — slowapi `Limiter` instance.
- **`utils/`** — `logger.py` (loguru setup), `security.py` (JWT token creation).

Auth flow: JWT-based. Tokens carry `{"sub": "<user_uuid>"}`. Admin status is determined by checking the user's email against `ADMIN_EMAILS` (comma-separated env var), not a database flag.

### Frontend (`portfolio-project/frontend/`)

Next.js App Router frontend (React 19 + TypeScript):

- **`app/`** — Route groups for public/auth/admin surfaces: `(public)`, `(auth)`, `(admin)`. Metadata routes include `sitemap.ts`, `robots.ts`, `opengraph-image.tsx`, and `twitter-image.tsx`.
- **`app/layout.tsx`** — Root layout with Next font loading, locale-aware `<html lang>`, theme bootstrap script, and shared providers.
- **`src/components/providers.tsx`** — Provider hierarchy: `LanguageProvider` > `ToastProvider` > `AuthProvider`.
- **`src/services/api.ts`** — Axios instance with base URL from `NEXT_PUBLIC_API_BASE_URL`. Request interceptor attaches JWT from `localStorage` and a `language` query param on GET requests. Response interceptor dispatches `api:error` custom events and redirects to `/login` on 401/403 from admin pages. The `apiEndpoints` object provides a typed endpoint map.
- **`src/routes/`** — Feature route components (Home, About, Projects, Blog, BlogDetail, Contact, Login, Admin, NotFound) consumed by `app/*/page.tsx` files.
- **`src/contexts/AuthContext.tsx`** — Auth state + `login`/`logout` functions. Uses `/auth/login/json` for login, `/auth/me` for user info.
- **`src/contexts/LanguageContext.tsx`** — UI dictionary-based i18n (`src/content/site.ts`) with language persistence in `localStorage` + cookie.
- **`src/lib/metadata.ts`** — Per-route metadata builders and JSON-LD helpers used by app routes.
- **Path alias**: `@` maps to `./src` (configured in `vite.config.ts` and `tsconfig.json`).

Bundle analysis runs via `npm run analyze` (`@next/bundle-analyzer`) and CI uploads artifacts from `frontend/.next/analyze`.

### CI/CD (`.github/workflows/`)

- **`ci.yml`** — Runs on push/PR to `main` and `develop`. Two parallel jobs: backend (Python 3.13, pytest) and frontend (Node 20, lint + server-component boundary check + coverage + build). A `sonarcloud` push job runs only when Sonar credentials are available.
- **`sonar-pr-gate.yml`** — SonarCloud PR analysis gate for pull requests targeting `main`.
- **`deploy-production.yml`** — Production pipeline with separate backend (Railway) and frontend (Vercel) deployments plus smoke checks.
- **`deploy-vercel-preview.yml`** / **`deploy-railway-staging.yml`** — Staging deployment workflows.

### Database

PostgreSQL 15 in production/docker; tests use in-memory SQLite. Schema migrations live in `portfolio-project/database/migrations/` and are mounted into the Postgres container's `docker-entrypoint-initdb.d`. Alembic is listed as a dependency but manual `Base.metadata.create_all()` is used for initial setup via `init_db.py`.

### Key Ports

- Backend API: `8000`
- Frontend dev server: `3000`
- PostgreSQL: `5432`
- Redis: `6379`
