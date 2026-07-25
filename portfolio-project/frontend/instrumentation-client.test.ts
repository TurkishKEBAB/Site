import { afterEach, describe, expect, it, vi } from "vitest";

const { init, captureRouterTransitionStart } = vi.hoisted(() => ({
  init: vi.fn(),
  captureRouterTransitionStart: vi.fn(),
}));

vi.mock("@sentry/nextjs", () => ({
  init,
  captureRouterTransitionStart,
}));

describe("client instrumentation", () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("does not initialize Sentry when the public DSN is absent", async () => {
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "");

    await import("./instrumentation-client");

    expect(init).not.toHaveBeenCalled();
  });

  it("initializes Sentry asynchronously when a public DSN is configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "https://public@example.ingest.sentry.io/1");

    const instrumentation = await import("./instrumentation-client");

    await vi.waitFor(() => expect(init).toHaveBeenCalledTimes(1));
    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: "https://public@example.ingest.sentry.io/1",
        sendDefaultPii: false,
      }),
    );

    instrumentation.onRouterTransitionStart("/projects", "push");
    expect(captureRouterTransitionStart).toHaveBeenCalledWith("/projects", "push");
  });
});
