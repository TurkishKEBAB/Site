import Link from "next/link";
import { FiArrowRight, FiDownload, FiGithub, FiLinkedin, FiMail } from "react-icons/fi";

import AnimatedSection from "@/components/AnimatedSection";
import SystemTerminal from "@/components/SystemTerminal";
import CommandCenter from "@/components/nexus/CommandCenter";
import HeroIntro from "@/components/nexus/HeroIntro";
import Magnetic from "@/components/nexus/Magnetic";
import NxSectionHead from "@/components/nexus/NxSectionHead";
import TechTicker from "@/components/nexus/TechTicker";
import { GlowBar } from "@/components/ui";
import {
  getFeaturedProjects,
  getLocaleValue,
  homeContent,
  impactMetrics,
  siteConfig,
  type Locale,
} from "@/content/site";
import type {
  GitHubContributions,
  GitHubStats,
  WakaTimeStats,
} from "@/lib/systemProfile";

interface HomePageProps {
  locale: Locale;
  waka?: WakaTimeStats | null;
  github?: GitHubStats | null;
  contributions?: GitHubContributions | null;
}

function Metric({ value, label, note }: { value: string; label: string; note: string }) {
  return (
    <div className="relative px-6 py-7">
      <span className="absolute left-0 top-0 h-4 w-4 border-l border-t border-primary-400/40" aria-hidden="true" />
      <span className="absolute bottom-0 right-0 h-4 w-4 border-b border-r border-primary-400/40" aria-hidden="true" />
      <div className="font-display text-[2.6rem] font-bold leading-none tracking-tight text-gray-900 dark:text-dark-50">
        {value}
      </div>
      <div className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.16em] text-primary-600 dark:text-primary-400">
        {label}
      </div>
      <div className="mt-1.5 text-[13px] text-gray-400 dark:text-dark-400">{note}</div>
    </div>
  );
}

