"use client";

import { useState } from "react";
import { isAxiosError } from "axios";

import NxSectionHead from "@/components/nexus/NxSectionHead";
import ScrambleHeading from "@/components/nexus/ScrambleHeading";
import {
  ProjectDossierModal,
  type DossierLabels,
  type DossierProject,
} from "@/components/nexus/ProjectDossierModal";
import { ProjectIndex } from "@/components/nexus/ProjectIndex";
import type { Locale } from "@/content/site";
import { useProjectDossierQuery, useProjectsQuery } from "@/hooks/usePublicData";
import { mergeDossierProject } from "@/lib/dossier";
import { mapProjectsToDossierProjects } from "@/lib/projects";
import type { PaginatedResponse, ProjectListItem } from "@/services/types";

interface ProjectsPageProps {
  locale: Locale;
  initialProjects?: PaginatedResponse<ProjectListItem> | null;
  initialProjectsLanguage?: Locale;
}

const dossierLabels = (tr: boolean): DossierLabels =>
  tr
    ? {
        featured: "Öne çıkan", project: "Proje", dossier: "dosya",
        overview: "genel", architecture: "mimari", decisions: "kararlar", engLog: "gelişim·kaydı", gallery: "galeri",
        impact: "Etki", techStack: "Teknoloji seti", close: "Proje detaylarını kapat",
        context: "bağlam", decision: "karar", tradeoff: "ödünleşim", galleryHint: "şuraya ekle:",
        dossierLoading: "Dosya yükleniyor...", dossierUnavailable: "Dosya kullanılamıyor.", retryDossier: "Dosyayı tekrar dene",
      }
    : {
        featured: "Featured", project: "Project", dossier: "dossier",
        overview: "overview", architecture: "architecture", decisions: "decisions", engLog: "eng·log", gallery: "gallery",
        impact: "Impact", techStack: "Technology stack", close: "Close project details",
        context: "context", decision: "decision", tradeoff: "trade-off", galleryHint: "add",
        dossierLoading: "Loading dossier...", dossierUnavailable: "Dossier unavailable.", retryDossier: "Retry dossier",
      };

export default function Projects({
  locale,
  initialProjects,
  initialProjectsLanguage,
}: ProjectsPageProps) {
  const tr = locale === "tr";
  const labels = dossierLabels(tr);
  const [selected, setSelected] = useState<DossierProject | null>(null);
  const params = { limit: 100, language: locale };
  const queryInitialData = locale === initialProjectsLanguage ? initialProjects ?? undefined : undefined;
  const { data, isError, isLoading, refetch } = useProjectsQuery(params, queryInitialData);
  const dossierProjects = mapProjectsToDossierProjects(data?.items ?? [], locale);
  const dossierQuery = useProjectDossierQuery(selected?.slug ?? null, locale);
  const dossierMissing = isAxiosError(dossierQuery.error) && dossierQuery.error.response?.status === 404;
  const dossierError = Boolean(selected && dossierQuery.isError && !dossierMissing);
  const selectedProject = selected
    ? mergeDossierProject(selected, dossierMissing ? null : dossierQuery.data ?? null)
    : null;

  return (
    <div className="container-custom pb-16 pt-28 md:pt-32">
      <header className="max-w-3xl">
        <span className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.24em] text-gray-400 dark:text-dark-400">
          <span className="h-px w-5 bg-primary-400/60" aria-hidden="true" />
          <span className="text-primary-600 dark:text-primary-400">//</span> {tr ? "Arşiv" : "Archive"}
        </span>
        <ScrambleHeading
          as="h1"
          text={tr ? "Proje indeksi" : "Project index"}
          className="mt-3.5 font-display text-4xl font-bold tracking-tight text-gray-900 dark:text-dark-50 md:text-5xl"
        />
        <p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-dark-300">
          {tr
            ? "Ürün olgunluğu, teknik derinlik ve teslim sorumluluğunu temsil eden seçili mühendislik çalışmaları. Tam vaka için herhangi bir girişi açın."
            : "Selected engineering work representing product maturity, technical depth, and delivery ownership. Open any entry for the full case."}
        </p>
      </header>

      {/* project index */}
      <section className="mt-20">
        <NxSectionHead
          index="//"
          label={tr ? "İndeks" : "Index"}
          title={tr ? "Tüm sistemler" : "All systems"}
          subtitle={
            tr
              ? "Numaralı proje girişleri. Mimari, kararlar, gelişim kaydı ve galeri içeren tam dosya için herhangi bir satıra tıkla."
              : "Numbered project entries. Click any row for the full dossier — architecture, decisions, log, gallery."
          }
        />
        {isLoading ? (
          <p role="status" className="border-t border-gray-200 py-8 text-center font-mono text-xs uppercase tracking-[0.16em] text-gray-500 dark:border-dark-600 dark:text-dark-400">
            {tr ? "Proje indeksi yükleniyor..." : "Loading project index..."}
          </p>
        ) : isError ? (
          <div role="alert" className="border-t border-gray-200 py-8 text-center dark:border-dark-600">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-red-500">
              {tr ? "Proje indeksi yüklenemedi." : "Project index is unavailable."}
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-4 rounded border border-primary-400/50 px-4 py-2 font-mono text-xs uppercase tracking-wide text-primary-600 transition hover:bg-primary-400/10 dark:text-primary-400"
            >
              {tr ? "Tekrar dene" : "Try again"}
            </button>
          </div>
        ) : dossierProjects.length ? (
          <ProjectIndex projects={dossierProjects} onSelect={setSelected} featuredLabel={labels.featured} />
        ) : (
          <p className="border-t border-gray-200 py-8 text-center font-mono text-xs uppercase tracking-[0.16em] text-gray-500 dark:border-dark-600 dark:text-dark-400">
            {tr ? "Henüz proje bulunmuyor." : "No projects found yet."}
          </p>
        )}
      </section>

      <ProjectDossierModal
        project={selectedProject}
        onClose={() => setSelected(null)}
        labels={labels}
        dossierLoading={Boolean(selected && dossierQuery.isLoading)}
        dossierError={dossierError}
        onRetryDossier={() => void dossierQuery.refetch()}
      />
    </div>
  );
}
