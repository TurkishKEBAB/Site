# Public Performance Follow-ups Design

## Goal

Reduce first-content delay and public-route latency on `yigitokur.me` while preserving the current visual language, HeroIntro behavior, project dossier interactions, and API compatibility.

## Design

1. Above-the-fold content is visible in server-rendered HTML. `AnimatedSection` receives an opt-in initial animation so the home heading and terminal do not render with `opacity: 0` before hydration. Below-fold sections keep their current reveal animation.
2. The public Projects route fetches a compact, cacheable list on the server and passes it into the client route. React Query uses that value as `initialData`, so the first HTML contains project rows while client refetch remains available.
3. Blog post content is read without incrementing views. View counting becomes a separate non-blocking backend operation with an atomic update; the detail render no longer waits for an increment-and-refetch cycle.
4. Public list payloads use a compact project-list schema. Public read endpoints use explicit short `Cache-Control` policies. Static profile assets use immutable caching only when their URL is content-versioned.
5. Pure database FastAPI handlers use synchronous `def` endpoints so FastAPI executes synchronous SQLAlchemy work in its threadpool. Handlers that perform async HTTP, file, CAPTCHA, or email work remain async.
6. Sentry is loaded only when a client DSN is configured. Public-only routes avoid unnecessary admin/auth Axios work where the existing architecture allows it. Simple reveal animation keeps a CSS/IntersectionObserver path rather than adding more motion runtime work.

## Error and compatibility behavior

- If the server-side project fetch fails, the Projects client falls back to its existing loading/error/refetch behavior.
- If view counting fails, the blog post still renders successfully.
- Existing API response fields remain available for detail/admin consumers; only the public list endpoint receives the compact shape.
- Reduced-motion and HeroIntro scroll-lock cleanup remain safe and tested.

## Verification

- Frontend unit tests cover visible initial sections, project initial data, and conditional observability loading.
- Backend tests cover compact project serialization, view-count failure isolation, and sync endpoint declarations.
- Run frontend tests, lint, type-check, boundary checks, build, targeted backend tests, and the repository quality gate before delivery.
