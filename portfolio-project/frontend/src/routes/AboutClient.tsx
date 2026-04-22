"use client";

import About from "@/routes/About";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AboutClient() {
  const { language } = useLanguage();

  return <About locale={language} />;
}
