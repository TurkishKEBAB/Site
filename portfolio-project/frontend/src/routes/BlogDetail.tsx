import Link from "next/link";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { FiArrowLeft, FiArrowRight, FiShare2 } from "react-icons/fi";

import AnimatedSection from "@/components/AnimatedSection";
import BlogViewTracker from "@/components/BlogViewTracker";
import { PanelCard } from "@/components/ui";
import { siteConfig, uiDictionary, type Locale } from "@/content/site";
import type { BlogPostBundle } from "@/lib/blog";

interface BlogDetailPageProps {
  locale: Locale;
  bundle: BlogPostBundle;
}

const formatDate = (value: string, locale: Locale) =>
  new Date(value).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default function BlogDetail({ locale, bundle }: BlogDetailPageProps) {
  const text = uiDictionary[locale];

  if (!bundle.post) {
    return (
      <div className="pt-24 md:pt-32 pb-16">
        <div className="container-custom max-w-4xl">
          <PanelCard className="space-y-6">
            <h1 className="font-display text-4xl font-bold text-gray-900 dark:text-dark-50">
              {text.blogUnavailableTitle}
            </h1>
            <p className="text-base text-gray-600 dark:text-dark-300">
              {text.blogUnavailableBody}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/blog" className="btn-secondary">
                {locale === "tr" ? "Blog listesine dön" : "Back to blog"}
              </Link>
              <Link href="/projects" className="btn-primary">
                {text.blogBackToProjects}
              </Link>
            </div>
          </PanelCard>
        </div>
      </div>
    );
  }

  const post = bundle.post;
  const shareUrl = `${siteConfig.siteUrl}/blog/${post.slug}`;

  return (
    <>
      <BlogViewTracker slug={post.slug} />
      <div className="pt-24 md:pt-32 pb-16">
        <div className="container-custom">
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-mono text-xs tracking-wide text-primary-600 transition-colors hover:text-primary-600 dark:text-primary-400"
          >
            <FiArrowLeft size={14} />
              {locale === "tr" ? "Blog listesine dön" : "Back to blog"}
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AnimatedSection>
              <PanelCard as="article" className="overflow-hidden">
                <div className="space-y-6 p-6 md:p-10">
                  <header className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-gray-400 dark:text-dark-400">
                      <span>{formatDate(post.published_at || post.created_at, locale)}</span>
                      <span>{post.reading_time || post.read_time || 5} min</span>
                      <span>{post.views ?? post.view_count ?? 0} views</span>
                    </div>

                    <h1 className="font-display text-3xl font-bold leading-tight text-gray-900 dark:text-dark-50 md:text-5xl">
                      {post.title}
                    </h1>

                    {post.tags && post.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <span
                            key={`${post.id}-${tag}`}
                            className="rounded-full border border-gray-200 px-3 py-1 font-mono text-[10px] uppercase tracking-wide text-gray-500 dark:border-dark-600 dark:text-dark-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </header>

                  <section className="blog-markdown text-base leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                      {post.content}
                    </ReactMarkdown>
                  </section>

                  <footer className="flex flex-col gap-4 border-t border-gray-200 pt-6 dark:border-dark-600 sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-400 dark:text-dark-400">
                      {locale === "tr" ? "Son güncelleme" : "Last updated"}{" "}
                      {formatDate(post.updated_at, locale)}
                    </span>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                    >
                      <FiShare2 size={14} />
                      <span>{locale === "tr" ? "Paylaş" : "Share"}</span>
                    </a>
                  </footer>
                </div>
              </PanelCard>
            </AnimatedSection>
          </div>

          <aside className="space-y-6 lg:col-span-1">
            {bundle.relatedPosts.length > 0 ? (
              <AnimatedSection delay={0.06}>
                <PanelCard>
                  <h2 className="sys-label mb-4 block">// {locale === "tr" ? "İLGİLİ" : "RELATED"}</h2>
                  <div className="space-y-4">
                    {bundle.relatedPosts.map((post) => (
                      <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                        <h3 className="text-sm font-medium text-gray-800 transition-colors group-hover:text-primary-600 dark:text-dark-100 dark:group-hover:text-primary-400">
                          {post.title}
                        </h3>
                        <p className="mt-1 text-xs text-gray-500 dark:text-dark-400">
                          {formatDate(post.published_at || post.created_at, locale)}
                        </p>
                      </Link>
                    ))}
                  </div>
                </PanelCard>
              </AnimatedSection>
            ) : null}

            {bundle.latestPosts.length > 0 ? (
              <AnimatedSection delay={0.1}>
                <PanelCard>
                  <h2 className="sys-label mb-4 block">// {locale === "tr" ? "SON YAZILAR" : "LATEST"}</h2>
                  <div className="space-y-4">
                    {bundle.latestPosts.map((post) => (
                      <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-sm font-medium text-gray-800 transition-colors group-hover:text-primary-600 dark:text-dark-100 dark:group-hover:text-primary-400">
                            {post.title}
                          </h3>
                          <FiArrowRight
                            size={14}
                            className="text-gray-400 transition-colors group-hover:text-primary-400"
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-dark-400">
                          {formatDate(post.published_at || post.created_at, locale)}
                        </p>
                      </Link>
                    ))}
                  </div>
                </PanelCard>
              </AnimatedSection>
            ) : null}
          </aside>
        </div>
        </div>
      </div>
    </>
  );
}
