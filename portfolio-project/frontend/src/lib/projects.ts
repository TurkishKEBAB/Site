import type { DossierProject } from "@/lib/dossier";
import { toDossierProject } from "@/lib/dossier";
import type { Locale } from "@/content/site";
import type { Project } from "@/services/types";

export function mapProjectsToDossierProjects(projects: Project[], locale: Locale): DossierProject[] {
  return projects.map((project) => toDossierProject(project, null, locale));
}
