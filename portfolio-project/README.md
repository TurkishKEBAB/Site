# 🚀 Yiğit Okur - Professional Portfolio

A full-stack portfolio platform that highlights Cloud & DevOps projects, technical leadership, and community work. The stack combines a FastAPI backend with a modern React/TypeScript frontend so that content can be managed once and displayed everywhere.

![Project Status](https://img.shields.io/badge/status-active-brightgreen)
![Backend](https://img.shields.io/badge/backend-FastAPI-009688)
![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20TypeScript-61DAFB)
![Database](https://img.shields.io/badge/database-PostgreSQL-4169E1)

## 🎯 What This Project Delivers

- Centralised profile for **Cloud/DevOps** roles, academic work, and IEEE initiatives
- Dynamic skills, experiences, and projects powered by a real API
- Admin-ready infrastructure for future content management and analytics
- Responsive, animated UI that mirrors the high standards expected from modern portfolio sites

## 🛠️ Tech Stack

**Backend**
- FastAPI 0.110 + Pydantic 2
- PostgreSQL 15 with SQLAlchemy 2
- Redis cache & background tasks
- JWT authentication with configurable admin email allow list
- Supabase Storage integration, SMTP email service

**Frontend**
- React 18 + TypeScript + Vite 5
- Tailwind CSS, Framer Motion, custom animated background
- Axios API client with typed services
- Protected routes, dark theme, responsive layout

**Tooling & DevOps**
- Docker & docker-compose for local stack
- PowerShell helpers (`start.ps1`, `start_backend.ps1`)
- Loguru logging, health checks, ready-to-enable CI/CD

## ✨ Feature Snapshot

**Backend**
- 50+ REST endpoints covering blog, projects, experiences, skills, contact, translations
- Pagination, filtering, caching, and activity grouping (work/education/volunteer/activity)
- Admin-only mutations guarded by JWT + email allow list
- GitHub integration with 24h cache, email notifications, Supabase image optimisation

**Frontend**
- Home, About, Projects, Blog, Contact, and Admin dashboards implemented
- Animated timeline that merges backend data with curated certifications/achievements
- Skill grids pulled live from the API with proficiency bars
- Project modal with technology badges, search filtering, and responsive layout
- Blog listing with tag filters (detail view coming next)

## 📁 Repository Layout

```
portfolio-project/
├── backend/                 # FastAPI application
│   ├── app/
│   │   ├── api/v1/          # Versioned routers
│   │   ├── crud/            # Database operations
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic models
│   │   └── services/        # Email, cache, GitHub, storage
│   ├── requirements.txt
│   ├── docker-compose.yml
│   ├── start_backend.ps1
│   └── README.md
├── frontend/                # React + Vite client
│   ├── src/components
│   ├── src/pages
│   ├── src/services
│   └── README.md
├── database/                # SQL schema & seed scripts
└── docs                     # Progress & analysis reports
```

## 🚀 Getting Started

### 1. Clone & Prepare

```powershell
git clone https://github.com/TurkishKEBAB/portfolio-project.git
cd portfolio-project
```

### 2. Backend Setup (local Python)

```powershell
cd backend
python -m venv venv
./venv/Scripts/Activate.ps1
pip install -r requirements.txt
copy .env.example .env  # Fill in DB, SMTP, Redis, Supabase, admin emails
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

> Windows shortcut: `./start_backend.ps1` ensures the interpreter is resolved correctly.

### 3. Frontend Setup

```powershell
cd ../frontend
npm install
npm run dev -- --host
```

### 4. Optional: Docker Compose

```powershell
cd backend
docker-compose up -d
```

Services included: FastAPI (`8000`), PostgreSQL (`5432`), Redis (`6379`). Seed data script `backend/seed_data.py` can populate experiences, projects, skills.

## 🔐 Configuration Reference

Key backend environment variables (see `backend/.env.example`):

```
DATABASE_URL=postgresql+psycopg://user:pass@localhost:5432/portfolio
SECRET_KEY=generate-a-long-random-string
JWT_ALGORITHM=HS256
ADMIN_EMAILS=yigitokur@ieee.org
SMTP_HOST=smtp.gmail.com
SMTP_USERNAME=...
SMTP_PASSWORD=...
REDIS_URL=redis://localhost:6379/0
FRONTEND_URL=http://localhost:5173
ENVIRONMENT=development
```

## 🧪 Verifying the Stack

- Backend health: `GET http://127.0.0.1:8000/health`
- API docs: `http://127.0.0.1:8000/docs`
- Run quick syntax check: `python -m compileall app`
- Frontend dev server: `http://127.0.0.1:5173`

Unit tests (backlog item) will live under `backend/tests/` and `frontend/src/__tests__/`.

## 📈 Current Status (Oct 2025)

- Backend ✅ 100% — production-ready, freshly hardened admin checks, activity-aware experiences endpoint, cleaned seed data
- Frontend ⚙️ ~55% — core pages functional; pending blog detail view, admin CRUD wiring, accessibility polish
- DevOps 🔄 ~40% — Docker works locally; CI/CD and production deployment templates are next

Active roadmap is tracked in:
- `PROGRESS.md` – sprint-level snapshot
- `COMPREHENSIVE_PROJECT_ANALYSIS.md` – prioritised backlog & troubleshooting log
- `DETAILED_ANALYSIS_REPORT.md` – long-form audit and content checklist

## 🤝 Contributing / Next Steps

1. Run the seed script to sync local DB with latest CV data: `python seed_data.py`
2. Connect Admin UI to the authenticated endpoints (projects, skills, blogs)
3. Add integration tests (pytest + HTTPX, Vitest + Testing Library)
4. Prepare deployment playbook (Vercel + Railway recommended)

## 👤 About Yiğit Okur

- Cloud & DevOps Engineering student @ Işık University (Vice President, IEEE Student Branch)
- Leads the TÜBİTAK-funded Sarkan UAV project and national programming camps
- Interested in secure, automated infrastructure and scalable software

### Contact

- **Email**: yigitokur@ieee.org
- **LinkedIn**: [linkedin.com/in/yiğit-okur-050b5b278](https://www.linkedin.com/in/yiğit-okur-050b5b278)
- **GitHub**: [github.com/TurkishKEBAB](https://github.com/TurkishKEBAB)
- **Location**: Istanbul, Türkiye

---

Built with ❤️, FastAPI, and React. Feel free to learn from the implementation; please ask before cloning it wholesale.
