import type { Metadata } from "next";

import Contact from "@/routes/Contact";
import { getRequestLocale } from "@/lib/locale";
import { buildMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildMetadata("contact", locale, "/contact");
}

export default async function ContactPage() {
  const locale = await getRequestLocale();

  return <Contact locale={locale} />;
}
