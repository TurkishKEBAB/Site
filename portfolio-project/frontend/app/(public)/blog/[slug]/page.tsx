import type { Metadata } from "next";
import { notFound } from "next/navigation";

import BlogDetail from "@/routes/BlogDetail";
import { fetchBlogPostBundle } from "@/lib/blog";
import { getRequestLocale } from "@/lib/locale";
import { buildMetadata, getSiteUrl } from "@/lib/metadata";

interface BlogDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const locale = await getRequestLocale();
  const { slug } = await params;
  const bundle = await fetchBlogPostBundle(slug, locale);

  if (!bundle.post) {
    return buildMetadata("blog", locale, `/blog/${slug}`);
  }

  return {
    ...buildMetadata("blog", locale, `/blog/${slug}`),
    title: `${bundle.post.title} | Yigit Okur`,
    description: bundle.post.excerpt,
    openGraph: {
      type: "article",
      url: `${getSiteUrl()}/blog/${bundle.post.slug}`,
      title: `${bundle.post.title} | Yigit Okur`,
      description: bundle.post.excerpt,
      siteName: "Yigit Okur",
      images: [
        {
          url: bundle.post.cover_image || "/opengraph-image",
          alt: bundle.post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${bundle.post.title} | Yigit Okur`,
      description: bundle.post.excerpt,
      images: [bundle.post.cover_image || "/opengraph-image"],
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const locale = await getRequestLocale();
  const { slug } = await params;
  const bundle = await fetchBlogPostBundle(slug, locale);

  if (bundle.status === "not_found") {
    notFound();
  }

  return <BlogDetail locale={locale} bundle={bundle} />;
}
