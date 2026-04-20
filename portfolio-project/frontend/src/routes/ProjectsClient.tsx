"use client";

import Projects from "@/routes/Projects";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ProjectsClient() {
  const { language } = useLanguage();

  return <Projects locale={language} />;
}
