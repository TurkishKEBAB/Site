import ProjectsClient from "@/routes/ProjectsClient";
import { defaultLocale } from "@/content/site";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata("projects", defaultLocale, "/projects");

export default function ProjectsPage() {
  return <ProjectsClient />;
}
