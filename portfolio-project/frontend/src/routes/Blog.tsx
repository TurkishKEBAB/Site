import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

import AnimatedSection from "@/components/AnimatedSection";
import { CornerFrame, PanelCard } from "@/components/ui";
import { uiDictionary, type Locale } from "@/content/site";
import type { BlogPost } from "@/services/types";

interface BlogPageProps {
  locale: Locale;
  posts: BlogPost[];
  degraded: boolean;
}

const formatDate = (value: string, locale: Locale) =>
  new Date(value).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default function Blog({ locale, posts, degraded }: BlogPageProps) {
  const text = uiDictionary[locale];

  return (
    <div className="pt-24 md:pt-32 pb-16">
      <div className="container-custom">
        <AnimatedSection className="mb-12">
          <span className="sys-label mb-3 block">// BLOG</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-4 text-gray-900 dark:text-dark-50">
            {locale === "tr" ? "Muhendislik notlari" : "Engineering notes"}
          </h1>
          <p className="max-w-3xl text-lg text-gray-600 dark:text-dark-300">
            {locale === "tr"
              ? "Blog icerigi API saglikliyken server tarafinda render edilir; degilse public yuzey yine kirilmadan fallback durumuna gecer."
              : "Blog posts render on the server when the API is healthy; otherwise the public surface falls back without breaking."}
          </p>
        </AnimatedSection>

        {degraded ? (
          <CornerFrame accent className="max-w-4xl p-8 md:p-10">
            <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-dark-50">
              {text.blogUnavailableTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-base text-gray-600 dark:text-dark-300">
              {text.blogUnavailableBody}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/projects" className="btn-primary">
                {text.blogBackToProjects}
              </Link>
              <Link href="/about" className="btn-secondary">
                {text.blogBackToAbout}
              </Link>
            </div>
          </CornerFrame>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post, index) => (
              <AnimatedSection key={post.id} delay={index * 0.04}>
                <PanelCard as="article" className="flex h-full flex-col">
                  <div className="flex items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-gray-400 dark:text-dark-400">
                    <span>{formatDate(post.published_at || post.created_at, locale)}</span>
                    <span>{post.reading_time || post.read_time || 5} min</span>
                  </div>

                  <h2 className="mt-4 font-display text-2xl font-semibold text-gray-900 dark:text-dark-50">
                    {post.title}
                  </h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-600 dark:text-dark-300">
                    {post.excerpt}
                  </p>

                  {post.tags && post.tags.length > 0 ? (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {post.tags.slice(0, 4).map((tag) => (
                        <span
                          key={`${post.id}-${tag}`}
                          className="rounded-full border border-gray-200 px-3 py-1 font-mono text-[10px] uppercase tracking-wide text-gray-500 dark:border-dark-600 dark:text-dark-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-6">
                    <Link href={`/blog/${post.slug}`} className="btn-secondary">
                      <span>{locale === "tr" ? "Yaziyi ac" : "Open post"}</span>
                      <FiArrowRight size={14} />
                    </Link>
                  </div>
                </PanelCard>
              </AnimatedSection>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
