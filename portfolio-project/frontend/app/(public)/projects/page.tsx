import type { Metadata } from "next";

import Projects from "@/routes/Projects";
import { getRequestLocale } from "@/lib/locale";
import { buildMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildMetadata("projects", locale, "/projects");
}

export default async function ProjectsPage() {
  const locale = await getRequestLocale();

  return <Projects locale={locale} />;
}
