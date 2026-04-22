import AnimatedSection from "@/components/AnimatedSection";
import ProjectExplorer, { type LocalizedProjectView } from "@/components/ProjectExplorer";
import { SectionHeading } from "@/components/ui";
import { getLocaleValue, projectRecords, type Locale } from "@/content/site";

interface ProjectsPageProps {
  locale: Locale;
}

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

