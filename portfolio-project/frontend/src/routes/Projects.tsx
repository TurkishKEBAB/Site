import AnimatedSection from "@/components/AnimatedSection";
import ProjectExplorer, { type LocalizedProjectView } from "@/components/ProjectExplorer";
import { GlowBar, PanelCard, SectionHeading } from "@/components/ui";
import { getLocaleValue, projectRecords, type Locale } from "@/content/site";

interface ProjectsPageProps {
  locale: Locale;
}

const architectureNodes = [
  {
    label: "Clients",
    items: ["PyQt6 desktop", "Next.js web"],
  },
  {
    label: "API layer",
    items: ["FastAPI", "JWT/RBAC", "Admin flows"],
  },
  {
    label: "Scheduling core",
    items: ["13 algorithms", "Constraint engine", "Shared domain"],
  },
  {
    label: "Runtime",
    items: ["PostgreSQL", "Redis", "Celery", "Docker"],
  },
];

export default function Projects({ locale }: ProjectsPageProps) {
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
    <div className="pt-24 md:pt-32 pb-16">
      <div className="container-custom">
        <AnimatedSection className="mb-12">
          <span className="sys-label mb-3 block">// {locale === "tr" ? "ARSIV" : "ARCHIVE"}</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 dark:text-dark-50 tracking-tight mb-4">
            {locale === "tr" ? "Projeler" : "Projects"}
          </h1>
          <p className="text-lg text-gray-600 dark:text-dark-300 max-w-3xl">
            {locale === "tr"
              ? "Urun olgunlugu, teknik derinlik ve teslim sorumlulugunu gosteren secili muhendislik calismalari."
              : "Selected engineering work representing product maturity, technical depth, and delivery ownership."}
          </p>
        </AnimatedSection>

        <SectionHeading
          index="01"
          label={locale === "tr" ? "Sistem haritasi" : "System map"}
          title={locale === "tr" ? "IsikSchedule mimarisi" : "IsikSchedule architecture"}
          subtitle={
            locale === "tr"
              ? "Tek scheduling core, masaustu ve web yuzeylerini ayni domain kurallariyla besliyor."
              : "One scheduling core powers desktop and web surfaces with the same domain rules."
          }
        />

        <AnimatedSection className="mb-20">
          <PanelCard hover={false} className="overflow-hidden">
            <div className="grid gap-5 lg:grid-cols-[1fr,auto,1fr,auto,1fr,auto,1fr] lg:items-stretch">
              {architectureNodes.map((node, index) => (
                <div key={node.label} className="contents">
                  <div className="rounded border border-gray-200 bg-gray-50/80 p-4 dark:border-dark-600 dark:bg-dark-950/40">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary-600 dark:text-primary-400">
                      0{index + 1} / {node.label}
                    </span>
                    <div className="mt-4 space-y-2">
                      {node.items.map((item) => (
                        <div
                          key={item}
                          className="border-l border-primary-400/35 pl-3 font-mono text-xs uppercase tracking-wide text-gray-600 dark:text-dark-300"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                  {index < architectureNodes.length - 1 && (
                    <div className="flex items-center justify-center font-mono text-primary-600 dark:text-primary-400" aria-hidden="true">
                      -&gt;
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 rounded border border-primary-400/25 bg-primary-400/5 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary-600 dark:text-primary-400">
                // impact
              </p>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-dark-300">
                {locale === "tr"
                  ? "~1.000 masaustu kullanici, %86.97 coverage ve public web release icin hazir Dockerize runtime."
                  : "~1,000 desktop users, 86.97% coverage, and a Dockerized runtime prepared for the public web release."}
              </p>
            </div>
          </PanelCard>
        </AnimatedSection>

        <GlowBar className="mb-20" />

        <SectionHeading
          index="02"
          label={locale === "tr" ? "Secili projeler" : "Selected projects"}
          title={locale === "tr" ? "Detayli proje kesiti" : "Detailed project slice"}
          subtitle={
            locale === "tr"
              ? "Kartlar server-side geliyor; detay modali ve dis link etkilesimleri client island olarak calisiyor."
              : "Cards are rendered server-side; the detail modal and outbound interactions live in a client island."
          }
        />

        <ProjectExplorer locale={locale} projects={localizedProjects} />
      </div>
    </div>
  );
}

