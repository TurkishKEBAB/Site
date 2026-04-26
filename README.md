# Site — Yiğit Okur Portfolio Monorepo

Personal portfolio and content platform. The repository root is a thin
wrapper around the application code in [`portfolio-project/`](portfolio-project/).

## Repository Layout

```
Site/
├── portfolio-project/      # FastAPI backend + Next.js frontend (the actual app)
│   ├── backend/
│   ├── frontend/
│   ├── database/
│   └── docs/
├── AGENTS.md               # Mandatory branch / commit / build rules for AI agents
├── GIT_WORKFLOW.md         # Long-form git workflow reference
├── AUDIT_REMEDIATION.md    # Audit-driven remediation tracker (PR work packages)
└── start.ps1               # Forwards to portfolio-project/start.ps1
```

## Where To Start

| If you want to ... | Read ... |
|---|---|
| Run the app locally | [`portfolio-project/QUICKSTART.md`](portfolio-project/QUICKSTART.md) |
| Understand the stack and architecture | [`portfolio-project/README.md`](portfolio-project/README.md) |
| Open a PR or pick a branch name | [`AGENTS.md`](AGENTS.md), [`GIT_WORKFLOW.md`](GIT_WORKFLOW.md) |
| Track current sprint / project status | [`portfolio-project/PROGRESS.md`](portfolio-project/PROGRESS.md) |
| Follow the active audit remediation plan | [`portfolio-project/docs/audit-implementation-plan.md`](portfolio-project/docs/audit-implementation-plan.md) |
| See production CI/CD and secret contracts | [`portfolio-project/CI_CD_SETUP.md`](portfolio-project/CI_CD_SETUP.md) |
| Review historical reports | [`portfolio-project/docs/_archive/`](portfolio-project/docs/_archive/) |

## Stack At A Glance

- **Backend**: FastAPI, SQLAlchemy 2, PostgreSQL 15, Redis, Alembic
- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript, Tailwind CSS
- **Auth**: JWT with refresh rotation; admin authorization via `User.is_admin` (DB column, bootstrapped from `ADMIN_EMAILS`)
- **Infra**: Docker Compose for local dev; Railway (backend) + Vercel (frontend) for production
- **CI**: GitHub Actions — backend pytest + coverage gate, frontend lint/test/build, SonarCloud PR gate

## Quick Start

The full operational runbook lives in
[`portfolio-project/QUICKSTART.md`](portfolio-project/QUICKSTART.md). Short
version (Windows + PowerShell):

```powershell
cd portfolio-project
./start.ps1
```

For Linux / macOS or any environment without PowerShell, run the backend and
frontend manually:

```bash
# Backend
cd portfolio-project/backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt -r requirements-dev.txt
cp .env.example .env  # then fill secrets
python -m alembic upgrade head
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Frontend (in another shell)
cd portfolio-project/frontend
npm install
npm run dev
```

## Contact

- Email: yigitokur@ieee.org
- GitHub: [github.com/TurkishKEBAB](https://github.com/TurkishKEBAB)
