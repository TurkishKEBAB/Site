import { useQuery } from '@tanstack/react-query'
import { blogService } from '../services'
import { blogKeys } from '../lib/queryKeys'

interface UseBlogPostsParams {
  skip?: number
  limit?: number
  tag?: string
  published_only?: boolean
  language?: string
}

export function useBlogPosts(params: UseBlogPostsParams = {}) {
  return useQuery({
    queryKey: blogKeys.list(params),
    queryFn: () => blogService.getPosts(params),
  })
}

export function useBlogPost(slug: string, language?: string) {
  return useQuery({
    queryKey: blogKeys.detail(slug, language),
    queryFn: () => blogService.getPost(slug, language),
    enabled: !!slug,
  })
}
