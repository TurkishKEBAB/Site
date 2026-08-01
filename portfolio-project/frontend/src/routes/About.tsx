"use client";

import CapabilityMatrix, { type CapabilityGroup } from "@/components/nexus/CapabilityMatrix";
import { CareerViews } from "@/components/nexus/CareerViews";
import NxSectionHead from "@/components/nexus/NxSectionHead";
import ScrambleHeading from "@/components/nexus/ScrambleHeading";
import TechRadar from "@/components/nexus/TechRadar";
import { aboutContent, type Locale } from "@/content/site";
import { useSkillsQuery } from "@/hooks/usePublicData";
import { toCapabilityGroups, toRadarBlips } from "@/lib/skills";

interface AboutPageProps {
  locale: Locale;
}

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

      <section className="mt-16" aria-labelledby="professional-summary">
        <div className="relative panel p-7 md:p-8">
          <span className="absolute left-0 top-0 h-5 w-5 border-l border-t border-primary-400/40" aria-hidden="true" />
          <span className="absolute bottom-0 right-0 h-5 w-5 border-b border-r border-primary-400/40" aria-hidden="true" />
          <span className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.24em] text-gray-400 dark:text-dark-400">
            <span className="text-primary-600 dark:text-primary-400">01</span> {tr ? "Profil" : "Profile"}
          </span>
          <h2 id="professional-summary" className="mt-3.5 font-display text-2xl font-semibold text-gray-900 dark:text-dark-50">
            {tr ? "Profesyonel özet" : "Professional summary"}
          </h2>
          <p className="mt-3.5 text-[15px] leading-[1.7] text-gray-600 dark:text-dark-200">{text.journeyBody}</p>
        </div>
      </section>

      <section className="mt-20">
        <NxSectionHead
          index="02"
          label={tr ? "Yön" : "Trajectory"}
          title={tr ? "Kariyer haritası" : "Career map"}
          subtitle={
            tr
              ? "Dallanan bir git grafiği olarak kariyer — hikayesini okumak için bir düğüme tıkla."
              : "Career as a branching git graph — click a node to read its story."
          }
        />
        <CareerViews locale={locale} graphLabel={tr ? "grafik" : "graph"} logLabel={tr ? "kayıt" : "log"} />
      </section>

      <section className="mt-20">
        <NxSectionHead
          index="03"
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

      <section className="mt-20">
        <NxSectionHead
          index="04"
          label="Tech radar"
          title={tr ? "Adopt · dene · değerlendir" : "Adopt · trial · assess"}
          subtitle={tr ? "Stack'imin bugün durduğu yer — adı için bir blip'in üzerine gel." : "Where my stack sits today — hover a blip for the name."}
        />
        {hasSkills ? <TechRadar locale={locale} blips={radarBlips} /> : null}
      </section>
    </div>
  );
}
