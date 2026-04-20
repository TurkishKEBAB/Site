"use client";

import Contact from "@/routes/Contact";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ContactClient() {
  const { language } = useLanguage();

  return <Contact locale={language} />;
}
