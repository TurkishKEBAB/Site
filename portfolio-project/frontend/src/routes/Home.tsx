import Link from "next/link";
import { FiArrowRight, FiDownload, FiGithub, FiLinkedin, FiMail, FiChevronDown } from "react-icons/fi";

import AnimatedSection from "@/components/AnimatedSection";
import { CornerFrame, GlowBar, PanelCard, SectionHeading, StatusDot } from "@/components/ui";
import {
  buildPersonJsonLd,
} from "@/lib/metadata";
import {
  getFeaturedProjects,
  getLocaleValue,
  homeContent,
  impactMetrics,
  siteConfig,
  skillGroups,
  type Locale,
} from "@/content/site";

interface HomePageProps {
  locale: Locale;
}

export default function Home({ locale }: HomePageProps) {
  const text = homeContent[locale];
  const featuredProjects = getFeaturedProjects().slice(0, 3);
  const personJsonLd = buildPersonJsonLd(locale);

  return (
    <div className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />

      <section className="min-h-screen flex flex-col justify-center relative overflow-hidden pt-20">
        <div className="hidden md:block">
          <span className="absolute top-8 left-8 w-14 h-14 border-l border-t border-primary-400/20 pointer-events-none" aria-hidden="true" />
          <span className="absolute top-8 right-8 w-14 h-14 border-r border-t border-primary-400/20 pointer-events-none" aria-hidden="true" />
          <span className="absolute bottom-8 left-8 w-14 h-14 border-l border-b border-primary-400/20 pointer-events-none" aria-hidden="true" />
          <span className="absolute bottom-8 right-8 w-14 h-14 border-r border-b border-primary-400/20 pointer-events-none" aria-hidden="true" />
        </div>

        <div className="container-custom">
          <div className="grid md:grid-cols-[1fr,auto] gap-8 md:gap-12 items-center max-w-6xl">
            <div className="order-2 md:order-1">
              <AnimatedSection delay={0.05}>
                <div className="mb-5 font-mono text-xs sm:text-sm text-dark-400 dark:text-dark-400 tracking-wider">
                  <span className="text-primary-500">{">"}</span> {text.heroEyebrow}
                  <span className="animate-blink text-primary-400 ml-0.5">_</span>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.1}>
                <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-5 leading-[0.95]">
                  <span className="text-gray-900 dark:text-dark-50">{text.heroTitleFirst}</span>
                  <br />
                  <span className="text-primary-500 dark:text-primary-400">{text.heroTitleSecond}</span>
                </h1>
              </AnimatedSection>

              <AnimatedSection delay={0.14}>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-7">
                  <span className="w-6 sm:w-8 h-px bg-primary-400/50" aria-hidden="true" />
                  {text.roleParts.map((part, index) => (
                    <span
                      key={part}
                      className="font-mono text-[10px] sm:text-xs tracking-wider text-gray-500 dark:text-dark-300 flex items-center gap-2 sm:gap-3"
                    >
                      {index > 0 && <span className="text-dark-600 dark:text-dark-500">|</span>}
                      {part}
                    </span>
                  ))}
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.18}>
                <StatusDot color="green" label={text.availabilityLabel} />
                <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-dark-300 max-w-2xl leading-relaxed mb-3">
                  {text.heroDescription}
                </p>
                <p className="text-sm text-gray-500 dark:text-dark-400 max-w-2xl">
                  {text.availabilityNote}
                </p>
              </AnimatedSection>

              <AnimatedSection delay={0.22}>
                <div className="mt-9 flex flex-wrap gap-3">
                  <Link href="/contact" className="btn-primary">
                    <span>{text.primaryCta}</span>
                    <FiArrowRight size={14} />
                  </Link>
                  <Link href="/resume" className="btn-secondary">
                    <span>{text.secondaryCta}</span>
                    <FiDownload size={14} />
                  </Link>
                  <Link href="/projects" className="btn-secondary">
                    <span>{text.tertiaryCta}</span>
                  </Link>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.26}>
                <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl">
                  {impactMetrics.map((metric) => (
                    <PanelCard key={metric.value} className="space-y-2">
                      <div className="font-display text-2xl font-semibold text-gray-900 dark:text-dark-50">
                        {metric.value}
                      </div>
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary-600 dark:text-primary-400">
                        {getLocaleValue(metric.label, locale)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-dark-400">
                        {getLocaleValue(metric.note, locale)}
                      </p>
                    </PanelCard>
                  ))}
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.3}>
                <div className="mt-8 flex items-center gap-2">
                  {[
                    { icon: FiGithub, href: siteConfig.github, label: "GitHub profile" },
                    { icon: FiLinkedin, href: siteConfig.linkedin, label: "LinkedIn profile" },
                    { icon: FiMail, href: `mailto:${siteConfig.email}`, label: "Send an email" },
                  ].map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target={social.href.startsWith("mailto:") ? undefined : "_blank"}
                      rel={social.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                      aria-label={social.label}
                      className="p-2.5 rounded border border-gray-200 dark:border-dark-600 text-gray-500 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-400/40 transition-all"
                    >
                      <social.icon size={18} />
                    </a>
                  ))}
                </div>
              </AnimatedSection>
            </div>

            <AnimatedSection delay={0.12} className="order-1 md:order-2 flex justify-center md:justify-end">
              <div className="relative group">
                <div
                  className="absolute -inset-1 rounded-full opacity-40 group-hover:opacity-70 transition-opacity duration-500 blur-md"
                  style={{ background: "linear-gradient(135deg, #00d4ff, #0099cc, #00d4ff)" }}
                  aria-hidden="true"
                />
                <img
                  src={siteConfig.profileImage}
                  alt={siteConfig.name}
                  className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-full object-cover border-2 border-primary-400/30 dark:border-primary-400/20"
                />
                <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-primary-400/40 rounded-br" aria-hidden="true" />
                <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-primary-400/40 rounded-tl" aria-hidden="true" />
              </div>
            </AnimatedSection>
          </div>
        </div>

        <AnimatedSection className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-gray-400 dark:text-dark-500">
            {text.scroll}
          </span>
          <FiChevronDown size={14} className="text-gray-400 dark:text-dark-500 animate-bounce" />
        </AnimatedSection>
      </section>

      <section className="py-24 md:py-32 relative z-10">
        <div className="container-custom">
          <SectionHeading
            index="01"
            label={text.overviewLabel}
            title={text.overviewTitle}
            align="center"
          />

          <div className="grid md:grid-cols-3 gap-5">
            {text.overviewCards.map((card, index) => (
              <AnimatedSection key={card.title} delay={index * 0.05}>
                <CornerFrame accent className="h-full p-6">
                  <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-dark-50">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-dark-300">
                    {card.body}
                  </p>
                </CornerFrame>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <GlowBar />

      <section className="py-24 md:py-32 relative z-10">
        <div className="container-custom">
          <SectionHeading
            index="02"
            label={text.skillsLabel}
            title={text.skillsTitle}
            subtitle={text.skillsSubtitle}
            align="center"
          />

          <div className="grid lg:grid-cols-2 gap-5">
            {skillGroups.map((group, index) => (
              <AnimatedSection key={group.title.en} delay={index * 0.05}>
                <PanelCard className="h-full">
                  <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-dark-50">
                    {getLocaleValue(group.title, locale)}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-dark-300">
                    {getLocaleValue(group.summary, locale)}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {group.skills.map((skill) => (
                      <span
                        key={`${group.title.en}-${skill}`}
                        className="rounded-full border border-gray-200 dark:border-dark-600 px-3 py-1 font-mono text-[10px] uppercase tracking-wide text-gray-500 dark:text-dark-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </PanelCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <GlowBar />

      <section className="py-24 md:py-32 relative z-10">
        <div className="container-custom">
          <SectionHeading
            index="03"
            label={text.projectsLabel}
            title={text.projectsTitle}
            subtitle={text.projectsSubtitle}
            align="center"
          />

          <div className="grid md:grid-cols-3 gap-5">
            {featuredProjects.map((project, index) => (
              <AnimatedSection key={project.slug} delay={index * 0.05}>
                <PanelCard as="article" className="h-full flex flex-col">
                  <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-dark-50">
                    {getLocaleValue(project.title, locale)}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-dark-300">
                    {getLocaleValue(project.summary, locale)}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-gray-700 dark:text-dark-200">
                    {getLocaleValue(project.impact, locale)}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {project.technologies.slice(0, 4).map((tech) => (
                      <span
                        key={`${project.slug}-${tech}`}
                        className="rounded-full border border-gray-200 dark:border-dark-600 px-3 py-1 font-mono text-[10px] uppercase tracking-wide text-gray-500 dark:text-dark-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </PanelCard>
              </AnimatedSection>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/projects" className="btn-secondary">
              <span>{text.tertiaryCta}</span>
              <FiArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <GlowBar />

      <section className="py-24 md:py-32 relative z-10">
        <div className="container-custom">
          <AnimatedSection>
            <CornerFrame accent className="max-w-3xl mx-auto p-8 md:p-12">
              <div className="text-center">
                <StatusDot color="green" label={text.ctaLabel} />
                <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 dark:text-dark-50 mt-4 mb-4">
                  {text.ctaTitle}
                </h2>
                <p className="text-gray-600 dark:text-dark-300 mb-8 max-w-xl mx-auto">
                  {text.ctaBody}
                </p>
                <Link href="/contact" className="btn-primary">
                  <span>{text.primaryCta}</span>
                  <FiArrowRight size={14} />
                </Link>
              </div>
            </CornerFrame>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}

