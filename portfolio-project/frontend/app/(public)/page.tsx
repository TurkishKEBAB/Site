import HomeClient from "@/routes/HomeClient";
import { defaultLocale } from "@/content/site";
import { buildMetadata, buildPersonJsonLd } from "@/lib/metadata";

export const metadata = buildMetadata("home", defaultLocale, "/");

export default function HomePage() {
  const personJsonLd = buildPersonJsonLd(defaultLocale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <HomeClient />
    </>
  );
}
