"use client";

import { useState } from "react";

import NxSectionHead from "@/components/nexus/NxSectionHead";
import ScrambleHeading from "@/components/nexus/ScrambleHeading";
import {
  ProjectDossierModal,
  type DossierLabels,
  type DossierProject,
} from "@/components/nexus/ProjectDossierModal";
import { ProjectIndex } from "@/components/nexus/ProjectIndex";
import { projectDetails } from "@/content/projectDetails";
import { getLocaleValue, projectRecords, type Locale } from "@/content/site";

interface ProjectsPageProps {
  locale: Locale;
}

const dossierLabels = (tr: boolean): DossierLabels =>
  tr
    ? {
        featured: "Öne çıkan", project: "Proje", dossier: "dosya",
        overview: "genel", architecture: "mimari", decisions: "kararlar", engLog: "gelişim·kaydı", gallery: "galeri",
        impact: "Etki", techStack: "Teknoloji seti", close: "Proje detaylarını kapat",
        context: "bağlam", decision: "karar", tradeoff: "ödünleşim", galleryHint: "şuraya ekle:",
      }
    : {
        featured: "Featured", project: "Project", dossier: "dossier",
        overview: "overview", architecture: "architecture", decisions: "decisions", engLog: "eng·log", gallery: "gallery",
        impact: "Impact", techStack: "Technology stack", close: "Close project details",
        context: "context", decision: "decision", tradeoff: "trade-off", galleryHint: "add",
      };

export default function Projects({ locale }: ProjectsPageProps) {
  const tr = locale === "tr";
  const labels = dossierLabels(tr);
  const [selected, setSelected] = useState<DossierProject | null>(null);

  const dossierProjects: DossierProject[] = projectRecords.map((project) => ({
    slug: project.slug,
    title: getLocaleValue(project.title, locale),
    summary: getLocaleValue(project.summary, locale),
    description: getLocaleValue(project.description, locale),
    impact: getLocaleValue(project.impact, locale),
    technologies: project.technologies,
    featured: project.featured,
    details: projectDetails[project.slug],
  }));

  return (
    <div className="container-custom pb-16 pt-28 md:pt-32">
      <header className="max-w-3xl">
        <span className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.24em] text-gray-400 dark:text-dark-400">
          <span className="h-px w-5 bg-primary-400/60" aria-hidden="true" />
          <span className="text-primary-600 dark:text-primary-400">//</span> {tr ? "Arsiv" : "Archive"}
        </span>
        <ScrambleHeading
          as="h1"
          text={tr ? "Proje indeksi" : "Project index"}
          className="mt-3.5 font-display text-4xl font-bold tracking-tight text-gray-900 dark:text-dark-50 md:text-5xl"
        />
        <p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-dark-300">
          {tr
            ? "Urun olgunlugu, teknik derinlik ve teslim sorumlulugunu temsil eden secili muhendislik calismalari. Tam vaka icin herhangi bir girisi acin."
            : "Selected engineering work representing product maturity, technical depth, and delivery ownership. Open any entry for the full case."}
        </p>
      </header>

      {/* project index */}
      <section className="mt-20">
        <NxSectionHead
          index="//"
          label={tr ? "Indeks" : "Index"}
          title={tr ? "Tüm sistemler" : "All systems"}
          subtitle={
            tr
              ? "Numarali proje girisleri. Mimari, kararlar, gelisim kaydi ve galeri iceren tam dosya icin herhangi bir satira tikla."
              : "Numbered project entries. Click any row for the full dossier — architecture, decisions, log, gallery."
          }
        />
        <ProjectIndex projects={dossierProjects} onSelect={setSelected} featuredLabel={labels.featured} />
      </section>

      <ProjectDossierModal project={selected} onClose={() => setSelected(null)} labels={labels} />
    </div>
  );
}
