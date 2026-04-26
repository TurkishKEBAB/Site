# Quickstart

This is the operational runbook for working on the portfolio project locally.
For stack and architecture, see [`README.md`](README.md). For branch and commit
rules, see [`../AGENTS.md`](../AGENTS.md).

## Canonical Document Set

These are the live documents — read them in this order if you are new:

1. [`../README.md`](../README.md) — repo entry point
2. [`README.md`](README.md) — stack overview
3. This file — local run, test, and quality commands
4. [`../AGENTS.md`](../AGENTS.md) and [`../GIT_WORKFLOW.md`](../GIT_WORKFLOW.md) — branch / commit rules
5. [`PROGRESS.md`](PROGRESS.md) — current sprint status
6. [`CI_CD_SETUP.md`](CI_CD_SETUP.md) — CI workflows and production secret contract
7. [`docs/audit-implementation-plan.md`](docs/audit-implementation-plan.md) — active audit remediation plan
8. [`docs/admin-authorization.md`](docs/admin-authorization.md) — admin authorization model

Historical reports are preserved under [`docs/_archive/`](docs/_archive/).

## 1) Start Services

### Windows + PowerShell (preferred)

```powershell
cd C:\Develop\Projects\Site\portfolio-project
./start.ps1                  # full stack
./start.ps1 -BackendOnly     # postgres + redis + api only
./start.ps1 -FrontendOnly    # next dev only
./start.ps1 -ResetData       # drop docker volumes before starting
./start.ps1 -SkipSeed        # skip seed_data.py
```

### Linux / macOS / any non-PowerShell environment

The PowerShell helpers are Windows-only by design. On other platforms, run the
backend stack with Docker Compose and the frontend with npm directly:

```bash
# Backend stack (postgres + redis + api)
cd portfolio-project/backend
docker-compose up -d

# Or run the API outside Docker:
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt -r requirements-dev.txt
cp .env.example .env  # fill secrets first
python -m alembic upgrade head
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

```bash
# Frontend (in another shell)
cd portfolio-project/frontend
npm install
npm run dev
```

## 2) Verify Health

### Windows + PowerShell

```powershell
./status.ps1
```

Expected green checks:

- Docker daemon
- PostgreSQL container
- Redis container
- Backend liveness (`http://127.0.0.1:8000/live`)
- Backend readiness (`http://127.0.0.1:8000/ready`)
- Frontend health (`http://127.0.0.1:3000`)
- Projects API

### Cross-platform

```bash
curl -fsS http://127.0.0.1:8000/live
curl -fsS http://127.0.0.1:8000/ready
curl -fsS http://127.0.0.1:8000/health
curl -fsS http://127.0.0.1:3000 -o /dev/null -w "%{http_code}\n"
```

## 3) Run Test And Quality Checks

```bash
# Backend (from portfolio-project/)
python -m pytest -q

# Frontend
cd frontend
npm run lint
npm run type-check
npm run test
npm run test:coverage
npm run build
```

The root `pytest.ini` enforces `--cov-fail-under=80` on `app.api.v1`,
`app.crud`, and `app.api.deps`. The frontend lint script runs with
`--max-warnings 0`.

## 4) Database Migrations

```bash
cd backend
python -m alembic upgrade head        # apply latest
python -m alembic revision --autogenerate -m "feat(db): describe change"
python -m alembic downgrade -1        # only when reverting locally
```

Production deploys run `python -m alembic upgrade head` automatically on
container start (Railway) and as part of `deploy-production.yml`.

## 5) Stop Services

### Windows + PowerShell

```powershell
cd ..
./stop.ps1
./stop.ps1 -ResetData     # also drop docker volumes
```

### Cross-platform

```bash
cd portfolio-project/backend
docker-compose down               # stop
docker-compose down -v            # stop + drop volumes
```

## 6) Quality Gate (one command)

### Windows + PowerShell

```powershell
./quality.ps1                  # backend tests + frontend lint/test/build
./quality.ps1 -SkipFrontend
./quality.ps1 -SkipBackend
```

### Cross-platform alternative

There is no shell script equivalent yet. Run the quality steps manually:

```bash
cd portfolio-project
python -m pytest -q
cd frontend && npm run lint && npm run type-check && npm run test && npm run build
```

If you want a portable alternative, contributions adding a `Makefile` or
`bash`/`sh` equivalent are welcome — see [`docs/audit-implementation-plan.md`](docs/audit-implementation-plan.md)
for the active audit backlog.

## 7) Backup / Restore Drill

```bash
cd database
bash backup_restore_drill.sh
```

Runs against the local PostgreSQL container and exercises `pg_dump` /
`pg_restore`. CI runs the same drill in `.github/workflows/backup-restore-drill.yml`.

## Notes

- Canonical project status: [`PROGRESS.md`](PROGRESS.md)
- Active audit plan: [`docs/audit-implementation-plan.md`](docs/audit-implementation-plan.md)
- Historical reports are in [`docs/_archive/`](docs/_archive/) — they are frozen evidence, not live trackers.
- PowerShell-only flow is a deliberate constraint on Windows-first developer ergonomics; the cross-platform commands above are the supported alternative until a portable wrapper lands.
