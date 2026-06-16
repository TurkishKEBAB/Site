import Link from "next/link";
import { FiArrowRight, FiDownload, FiGithub, FiLinkedin, FiMail, FiChevronDown } from "react-icons/fi";

import AnimatedSection from "@/components/AnimatedSection";
import SystemTerminal from "@/components/SystemTerminal";
import { CornerFrame, GlowBar, PanelCard, SectionHeading, StatusDot } from "@/components/ui";
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

const activityStats = [
  { value: "18.5h", label: "weekly coding", detail: "WakaTime style pulse" },
  { value: "25", label: "NETAS commits", detail: "production Java tickets" },
  { value: "86.97%", label: "coverage gate", detail: "IsikSchedule core" },
  { value: "35+", label: "events shipped", detail: "IEEE Isik operations" },
];

const languageBreakdown = [
  { name: "Java", value: 31 },
  { name: "Python", value: 26 },
  { name: "TypeScript", value: 22 },
  { name: "Shell", value: 12 },
  { name: "SQL", value: 9 },
];

const heatmapCells = Array.from({ length: 84 }, (_, index) => (index * 7 + index * index) % 5);

export default function Home({ locale }: HomePageProps) {
  const text = homeContent[locale];
  const featuredProjects = getFeaturedProjects().slice(0, 3);

  return (
    <div className="relative">
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

            <AnimatedSection delay={0.12} className="order-1 md:order-2">
              <div className="relative mx-auto w-full max-w-xl md:max-w-md lg:max-w-lg">
                <div
                  className="absolute -inset-4 rounded opacity-50 blur-2xl"
                  style={{ background: "radial-gradient(circle at 50% 0%, rgba(0,212,255,0.18), transparent 62%)" }}
                  aria-hidden="true"
                />
                <div className="relative">
                  <SystemTerminal />
                </div>
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
            label={locale === "tr" ? "Aktivite" : "Activity"}
            title={locale === "tr" ? "Komuta merkezi" : "Command center"}
            subtitle={
              locale === "tr"
                ? "Canli entegrasyon yerine, profilin kanit odakli ritmini gosteren kaynaklanmis sinyaller."
                : "Source-backed signals that make the profile feel operational even before live integrations are attached."
            }
            align="center"
          />

          <div className="grid gap-5 lg:grid-cols-[1.15fr,0.85fr]">
            <AnimatedSection>
              <PanelCard className="h-full">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="sys-label">// runtime signal</span>
                    <h3 className="mt-2 font-display text-2xl font-semibold text-gray-900 dark:text-dark-50">
                      {locale === "tr" ? "Aktivite panosu" : "Activity dashboard"}
                    </h3>
                  </div>
                  <span className="rounded-full border border-primary-400/30 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-primary-600 dark:text-primary-400">
                    @TurkishKEBAB
                  </span>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {activityStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded border border-gray-200 bg-gray-50/70 p-4 dark:border-dark-600 dark:bg-dark-950/40"
                    >
                      <div className="font-display text-3xl font-semibold text-gray-900 dark:text-dark-50">
                        {stat.value}
                      </div>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-primary-600 dark:text-primary-400">
                        {stat.label}
                      </p>
                      <p className="mt-2 text-sm text-gray-500 dark:text-dark-400">{stat.detail}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 dark:text-dark-400">
                      contribution heat
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 dark:text-dark-400">
                      last 12 weeks
                    </span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    {heatmapCells.map((level, index) => (
                      <span
                        key={`heat-${index}`}
                        className="h-3 rounded-[1px] bg-primary-400"
                        style={{ opacity: 0.12 + level * 0.16 }}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                </div>
              </PanelCard>
            </AnimatedSection>

            <AnimatedSection delay={0.05}>
              <PanelCard className="h-full">
                <span className="sys-label">// language mix</span>
                <div className="mt-5 space-y-4">
                  {languageBreakdown.map((language) => (
                    <div key={language.name}>
                      <div className="mb-1 flex items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.16em]">
                        <span className="text-gray-600 dark:text-dark-300">{language.name}</span>
                        <span className="text-primary-600 dark:text-primary-400">{language.value}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-dark-700">
                        <div
                          className="h-full rounded-full bg-primary-400"
                          style={{ width: `${language.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-7 rounded border border-primary-400/25 bg-primary-400/5 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary-600 dark:text-primary-400">
                    // verified sources
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-dark-300">
                    {locale === "tr"
                      ? "GitHub, WakaTime ve proje kalite kapilari icin hazir bir yuzey; canli API baglantilari eklendiginde ayni modul veriyle beslenecek."
                      : "Prepared for GitHub, WakaTime, and quality-gate feeds; the module can swap from static proof points to live data without redesign."}
                  </p>
                </div>
              </PanelCard>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <GlowBar />

      <section className="py-24 md:py-32 relative z-10">
        <div className="container-custom">
          <SectionHeading
            index="02"
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
            index="03"
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
            index="04"
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

