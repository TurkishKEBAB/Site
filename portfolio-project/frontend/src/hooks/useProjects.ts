import { useQuery } from '@tanstack/react-query'
import { projectService } from '../services'

interface UseProjectsParams {
  skip?: number
  limit?: number
  featured_only?: boolean
  technology_slug?: string
  language?: string
}

export function useProjects(params: UseProjectsParams = {}) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => projectService.getProjects(params),
  })
}

export function useFeaturedProjects(language: string) {
  return useQuery({
    queryKey: ['projects', 'featured', language],
    queryFn: () =>
      projectService.getProjects({ featured_only: true, limit: 3, language }),
  })
}

export function useProject(slug: string, language?: string) {
  return useQuery({
    queryKey: ['project', slug, language],
    queryFn: () => projectService.getProject(slug, language),
    enabled: !!slug,
  })
}
