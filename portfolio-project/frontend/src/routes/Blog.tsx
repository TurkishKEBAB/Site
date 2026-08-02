import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

import AnimatedSection from "@/components/AnimatedSection";
import ScrambleHeading from "@/components/nexus/ScrambleHeading";
import { CornerFrame } from "@/components/ui";
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
  const tr = locale === "tr";

  return (
    <div className="container-custom pb-16 pt-28 md:pt-32">
      <header className="mb-12 max-w-3xl">
        <span className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.24em] text-gray-400 dark:text-dark-400">
          <span className="h-px w-5 bg-primary-400/60" aria-hidden="true" />
          <span className="text-primary-600 dark:text-primary-400">//</span> Blog
        </span>
        <ScrambleHeading
          as="h1"
          text={tr ? "Mühendislik notları" : "Engineering notes"}
          className="mt-3.5 font-display text-4xl font-bold tracking-tight text-gray-900 dark:text-dark-50 md:text-5xl"
        />
        <p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-dark-300">
          {tr
            ? "Production hata ayıklama, kalite sistemleri ve AI-native araç araştırmasından saha notları. Bir notu okumak için tıkla."
            : "Field notes from production debugging, quality systems, and AI-native tooling research. Click a note to read."}
        </p>
      </header>

      {degraded ? (
        <CornerFrame accent className="max-w-4xl p-8 md:p-10">
          <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-dark-50">{text.blogUnavailableTitle}</h2>
          <p className="mt-4 max-w-2xl text-base text-gray-600 dark:text-dark-300">{text.blogUnavailableBody}</p>
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
              <Link href={`/blog/${post.slug}`} className="group block h-full">
                <article className="panel-hover flex h-full flex-col p-6">
                  <div className="flex items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gray-400 dark:text-dark-400">
                    <span>{formatDate(post.published_at || post.created_at, locale)}</span>
                    <span>
                      {post.reading_time || post.read_time || 5} {tr ? "DK" : "MIN"}
                    </span>
                  </div>
                  <h2 className="mt-4 font-display text-[21px] font-semibold leading-[1.25] text-gray-900 dark:text-dark-50">
                    {post.title}
                  </h2>
                  <p className="mt-2.5 flex-1 text-[13.5px] leading-relaxed text-gray-600 dark:text-dark-300">
                    {post.excerpt}
                  </p>
                  {post.tags && post.tags.length > 0 ? (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {post.tags.slice(0, 4).map((tag) => (
                        <span
                          key={`${post.id}-${tag}`}
                          className="rounded-full border border-gray-200 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-gray-500 dark:border-dark-600 dark:text-dark-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <span className="mt-5 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-primary-600 dark:text-primary-400">
                    {tr ? "Notu oku" : "Read note"}
                    <FiArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </article>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      )}
    </div>
  );
}
