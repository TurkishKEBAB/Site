import { useQuery } from '@tanstack/react-query'
import { experienceService } from '../services'

interface UseExperiencesParams {
  skip?: number
  limit?: number
  experience_type?: string
  language?: string
}

export function useExperiences(params: UseExperiencesParams = {}) {
  return useQuery({
    queryKey: ['experiences', params],
    queryFn: () => experienceService.getExperiences(params),
  })
}
