import { FiArrowRight } from "react-icons/fi";

import NxSectionHead from "@/components/nexus/NxSectionHead";
import ScrambleHeading from "@/components/nexus/ScrambleHeading";
import ProjectExplorer, { type LocalizedProjectView } from "@/components/ProjectExplorer";
import { getLocaleValue, projectRecords, type Locale } from "@/content/site";

interface ProjectsPageProps {
  locale: Locale;
}

interface ArchNode {
  kind: string;
  title: string;
  sub: string;
}

const archTiers = (tr: boolean): ArchNode[][] => [
  [
    { kind: tr ? "Istemci" : "Client", title: tr ? "Masaustu" : "Desktop", sub: tr ? "PyQt6 · ~1.000 kullanici" : "PyQt6 · ~1,000 users" },
    { kind: tr ? "Istemci" : "Client", title: "Web", sub: "Next.js · JWT" },
  ],
  [{ kind: "Gateway", title: "FastAPI", sub: "REST · JWT / RBAC" }],
  [{ kind: tr ? "Cekirdek" : "Core", title: "Scheduling Engine", sub: "13 algorithms · 86.97% cov" }],
  [
    { kind: tr ? "Veri" : "Data", title: "PostgreSQL", sub: tr ? "birincil depo" : "primary store" },
    { kind: "Cache", title: "Redis", sub: tr ? "oturum · kuyruk" : "sessions · queue" },
    { kind: "Worker", title: "Celery", sub: tr ? "async isler" : "async jobs" },
  ],
];

export default function Projects({ locale }: ProjectsPageProps) {
  const tr = locale === "tr";
  const tiers = archTiers(tr);

  const localizedProjects: LocalizedProjectView[] = projectRecords.map((project) => ({
    slug: project.slug,
    title: getLocaleValue(project.title, locale),
    summary: getLocaleValue(project.summary, locale),
    description: getLocaleValue(project.description, locale),
    impact: getLocaleValue(project.impact, locale),
    technologies: project.technologies,
    githubUrl: project.githubUrl,
    demoUrl: project.demoUrl,
    featured: project.featured,
  }));

  return (
    <div className="container-custom pb-16 pt-28 md:pt-32">
      <header className="max-w-3xl">
        <span className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.24em] text-gray-400 dark:text-dark-400">
          <span className="h-px w-5 bg-primary-400/60" aria-hidden="true" />
          <span className="text-primary-500 dark:text-primary-400">//</span> {tr ? "Arsiv" : "Archive"}
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

      {/* system map */}
      <section className="mt-16">
        <NxSectionHead
          index="//"
          label={tr ? "Sistem haritasi" : "System map"}
          title="IsikSchedule architecture"
          subtitle={
            tr
              ? "Masaustu ve web'i besleyen tek bir scheduling cekirdegi. Vurgulamak icin bir servisin uzerine gel."
              : "One shared scheduling core powering desktop & web. Hover a service to highlight it."
          }
        />
        <div className="flex items-stretch gap-0 overflow-x-auto pb-3 pt-1">
          {tiers.map((tier, tierIndex) => (
            <div key={tier.map((node) => node.title).join("-")} className="flex items-stretch">
              <div className="flex min-w-[150px] flex-col justify-center gap-3">
                {tier.map((node) => (
                  <div
                    key={`${node.kind}-${node.title}`}
                    className="rounded border border-gray-200 bg-white p-3.5 transition-all hover:-translate-y-0.5 hover:border-primary-400/40 hover:shadow-[0_0_24px_rgba(0,212,255,0.06)] dark:border-dark-600 dark:bg-dark-800/60"
                  >
                    <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-primary-500 dark:text-primary-400">
                      {node.kind}
                    </div>
                    <div className="mt-1.5 font-display text-[15px] font-semibold text-gray-900 dark:text-dark-50">
                      {node.title}
                    </div>
                    <div className="mt-1 text-[11.5px] text-gray-400 dark:text-dark-400">{node.sub}</div>
                  </div>
                ))}
              </div>
              {tierIndex < tiers.length - 1 && (
                <div className="flex flex-none items-center px-3.5 text-gray-400 dark:text-dark-400" aria-hidden="true">
                  <FiArrowRight size={22} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* project index */}
      <section className="mt-20">
        <NxSectionHead
          index="//"
          label={tr ? "Indeks" : "Index"}
          title={tr ? "Tum sistemler" : "All systems"}
          subtitle={
            tr
              ? "Numarali proje girisleri. Aciklama, etki ve stack icin herhangi bir satira tikla."
              : "Numbered project entries. Click any row for the description, impact, and stack."
          }
        />
        <ProjectExplorer locale={locale} projects={localizedProjects} />
      </section>
    </div>
  );
}
