import ProjectsClient from "@/routes/ProjectsClient";
import { defaultLocale } from "@/content/site";
import { buildMetadata } from "@/lib/metadata";
import { fetchPublicProjects } from "@/lib/publicProjects";

export const metadata = buildMetadata("projects", defaultLocale, "/projects");

export default async function ProjectsPage() {
  const initialProjects = await fetchPublicProjects(defaultLocale);

  return (
    <ProjectsClient
      initialProjects={initialProjects}
      initialProjectsLanguage={defaultLocale}
    />
  );
}
