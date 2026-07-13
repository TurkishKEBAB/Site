import type { DossierProject } from "@/components/nexus/ProjectDossierModal";
import { projectDetails } from "@/content/projectDetails";
import { getLocaleValue, projectRecords, type Locale } from "@/content/site";
import type { Project } from "@/services/types";

export function mapProjectsToDossierProjects(projects: Project[], locale: Locale): DossierProject[] {
  return projects.map((project) => {
    const curatedProject = projectRecords.find((record) => record.slug === project.slug);

    return {
      slug: project.slug,
      title: project.title,
      summary: project.short_description?.trim() || project.description,
      description: project.description,
      impact: curatedProject ? getLocaleValue(curatedProject.impact, locale) : "",
      technologies: (project.technologies || []).map((technology) => technology.name),
      featured: project.featured,
      details: projectDetails[project.slug],
    };
  });
}
