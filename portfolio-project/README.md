# Yiğit Okur — Professional Portfolio

A full-stack portfolio platform that highlights Cloud & DevOps projects,
technical leadership, and community work. The stack pairs a FastAPI backend
with a Next.js frontend so that content can be managed once and rendered
everywhere.

![Backend](https://img.shields.io/badge/backend-FastAPI-009688)
![Frontend](https://img.shields.io/badge/frontend-Next.js%2016%20%2B%20React%2019-000000)
![Database](https://img.shields.io/badge/database-PostgreSQL%2015-4169E1)

## What This Project Delivers

- Centralised profile for Cloud / DevOps roles, academic work, and IEEE initiatives
- Dynamic skills, experiences, blog, and projects served from a real API
- Admin dashboard for content management with audit logging and brute-force lockout
- Responsive, internationalised (TR / EN) UI with App Router, security headers, and SEO metadata routes

## Tech Stack

**Backend** (`backend/`)
- FastAPI + Pydantic v2
- SQLAlchemy 2 (`DeclarativeBase`) on PostgreSQL 15; Alembic migrations
- Redis cache + slowapi rate limiting
- JWT auth (`PyJWT`) with refresh rotation; admin authorization via `User.is_admin` column (bootstrapped from `ADMIN_EMAILS`)
- Supabase Storage uploads with magic-byte validation (`filetype`)
- aiosmtplib email service, Turnstile / hCaptcha / reCAPTCHA captcha service
- Loguru logging, request middleware, health probes (`/live`, `/ready`, `/health`)

**Frontend** (`frontend/`)
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS, Motion (Framer Motion successor), `react-markdown` with `rehype-highlight`
- Axios client with JWT attachment, language query injection, and 401-only token clearing
- App Router route groups: `(public)`, `(auth)`, `(admin)`; metadata routes for sitemap / robots / OG / Twitter images
- Vitest + Testing Library (jsdom) test setup
- Baseline security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS) via `next.config.mjs`

**Tooling & DevOps**
- Docker + docker-compose for local Postgres / Redis / API
- PowerShell helpers (`start.ps1`, `start_backend.ps1`, `quality.ps1`) — see QUICKSTART for cross-platform alternatives
- GitHub Actions: backend pytest + coverage gate, frontend lint / type-check / test / build, `npm audit` + `pip-audit` security gates, SonarCloud PR gate
- Production deploys: Railway (backend, with `alembic upgrade head` on start) + Vercel (frontend)

## Repository Layout

```
portfolio-project/
├── backend/                       # FastAPI application
│   ├── app/
│   │   ├── api/v1/                # Versioned routers
│   │   ├── crud/                  # Database operations
│   │   ├── models/                # SQLAlchemy ORM
│   │   ├── schemas/               # Pydantic v2
│   │   └── services/              # Email, cache, GitHub, storage, captcha
│   ├── alembic/                   # Migration scripts
│   ├── tests/                     # pytest suite
│   ├── requirements.txt
│   └── requirements-dev.txt
├── frontend/                      # Next.js + React client
│   ├── app/                       # App Router routes (public / auth / admin)
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── routes/
│   │   └── services/
│   └── package.json
├── database/                      # SQL schema + backup-restore drill
├── docs/
│   ├── audit-implementation-plan.md   # Active phased audit plan
│   ├── admin-authorization.md         # Admin grant / revoke policy
│   └── _archive/                      # Historical reports (frozen evidence)
├── PROGRESS.md                    # Single source of truth for sprint status
├── QUICKSTART.md                  # Operational runbook
├── CI_CD_SETUP.md                 # CI/CD + production secret contract
└── planlama.md                    # Source audit report (frozen)
```

## Canonical Document Set

These are the live documents for this project. Anything not in this list (or
under [`docs/`](docs/)) is either a frozen snapshot or has been moved to
[`docs/_archive/`](docs/_archive/).

- [`../README.md`](../README.md) — repository entry point
- [`../AGENTS.md`](../AGENTS.md) — branch / commit / build rules
- [`../GIT_WORKFLOW.md`](../GIT_WORKFLOW.md) — git workflow reference
- [`README.md`](README.md) — this file (stack overview)
- [`QUICKSTART.md`](QUICKSTART.md) — local run, test, and quality commands
- [`PROGRESS.md`](PROGRESS.md) — sprint status
- [`CI_CD_SETUP.md`](CI_CD_SETUP.md) — CI workflows and production secrets
- [`docs/audit-implementation-plan.md`](docs/audit-implementation-plan.md) — phased audit remediation plan
- [`docs/admin-authorization.md`](docs/admin-authorization.md) — admin model

## Getting Started

The fastest path is in [`QUICKSTART.md`](QUICKSTART.md). The summary is below.

### 1. Clone

```bash
git clone https://github.com/TurkishKEBAB/portfolio-project.git
cd portfolio-project
```

### 2. Backend (local Python)

```bash
cd backend
python -m venv venv
# Windows: ./venv/Scripts/Activate.ps1
# Linux/macOS: source venv/bin/activate
pip install -r requirements.txt -r requirements-dev.txt
cp .env.example .env  # fill DB, SMTP, Redis, Supabase, ADMIN_EMAILS, captcha
python -m alembic upgrade head
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

> Windows PowerShell shortcut: `./start_backend.ps1` resolves the venv interpreter automatically.

### 3. Frontend

```bash
cd ../frontend
npm install
npm run dev   # http://localhost:3000
```

### 4. Optional: Docker Compose

```bash
cd backend
docker-compose up -d
```

Includes PostgreSQL 15 (`5432`), Redis 7 (`6379`), and FastAPI (`8000`). The
API container runs `alembic upgrade head` on startup.

Seed fixtures:

```bash
SEED_ADMIN_PASSWORD=<choose-a-strong-password> python seed_data.py
```

`SEED_ADMIN_PASSWORD` is required — the script will refuse to run without it
and never prints credentials to stdout.

## Configuration Reference

Backend (see `backend/.env.example`):

```
DATABASE_URL=postgresql+psycopg://user:pass@localhost:5432/portfolio
SECRET_KEY=<min-32-char-random-string>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
ADMIN_EMAILS=admin@example.com           # bootstrap-only; permanence lives on User.is_admin
SEED_ADMIN_PASSWORD=<seed-only>
SMTP_HOST=smtp.gmail.com
SMTP_USERNAME=...
SMTP_PASSWORD=...
REDIS_URL=redis://localhost:6379/0
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development
CAPTCHA_ENABLED=false                    # set true with provider keys in production
```

Frontend (see `frontend/.env.example`):

```
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Verifying The Stack

- Backend liveness: `GET http://127.0.0.1:8000/live`
- Backend readiness: `GET http://127.0.0.1:8000/ready`
- API docs: `http://127.0.0.1:8000/docs`
- Frontend dev server: `http://127.0.0.1:3000`

Test commands are documented in [`QUICKSTART.md`](QUICKSTART.md).

## About Yiğit Okur

- Cloud & DevOps Engineering student @ Işık University (Vice President, IEEE Student Branch)
- Leads the TÜBİTAK-funded Sarkan UAV project and national programming camps
- Interested in secure, automated infrastructure and scalable software

### Contact

- Email: yigitokur@ieee.org
- LinkedIn: [linkedin.com/in/yiğit-okur-050b5b278](https://www.linkedin.com/in/yiğit-okur-050b5b278)
- GitHub: [github.com/TurkishKEBAB](https://github.com/TurkishKEBAB)
- Location: Istanbul, Türkiye

---

Built with FastAPI, Next.js, and a healthy distrust of stale documentation.
