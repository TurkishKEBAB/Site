"use client";

import AnimatedSection from "@/components/AnimatedSection";
import CapabilityMatrix, { type CapabilityGroup } from "@/components/nexus/CapabilityMatrix";
import { CareerViews } from "@/components/nexus/CareerViews";
import CvDossier from "@/components/nexus/CvDossier";
import NxSectionHead from "@/components/nexus/NxSectionHead";
import ScrambleHeading from "@/components/nexus/ScrambleHeading";
import TechRadar from "@/components/nexus/TechRadar";
import { aboutContent, getLocaleValue, impactMetrics, type Locale } from "@/content/site";
import { useSkillsQuery } from "@/hooks/usePublicData";
import { toCapabilityGroups, toRadarBlips } from "@/lib/skills";

interface AboutPageProps {
  locale: Locale;
}

const nowCards = [
  {
    tag: { en: "ACTIVE", tr: "AKTIF" },
    title: { en: "Graduation thesis", tr: "Bitirme tezi" },
    body: {
      en: "Agentic IDE on Electron + Monaco — observe / plan / approve / apply loops.",
      tr: "Electron + Monaco üzerinde agentic IDE — gözlemle / planla / onayla / uygula döngüsü.",
    },
  },
  {
    tag: { en: "RECENT", tr: "YAKIN" },
    title: { en: "Ex-NETAS intern", tr: "Ex-NETAS stajyer" },
    body: {
      en: "Shipped production code across four Jira tickets on a Java microservices platform.",
      tr: "Java mikroservis platformunda dört Jira ticket boyunca production kod teslim ettim.",
    },
  },
  {
    tag: { en: "OPEN", tr: "ACIK" },
    title: { en: "Open to roles", tr: "Rollere acik" },
    body: {
      en: "Part-time SWE, backend, cloud platform & DevOps.",
      tr: "Part-time SWE, backend, cloud platform ve DevOps.",
    },
  },
];

