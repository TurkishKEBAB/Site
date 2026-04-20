import AboutClient from "@/routes/AboutClient";
import { defaultLocale } from "@/content/site";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata("about", defaultLocale, "/about");

export default function AboutPage() {
  return <AboutClient />;
}
