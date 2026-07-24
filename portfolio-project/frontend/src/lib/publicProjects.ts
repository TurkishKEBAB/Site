import type { Locale } from "@/content/site";
import type { PaginatedResponse, ProjectListItem } from "@/services/types";

const REVALIDATE_SECONDS = 60;

const getApiBaseUrl = () =>
  (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1").replace(/\/$/, "");

export async function fetchPublicProjects(
  language: Locale = "en",
): Promise<PaginatedResponse<ProjectListItem> | null> {
  const searchParams = new URLSearchParams({ limit: "100", language });

  try {
    const response = await fetch(`${getApiBaseUrl()}/projects?${searchParams.toString()}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as PaginatedResponse<ProjectListItem>;
  } catch (error) {
    console.error("Failed to fetch public projects", error);
    return null;
  }
}
