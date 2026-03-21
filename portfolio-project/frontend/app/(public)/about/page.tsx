import type { Metadata } from "next";

import About from "@/routes/About";
import { getRequestLocale } from "@/lib/locale";
import { buildMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildMetadata("about", locale, "/about");
}

export default async function AboutPage() {
  const locale = await getRequestLocale();

  return <About locale={locale} />;
}
