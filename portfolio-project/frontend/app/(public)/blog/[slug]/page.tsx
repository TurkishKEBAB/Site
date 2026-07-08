import type { Metadata } from "next";
import { notFound } from "next/navigation";

import BlogDetail from "@/routes/BlogDetail";
import { fetchBlogPostBundle, fetchBlogPostMetadata } from "@/lib/blog";
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
  const post = await fetchBlogPostMetadata(slug, locale);

  if (!post) {
    return buildMetadata("blog", locale, `/blog/${slug}`);
  }

  return {
    ...buildMetadata("blog", locale, `/blog/${slug}`),
    title: `${post.title} | Yiğit Okur`,
    description: post.excerpt,
    openGraph: {
      type: "article",
      url: `${getSiteUrl()}/blog/${post.slug}`,
      title: `${post.title} | Yiğit Okur`,
      description: post.excerpt,
      siteName: "Yiğit Okur",
      images: [
        {
          url: post.cover_image || "/opengraph-image",
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | Yiğit Okur`,
      description: post.excerpt,
      images: [post.cover_image || "/opengraph-image"],
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
