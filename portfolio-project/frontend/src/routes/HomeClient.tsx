"use client";

import Home from "@/routes/Home";
import { useLanguage } from "@/contexts/LanguageContext";

export default function HomeClient() {
  const { language } = useLanguage();

  return <Home locale={language} />;
}