export default function About({ locale }: AboutPageProps) {
  const text = aboutContent[locale];
  const tr = locale === "tr";

  const { data, isError, isLoading, refetch } = useSkillsQuery(locale);
  const skills = data ?? [];
  const capabilityGroups: CapabilityGroup[] = toCapabilityGroups(skills, locale);
  const radarBlips = toRadarBlips(skills);
  const hasSkills = !isLoading && !isError && skills.length > 0;

  return (
    <div className="container-custom pb-16 pt-28 md:pt-32">
      <header className="max-w-3xl">
        <span className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.24em] text-gray-400 dark:text-dark-400">
          <span className="h-px w-5 bg-primary-400/60" aria-hidden="true" />
          <span className="text-primary-600 dark:text-primary-400">//</span> {text.pageLabel}
        </span>
        <ScrambleHeading
          as="h1"
          text={tr ? "Yetenekler & sistem" : "Skills & system"}
          className="mt-3.5 font-display text-4xl font-bold tracking-tight text-gray-900 dark:text-dark-50 md:text-5xl"
        />
        <p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-dark-300">{text.pageSubtitle}</p>
      </header>

      {/* 01 — optimize for */}
      <section className="mt-16">
        <div className="relative panel p-7 md:p-8">
          <span className="absolute left-0 top-0 h-5 w-5 border-l border-t border-primary-400/40" aria-hidden="true" />
          <span className="absolute bottom-0 right-0 h-5 w-5 border-b border-r border-primary-400/40" aria-hidden="true" />
          <span className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.24em] text-gray-400 dark:text-dark-400">
            <span className="text-primary-600 dark:text-primary-400">01</span> {tr ? "Neyi optimize ediyorum" : "What I optimize for"}
          </span>
          <p className="mt-3.5 text-[15px] leading-[1.7] text-gray-600 dark:text-dark-200">{text.journeyBody}</p>
        </div>
      </section>

      <CvDossier locale={locale} />

      {/* 02 — now */}
      <section className="mt-20">
        <NxSectionHead index="03" label={tr ? "Şimdi" : "Now"} title={tr ? "Güncel sinyal" : "Current signal"} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {nowCards.map((card, index) => (
            <AnimatedSection key={card.title.en} delay={index * 0.04}>
              <div className="panel-hover h-full p-5">
                <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-gray-400 dark:text-dark-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                  {getLocaleValue(card.tag, locale)}
                </span>
                <h4 className="mt-3 font-display text-[15px] font-semibold text-gray-900 dark:text-dark-50">
                  {getLocaleValue(card.title, locale)}
                </h4>
                <p className="mt-1.5 text-[12.5px] leading-[1.55] text-gray-600 dark:text-dark-300">
                  {getLocaleValue(card.body, locale)}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* 03 — proof points */}
      <section className="mt-20">
        <NxSectionHead
          index="04"
          label={tr ? "Son dönem kanıtlar" : "Recent proof points"}
          title={tr ? "Sayıların ardındaki" : "What's behind the numbers"}
        />
        <div className="grid gap-4 md:grid-cols-2">
          {text.highlights.map((highlight, index) => (
            <AnimatedSection key={highlight} delay={index * 0.04}>
              <div className="panel h-full p-6">
                <p className="text-[13.5px] leading-relaxed text-gray-700 dark:text-dark-200">{highlight}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* 04 — career map */}
      <section className="mt-20">
        <NxSectionHead
          index="05"
          label={tr ? "Yön" : "Trajectory"}
          title={tr ? "Kariyer haritası" : "Career map"}
          subtitle={
            tr
              ? "Dallanan bir git grafiği olarak kariyer — hikayesini okumak için bir düğüme tıkla."
              : "Career as a branching git graph — click a node to read its story."
          }
        />
        <CareerViews graphLabel={tr ? "grafik" : "graph"} logLabel={tr ? "kayıt" : "log"} />
      </section>

      {/* 05 — capabilities */}
      <section className="mt-20">
        <NxSectionHead
          index="06"
          label={tr ? "Yetkinlikler" : "Capabilities"}
          title={tr ? "Teknik sistem" : "Technical system"}
          subtitle={tr ? "Matrisi odaklamak için domain'e göre filtrele." : "Filter by domain to focus the matrix."}
        />
        {isLoading ? (
          <p role="status" className="font-mono text-xs uppercase tracking-[0.16em] text-gray-500 dark:text-dark-400">
            {tr ? "Yetenekler yükleniyor..." : "Loading skills..."}
          </p>
        ) : isError ? (
          <div role="alert" className="border-t border-gray-200 py-6 dark:border-dark-600">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-red-500">
              {tr ? "Yetenekler yüklenemedi." : "Skills could not be loaded."}
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-4 rounded border border-primary-400/50 px-4 py-2 font-mono text-xs uppercase tracking-wide text-primary-600 transition hover:bg-primary-400/10 dark:text-primary-400"
            >
              {tr ? "Tekrar dene" : "Try again"}
            </button>
          </div>
        ) : hasSkills ? (
          <CapabilityMatrix locale={locale} groups={capabilityGroups} />
        ) : (
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-gray-500 dark:text-dark-400">
            {tr ? "Henüz yetenek bulunmuyor." : "No skills found yet."}
          </p>
        )}
      </section>

      {/* 06 — tech radar */}
      <section className="mt-20">
        <NxSectionHead
          index="07"
          label={tr ? "Tech radar" : "Tech radar"}
          title={tr ? "Adopt · dene · degerlendir" : "Adopt · trial · assess"}
          subtitle={tr ? "Stack'imin bugün durduğu yer — adı için bir blip'in üzerine gel." : "Where my stack sits today — hover a blip for the name."}
        />
        {hasSkills ? <TechRadar locale={locale} blips={radarBlips} /> : null}
      </section>

      {/* 07 — impact metrics */}
      <section className="mt-20">
        <NxSectionHead
          index="08"
          label={tr ? "Etki metrikleri" : "Impact metrics"}
          title={tr ? "Olcekle birlikte teslim" : "Delivery with scale"}
        />
        <div className="grid gap-5 sm:grid-cols-3">
          {impactMetrics.map((metric) => (
            <AnimatedSection key={metric.value}>
              <div className="relative px-6 py-7">
                <span className="absolute left-0 top-0 h-4 w-4 border-l border-t border-primary-400/40" aria-hidden="true" />
                <span className="absolute bottom-0 right-0 h-4 w-4 border-b border-r border-primary-400/40" aria-hidden="true" />
                <div className="font-display text-[2.6rem] font-bold leading-none tracking-tight text-gray-900 dark:text-dark-50">
                  {metric.value}
                </div>
                <div className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.16em] text-primary-600 dark:text-primary-400">
                  {getLocaleValue(metric.label, locale)}
                </div>
                <div className="mt-1.5 text-[13px] text-gray-400 dark:text-dark-400">
                  {getLocaleValue(metric.note, locale)}
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>
    </div>
  );
}
