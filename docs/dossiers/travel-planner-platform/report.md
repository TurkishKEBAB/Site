# Rovera Travel Planner — Evidence Report

**Audited:** 2026-07-31

## Sources reviewed

- Local workspace: `C:\Develop\Projects\travel-planner`
- Repository remote: `https://github.com/Soft3112-TravelPlanner/travel-planner`
- `backend/package.json`, `backend/src/app.js`, `backend/src/routes/*`,
  `backend/src/middleware/*`, `backend/src/config/db.js`
- `frontend/project/package.json`, `frontend/project/src/routes/*`,
  `frontend/project/src/components/mapComponent.tsx`
- `CONTRIBUTING.md` and `frontend/docs/ODD.md`, `RAD.md`, `SSD.md`

## Observed architecture

- The backend is a separate Express 5 application with CORS, JSON middleware,
  `/auth` and `/user` routers, JWT/bcrypt dependencies, MySQL configuration, and
  multer-backed avatar uploads.
- The frontend is a separate Vite/React 19 application using TanStack Router,
  HeroUI, Tailwind CSS, Leaflet, and Vitest.
- Route areas cover home, admin, authentication, budget, favorites, profile, search,
  and trips. The generated route tree is part of the frontend source.
- The three architecture-document files exist but are empty in the audited workspace;
  the dossier therefore distinguishes source-observed facts from inferred request flow.

## Decision boundary

No production deployment, benchmark, map provider, or user-volume claim was found in
the audited sources. No approved visual capture was available; `gallery` is
intentionally empty.
