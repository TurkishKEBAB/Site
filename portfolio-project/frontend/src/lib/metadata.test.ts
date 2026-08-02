import { afterEach, describe, expect, it } from "vitest";

import robots from "../../app/robots";
import sitemap from "../../app/sitemap";
import { buildMetadata, getSiteUrl } from "./metadata";

const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

afterEach(() => {
  if (originalSiteUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    return;
  }
  process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
});

describe("metadata helpers", () => {
  it("builds canonical metadata on the production domain", () => {
    const metadata = buildMetadata("home", "en", "/");

    expect(getSiteUrl()).toBe("https://yigitokur.me");
    expect(metadata.metadataBase?.toString()).toBe("https://yigitokur.me/");
    expect(metadata.alternates?.canonical).toBe("/");
    expect(metadata.openGraph?.url).toBe("https://yigitokur.me/");
    expect(metadata.twitter?.images).toContain("/opengraph-image");
  });

  it("falls back to the canonical domain when NEXT_PUBLIC_SITE_URL is not an absolute URL", () => {
    // Vercel Production had this set to a scheme-less host, which crashed the
    // build with `TypeError: Invalid URL` while collecting page data.
    process.env.NEXT_PUBLIC_SITE_URL = "yigitokur.me";

    expect(getSiteUrl()).toBe("https://yigitokur.me");
    expect(() => buildMetadata("about", "en", "/about")).not.toThrow();
    expect(buildMetadata("about", "en", "/about").openGraph?.url).toBe(
      "https://yigitokur.me/about",
    );
  });

  it("ignores a blank NEXT_PUBLIC_SITE_URL instead of building relative URLs", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "   ";

    expect(getSiteUrl()).toBe("https://yigitokur.me");
  });

  // `new URL("localhost:3000")` parses (scheme "localhost:") and yields the
  // literal string "null" as its origin, which throws again one line later.
  it.each(["localhost:3000", "mailto:hi@example.com", "file:///tmp/site", "ftp://example.com"])(
    "falls back for %s, which parses but has no usable HTTP origin",
    (value) => {
      process.env.NEXT_PUBLIC_SITE_URL = value;

      expect(getSiteUrl()).toBe("https://yigitokur.me");
      expect(() => buildMetadata("about", "en", "/about")).not.toThrow();
    },
  );

  it("honours a valid NEXT_PUBLIC_SITE_URL override", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://staging.yigitokur.me";

    expect(getSiteUrl()).toBe("https://staging.yigitokur.me");
  });

  it("publishes robots rules that block admin surfaces", () => {
    const route = robots();
    const firstRule = Array.isArray(route.rules) ? route.rules[0] : route.rules;

    expect(route.host).toBe("https://yigitokur.me");
    expect(route.sitemap).toBe("https://yigitokur.me/sitemap.xml");
    expect(firstRule.disallow).toEqual(["/admin", "/login"]);
  });

  it("publishes a sitemap with only public routes on the canonical domain", () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain("https://yigitokur.me");
    expect(urls).toContain("https://yigitokur.me/about");
    expect(urls).toContain("https://yigitokur.me/projects");
    expect(urls).toContain("https://yigitokur.me/blog");
    expect(urls).toContain("https://yigitokur.me/contact");
    expect(urls).not.toContain("https://yigitokur.me/login");
    expect(urls).not.toContain("https://yigitokur.me/admin");
    expect(
      urls.every((url) => {
        const parsed = new URL(url);
        return parsed.protocol === "https:" && parsed.hostname === "yigitokur.me";
      }),
    ).toBe(true);
  });
});
