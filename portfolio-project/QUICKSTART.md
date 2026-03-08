# Quickstart

## 1) Start services

```powershell
cd C:\Develop\Projects\Site\portfolio-project
.\start.ps1
```

If Docker is already running separately:

```powershell
.\start.ps1 -SkipDocker
```

## 2) Verify health

```powershell
.\status.ps1
```

Expected green checks:

- Docker daemon
- PostgreSQL container
- Redis container
- Backend health (`http://127.0.0.1:8000/health`)
- Frontend health (`http://127.0.0.1:3000`)
- Projects API

## 3) Run test and quality checks

```powershell
# Backend (from project root)
python -m pytest -q

# Frontend
cd .\frontend
npm run lint
npm run test
npm run test:coverage
npm run build
```

## 4) Stop services

```powershell
cd ..
.\stop.ps1
```

Or run full quality gate in one command:

```powershell
.\quality.ps1
```

## Notes

- Canonical project status: `PROGRESS.md`
- Historical reports are preserved but not used as live status trackers.
