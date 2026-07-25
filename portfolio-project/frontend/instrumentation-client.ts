const tracesSampleRate = Number(
  process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? "0",
);

type RouterTransitionStart = (href: string, navigationType: string) => void;

let captureRouterTransitionStart: RouterTransitionStart = () => {};
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  void import("@sentry/nextjs")
    .then((Sentry) => {
      Sentry.init({
        dsn,
        environment:
          process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
        release:
          process.env.NEXT_PUBLIC_SENTRY_RELEASE ??
          process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
        tracesSampleRate: Number.isFinite(tracesSampleRate) ? tracesSampleRate : 0,
        sendDefaultPii: false,
      });
      captureRouterTransitionStart = Sentry.captureRouterTransitionStart;
    })
    .catch(() => {
      // Observability must never block the public app.
    });
}

export function onRouterTransitionStart(href: string, navigationType: string): void {
  captureRouterTransitionStart(href, navigationType);
}
