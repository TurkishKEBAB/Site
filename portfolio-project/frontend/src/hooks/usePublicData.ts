import { useQuery } from "@tanstack/react-query";

import { blogService } from "@/services/blogService";
import { experienceService } from "@/services/experienceService";
import { projectService } from "@/services/projectService";
import { skillService } from "@/services/skillService";
import { queryKeys } from "@/lib/query/queryKeys";

export type ProjectListParams = Parameters<typeof projectService.getProjects>[0];
export type BlogListParams = Parameters<typeof blogService.getPosts>[0];
export type ExperienceListParams = Parameters<
  typeof experienceService.getExperiences
>[0];

export function useProjectsQuery(params?: ProjectListParams) {
  return useQuery({
    queryKey: queryKeys.projects.list(params),
    queryFn: () => projectService.getProjects(params),
  });
}

export function useBlogPostsQuery(params?: BlogListParams) {
  return useQuery({
    queryKey: queryKeys.blog.list(params),
    queryFn: () => blogService.getPosts(params),
  });
}

export function useSkillsQuery(language?: string) {
  return useQuery({
    queryKey: queryKeys.skills.list({ language }),
    queryFn: () => skillService.getSkills(language),
  });
}

export function useExperiencesQuery(params?: ExperienceListParams) {
  return useQuery({
    queryKey: queryKeys.experiences.list(params),
    queryFn: () => experienceService.getExperiences(params),
  });
}
