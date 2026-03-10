import { useQuery } from '@tanstack/react-query'
import { blogService } from '../services'

interface UseBlogPostsParams {
  skip?: number
  limit?: number
  tag?: string
  published_only?: boolean
  language?: string
}

export function useBlogPosts(params: UseBlogPostsParams = {}) {
  return useQuery({
    queryKey: ['blogPosts', params],
    queryFn: () => blogService.getPosts(params),
  })
}

export function useBlogPost(slug: string, language?: string) {
  return useQuery({
    queryKey: ['blogPost', slug, language],
    queryFn: () => blogService.getPost(slug, language),
    enabled: !!slug,
  })
}
