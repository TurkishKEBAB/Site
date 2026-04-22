import type { Metadata } from "next";

import Blog from "@/routes/Blog";
import { fetchBlogPosts } from "@/lib/blog";
import { getRequestLocale } from "@/lib/locale";
import { buildMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildMetadata("blog", locale, "/blog");
}

export default async function BlogPage() {
  const locale = await getRequestLocale();
  const { posts, degraded } = await fetchBlogPosts(locale);

  return <Blog locale={locale} posts={posts} degraded={degraded} />;
}
