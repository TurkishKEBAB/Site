"use client";

import Home from "@/routes/Home";
import { useLanguage } from "@/contexts/LanguageContext";
import type {
  GitHubContributions,
  GitHubStats,
  WakaTimeStats,
} from "@/lib/systemProfile";

interface HomeClientProps {
  waka: WakaTimeStats | null;
  github: GitHubStats | null;
  contributions: GitHubContributions | null;
}

export default function HomeClient({ waka, github, contributions }: Readonly<HomeClientProps>) {
  const { language } = useLanguage();

  return (
    <Home
      locale={language}
      waka={waka}
      github={github}
      contributions={contributions}
    />
  );
}
