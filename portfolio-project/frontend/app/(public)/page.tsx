import HomeClient from "@/routes/HomeClient";
import { defaultLocale } from "@/content/site";
import { buildMetadata, buildPersonJsonLd } from "@/lib/metadata";
import {
  fetchGitHubContributions,
  fetchGitHubStats,
  fetchWakaTimeStats,
} from "@/lib/systemProfile";

export const metadata = buildMetadata("home", defaultLocale, "/");

export default async function HomePage() {
  const personJsonLd = buildPersonJsonLd(defaultLocale);

  const [waka, github, contributions] = await Promise.all([
    fetchWakaTimeStats(),
    fetchGitHubStats(),
    fetchGitHubContributions(),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <HomeClient waka={waka} github={github} contributions={contributions} />
    </>
  );
}
