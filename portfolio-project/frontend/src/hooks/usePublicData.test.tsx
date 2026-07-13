import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  useBlogPostsQuery,
  useExperiencesQuery,
  useProjectsQuery,
  useSkillsQuery,
} from "@/hooks/usePublicData";
import { blogService } from "@/services/blogService";
import { experienceService } from "@/services/experienceService";
import { projectService } from "@/services/projectService";
import { skillService } from "@/services/skillService";
import type {
  BlogPost,
  Experience,
  PaginatedResponse,
  Project,
  Skill,
} from "@/services/types";

vi.mock("@/services/blogService", () => ({
  blogService: {
    getPosts: vi.fn(),
  },
}));

vi.mock("@/services/experienceService", () => ({
  experienceService: {
    getExperiences: vi.fn(),
  },
}));

vi.mock("@/services/projectService", () => ({
  projectService: {
    getProjects: vi.fn(),
  },
}));

vi.mock("@/services/skillService", () => ({
  skillService: {
    getSkills: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
};

const emptyPage = <T,>(items: T[]): PaginatedResponse<T> => ({
  items,
  total: items.length,
  page: 1,
  size: 10,
  pages: 1,
});

describe("public data query hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads projects with the provided list params", async () => {
    const params = { featured_only: true, language: "en" };
    const payload = emptyPage<Project>([]);
    vi.mocked(projectService.getProjects).mockResolvedValue(payload);

    const { result } = renderHook(() => useProjectsQuery(params), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(projectService.getProjects).toHaveBeenCalledWith(params);
    expect(result.current.data).toBe(payload);
  });

  it("loads blog posts with the provided list params", async () => {
    const params = { limit: 3, published_only: true, language: "tr" };
    const payload = emptyPage<BlogPost>([]);
    vi.mocked(blogService.getPosts).mockResolvedValue(payload);

    const { result } = renderHook(() => useBlogPostsQuery(params), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(blogService.getPosts).toHaveBeenCalledWith(params);
    expect(result.current.data).toBe(payload);
  });

  it("loads skills with the selected language", async () => {
    const payload: Skill[] = [
      {
        id: "skill-1",
        name: "TypeScript",
        category: "Frontend",
        domain: "product",
        ring: "adopt",
        display_order: 1,
      },
    ];
    vi.mocked(skillService.getSkills).mockResolvedValue(payload);

    const { result } = renderHook(() => useSkillsQuery("en"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(skillService.getSkills).toHaveBeenCalledWith("en");
    expect(result.current.data).toBe(payload);
  });

  it("loads experiences with the provided list params", async () => {
    const params = { experience_type: "work", language: "en" };
    const payload: Experience[] = [
      {
        id: "experience-1",
        title: "Developer",
        organization: "Example",
        experience_type: "work",
        start_date: "2024-01-01",
        is_current: true,
        display_order: 1,
        translations: [],
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
    ];
    vi.mocked(experienceService.getExperiences).mockResolvedValue(payload);

    const { result } = renderHook(() => useExperiencesQuery(params), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(experienceService.getExperiences).toHaveBeenCalledWith(params);
    expect(result.current.data).toBe(payload);
  });
});
