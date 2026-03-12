import { useQuery } from '@tanstack/react-query'
import { skillService } from '../services'

export function useSkills(language?: string) {
  return useQuery({
    queryKey: ['skills', language],
    queryFn: () => skillService.getSkills(language),
  })
}
