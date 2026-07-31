# Ramazan Kopru Academic Site — Evidence Report

**Audited:** 2026-07-31

## Sources reviewed

- Local workspace: `C:\Develop\Projects\RamazanKopru`
- Repository remote: `https://github.com/TurkishKEBAB/RamazanKopru`
- `package.json`, `README.md`, `DEPLOYMENT.md`
- `app/` route tree, `data/*.json`, `tests/`

## Observed architecture

- Next.js 14 App Router with React 18 and TypeScript.
- Tailwind CSS and shadcn/Radix-style UI dependencies.
- MDX is used for longform biography/research content; JSON files hold profile,
  publications, courses, projects, theses, and service records.
- Public sections include about, research, teaching, publications, students, service,
  and contact. Admin pages and route handlers are present under `app/admin` and
  `app/api/admin`.
- Metadata, JSON-LD, sitemap, and robots support are documented and implemented in
  the application structure.

## Decision boundary

The dossier records repository architecture and content boundaries. The audited
workspace does not provide deployment telemetry, so no production uptime, traffic,
or hosting claim is published. No approved visual capture was available; `gallery`
is intentionally empty.
