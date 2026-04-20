import HomeClient from "@/routes/HomeClient";
import { defaultLocale } from "@/content/site";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata("home", defaultLocale, "/");

export default function HomePage() {
  return <HomeClient />;
}
