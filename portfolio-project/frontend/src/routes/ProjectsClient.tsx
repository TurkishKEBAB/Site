"use client";

import Projects from "@/routes/Projects";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Locale } from "@/content/site";
import type { PaginatedResponse, ProjectListItem } from "@/services/types";

interface ProjectsClientProps {
  initialProjects?: PaginatedResponse<ProjectListItem> | null;
  initialProjectsLanguage: Locale;
}

export default function ProjectsClient({
  initialProjects,
  initialProjectsLanguage,
}: ProjectsClientProps) {
  const { language } = useLanguage();

  return (
    <Projects
      locale={language}
      initialProjects={initialProjects}
      initialProjectsLanguage={initialProjectsLanguage}
    />
  );
}
