# Observability, API Contract, and Data Fetching

This note captures the Phase 7 production contract for error reporting, API type drift, and frontend public data fetching.

## Sentry

Backend reporting is optional locally and enabled when `SENTRY_DSN` is set. The FastAPI app initializes Sentry during startup with:

- `SENTRY_DSN`
- `SENTRY_ENVIRONMENT` (falls back to `ENVIRONMENT`)
- `SENTRY_RELEASE` (falls back to deploy git SHA env vars, then app `VERSION`)
- `SENTRY_TRACES_SAMPLE_RATE`
- `SENTRY_PROFILES_SAMPLE_RATE`

Frontend reporting uses `@sentry/nextjs` through App Router instrumentation files:

- `instrumentation-client.ts`
- `instrumentation.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- `app/global-error.tsx`

Required frontend runtime env vars:

- `NEXT_PUBLIC_SENTRY_DSN`
- `NEXT_PUBLIC_SENTRY_ENVIRONMENT`
- `NEXT_PUBLIC_SENTRY_RELEASE`
- `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE`

Source map upload for production builds requires:

- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `SENTRY_AUTH_TOKEN`

## Release Tag Strategy

Preferred release id is the deploy-provided git SHA, but backend and frontend runtimes do not expose identical environment variables.

Backend precedence:

1. Explicit `SENTRY_RELEASE`
2. `GITHUB_SHA`
3. `RAILWAY_GIT_COMMIT_SHA`
4. `VERCEL_GIT_COMMIT_SHA`
5. Backend `VERSION`

Frontend precedence:

1. Explicit `NEXT_PUBLIC_SENTRY_RELEASE`
2. `NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA`
3. `NODE_ENV` fallback

`RAILWAY_GIT_COMMIT_SHA` is server-only unless the deployment exports it into a public build variable. To keep frontend events joinable with backend events on Railway, set `NEXT_PUBLIC_SENTRY_RELEASE` from `RAILWAY_GIT_COMMIT_SHA` during the frontend build.

This keeps backend and frontend events joinable by commit when both deployments expose the same public/frontend-visible SHA.

## Error Contract

All backend errors now use this envelope:

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Project not found",
    "fields": {
      "email": "Input should be a valid email"
    },
    "request_id": "req-..."
  },
  "detail": "Project not found"
}
```

`detail` is kept as a migration bridge for existing clients and tests. New frontend code should use `parseApiError()` from `src/lib/errors.ts`.

## OpenAPI Type Drift

The backend schema is generated with:

```powershell
cd portfolio-project
python backend/scripts/export_openapi.py --output backend/openapi.json
```

Frontend types are generated from that schema:

```powershell
cd portfolio-project/frontend
npm run gen:api
```

CI checks both drift surfaces:

- backend job regenerates `backend/openapi.json` and fails on diff
- frontend job runs `npm run check:api-types` and fails on generated type diff

## TanStack Query Decision

TanStack Query is adopted for client-side public list data because it gives consistent caching, stale time defaults, retry policy, and future mutation invalidation without replacing existing server-rendered public pages yet.

Initial public hooks live in `src/hooks/usePublicData.ts`:

- `useProjectsQuery`
- `useBlogPostsQuery`
- `useSkillsQuery`
- `useExperiencesQuery`

Query keys are centralized in `src/lib/query/queryKeys.ts`.
