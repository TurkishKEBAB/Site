import type { Metadata } from "next";

import Home from "@/routes/Home";
import { getRequestLocale } from "@/lib/locale";
import { buildMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildMetadata("home", locale, "/");
}

export default async function HomePage() {
  const locale = await getRequestLocale();

  return <Home locale={locale} />;
}
