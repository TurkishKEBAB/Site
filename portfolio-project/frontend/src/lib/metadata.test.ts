import { describe, expect, it } from "vitest";

import robots from "../../app/robots";
import sitemap from "../../app/sitemap";
import { buildMetadata, getSiteUrl } from "./metadata";

describe("metadata helpers", () => {
  it("builds canonical metadata on the production domain", () => {
    const metadata = buildMetadata("home", "en", "/");

    expect(getSiteUrl()).toBe("https://yigitokur.me");
    expect(metadata.metadataBase?.toString()).toBe("https://yigitokur.me/");
    expect(metadata.alternates?.canonical).toBe("/");
    expect(metadata.openGraph?.url).toBe("https://yigitokur.me/");
    expect(metadata.twitter?.images).toContain("/opengraph-image");
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
    expect(urls.every((url) => url.startsWith("https://yigitokur.me"))).toBe(true);
  });
});