export default function Home({
  locale,
  waka = null,
  github = null,
  contributions = null,
}: HomePageProps) {
  const text = homeContent[locale];
  const featuredProjects = getFeaturedProjects().slice(0, 3);
  const tr = locale === "tr";

  return (
    <div className="relative">
      <HeroIntro />
      {/* ── hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-0 pb-20 pt-28 md:pb-24 md:pt-32">
        <div className="container-custom">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr,420px]">
            <div className="order-2 lg:order-1">
              <AnimatedSection delay={0.05}>
                <div className="mb-6 flex items-center gap-3.5">
                  <span className="h-px w-11 bg-primary-400/60" aria-hidden="true" />
                  <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-gray-400 dark:text-dark-400">
                    SYSTEM.PROFILE · <span className="text-primary-600 dark:text-primary-400">v2026</span>
                  </span>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.1}>
                <h1 className="font-display text-[clamp(3.4rem,9vw,7rem)] font-bold leading-[0.9] tracking-[-0.045em] text-gray-900 dark:text-dark-50">
                  {text.heroTitleFirst}
                  <br />
                  <span className="nx-two">{text.heroTitleSecond}</span>
                </h1>
              </AnimatedSection>

              <AnimatedSection delay={0.14}>
                <div className="mb-7 mt-6 flex flex-wrap items-center gap-4">
                  {text.roleParts.map((part, index) => (
                    <span
                      key={part}
                      className="flex items-center gap-4 font-mono text-xs tracking-wide text-gray-500 dark:text-dark-300"
                    >
                      {index > 0 && <span className="text-dark-500">|</span>}
                      {part}
                    </span>
                  ))}
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.18}>
                <p className="mb-3 max-w-[38rem] text-[17px] leading-[1.65] text-gray-600 dark:text-dark-300">
                  {text.heroDescription}
                </p>
                <p className="mb-8 max-w-[38rem] text-sm text-gray-500 dark:text-dark-400">
                  {text.availabilityNote}
                </p>
              </AnimatedSection>

              <AnimatedSection delay={0.22}>
                <div className="flex flex-wrap items-center gap-3.5">
                  <Magnetic>
                    <Link href="/contact" className="btn-primary">
                      <span>{text.primaryCta}</span>
                      <FiArrowRight size={14} />
                    </Link>
                  </Magnetic>
                  <Magnetic>
                    <Link href="/resume" className="btn-secondary">
                      <span>{text.secondaryCta}</span>
                      <FiDownload size={14} />
                    </Link>
                  </Magnetic>
                  <Magnetic>
                    <Link href="/projects" className="btn-secondary">
                      <span>{tr ? "Çalışmaları gör" : "View work"}</span>
                    </Link>
                  </Magnetic>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.26}>
                <div className="mt-8 flex items-center gap-2.5">
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
                      className="flex h-10 w-10 items-center justify-center rounded border border-gray-200 text-gray-500 transition-all hover:border-primary-400/40 hover:text-primary-600 dark:border-dark-600 dark:text-dark-400 dark:hover:text-primary-400"
                    >
                      <social.icon size={17} />
                    </a>
                  ))}
                </div>
              </AnimatedSection>
            </div>

            <AnimatedSection delay={0.12} className="order-1 w-full lg:order-2">
              <div className="relative mx-auto w-full max-w-md">
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
      </section>

      <TechTicker />

      {/* ── telemetry ──────────────────────────────────────────── */}
      <section className="container-custom py-20 md:py-24">
        <NxSectionHead
          index="00"
          label={tr ? "Telemetri" : "Telemetry"}
          title={tr ? "Ölçülen teslim" : "Delivery, measured"}
        />
        <div className="grid gap-5 sm:grid-cols-3">
          {impactMetrics.map((metric) => (
            <AnimatedSection key={metric.value}>
              <Metric
                value={metric.value}
                label={getLocaleValue(metric.label, locale)}
                note={getLocaleValue(metric.note, locale)}
              />
            </AnimatedSection>
          ))}
        </div>
      </section>

      <div className="container-custom">
        <GlowBar />
      </div>

      {/* ── command center ─────────────────────────────────────── */}
      <section className="container-custom py-20 md:py-24">
        <NxSectionHead
          index="01"
          label={tr ? "Aktivite" : "Activity"}
          title={tr ? "Komuta merkezi" : "Command center"}
          subtitle={
            tr
              ? "WakaTime ve GitHub'tan beslenen canli kodlama ritmi."
              : "Live coding rhythm pulled from WakaTime and GitHub."
          }
        />
        <CommandCenter
          locale={locale}
          waka={waka}
          github={github}
          contributions={contributions}
        />
      </section>

      <div className="container-custom">
        <GlowBar />
      </div>

      {/* ── featured systems ───────────────────────────────────── */}
      <section className="container-custom py-20 md:py-24">
        <NxSectionHead
          index="02"
          label={tr ? "Seçili çalışmalar" : "Selected work"}
          title={tr ? "Öne çıkan sistemler" : "Featured systems"}
          subtitle={
            tr
              ? "Urun olcegi, teknik derinlik ve teslim sorumlulugunu temsil eden odakli bir set."
              : "A focused set representing product scale, technical depth, and delivery ownership."
          }
        />
        <div className="grid gap-5 md:grid-cols-3">
          {featuredProjects.map((project, index) => (
            <AnimatedSection key={project.slug} delay={index * 0.05}>
              <Link href="/projects" className="group block h-full">
                <div className="panel-hover relative h-full p-6">
                  <span className="absolute left-0 top-0 h-5 w-5 border-l border-t border-primary-400/40" aria-hidden="true" />
                  <span className="absolute bottom-0 right-0 h-5 w-5 border-b border-r border-primary-400/40" aria-hidden="true" />
                  <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-dark-50">
                    {getLocaleValue(project.title, locale)}
                  </h3>
                  <p className="mt-2.5 text-[13.5px] leading-relaxed text-gray-600 dark:text-dark-300">
                    {getLocaleValue(project.summary, locale)}
                  </p>
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
        <div className="mt-7">
          <Link href="/projects" className="btn-secondary">
            <span>{tr ? "Tüm projeler" : "All projects"}</span>
            <FiArrowRight size={14} />
          </Link>
        </div>
      </section>

      <div className="container-custom">
        <GlowBar />
      </div>

      {/* ── contact console ────────────────────────────────────── */}
      <section className="container-custom py-20 md:py-24">
        <AnimatedSection>
          <div className="relative mx-auto max-w-3xl px-6 py-14 text-center md:px-12">
            <span className="absolute left-0 top-0 h-6 w-6 border-l border-t border-primary-400/40" aria-hidden="true" />
            <span className="absolute right-0 top-0 h-6 w-6 border-r border-t border-primary-400/40" aria-hidden="true" />
            <span className="absolute bottom-0 left-0 h-6 w-6 border-b border-l border-primary-400/40" aria-hidden="true" />
            <span className="absolute bottom-0 right-0 h-6 w-6 border-b border-r border-primary-400/40" aria-hidden="true" />
            <div className="font-mono text-xs tracking-[0.1em] text-gray-400 dark:text-dark-400">
              <span className="text-primary-600 dark:text-primary-400">&gt;</span> open channel --to yigit
            </div>
            <h2 className="mt-4 font-display text-[clamp(2rem,4.5vw,2.8rem)] font-bold tracking-tight text-gray-900 dark:text-dark-50">
              {text.ctaTitle}
            </h2>
            <p className="mx-auto mt-3.5 max-w-[34rem] leading-relaxed text-gray-600 dark:text-dark-300">
              {text.ctaBody}
            </p>
            <div className="mt-7 flex justify-center">
              <Magnetic>
                <Link href="/contact" className="btn-primary">
                  <span>{text.primaryCta}</span>
                  <FiArrowRight size={14} />
                </Link>
              </Magnetic>
            </div>
          </div>
        </AnimatedSection>
      </section>
    </div>
  );
}
