import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/metadata";

const routes = ["", "/about", "/projects", "/blog", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const now = new Date();

  return routes.map((route, index) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: index === 0 || route === "/projects" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/projects" ? 0.9 : 0.7,
  }));
}
