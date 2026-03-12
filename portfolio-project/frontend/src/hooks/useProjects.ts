import { useQuery } from '@tanstack/react-query'
import { projectService } from '../services'
import { projectKeys } from '../lib/queryKeys'

interface UseProjectsParams {
  skip?: number
  limit?: number
  featured_only?: boolean
  technology_slug?: string
  language?: string
}

export function useProjects(params: UseProjectsParams = {}) {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: () => projectService.getProjects(params),
  })
}

export function useFeaturedProjects(language: string) {
  return useQuery({
    queryKey: projectKeys.featured(language),
    queryFn: () =>
      projectService.getProjects({ featured_only: true, limit: 3, language }),
  })
}

export function useProject(slug: string, language?: string) {
  return useQuery({
    queryKey: projectKeys.detail(slug, language),
    queryFn: () => projectService.getProject(slug, language),
    enabled: !!slug,
  })
}
