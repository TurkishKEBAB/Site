import bundleAnalyzer from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "..", "..");

// api.yigitokur.me is served by this Vercel project because Railway's free
// plan cannot issue custom-domain certificates. Requests arriving on that
// host are proxied straight through to the Railway backend; the main site
// host is unaffected.
const API_PROXY_HOST = process.env.API_PROXY_HOST || "api.yigitokur.me";
const API_PROXY_ORIGIN = (
  process.env.API_PROXY_ORIGIN || "https://site-production-562f.up.railway.app"
)
  .replace(/^http:\/\//i, "https://")
  .replace(/\/$/, "");

// Baseline security headers applied to every response.
// Content-Security-Policy is intentionally deferred: the inline theme bootstrap
// script in app/layout.tsx and Next.js' own runtime require a nonce/hash
// strategy that is out of scope for this baseline.
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  outputFileTracingRoot: workspaceRoot,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  turbopack: {
    root: workspaceRoot,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async rewrites() {
    return {
      // beforeFiles so the proxy wins over app routes and static assets
      // when the request arrives on the API host.
      beforeFiles: [
        {
          source: "/:path*",
          has: [{ type: "host", value: API_PROXY_HOST }],
          destination: `${API_PROXY_ORIGIN}/:path*`,
        },
      ],
    };
  },
};

const sentryOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
    deleteSourcemapsAfterUpload: true,
  },
};

export default withSentryConfig(withBundleAnalyzer(nextConfig), sentryOptions);
