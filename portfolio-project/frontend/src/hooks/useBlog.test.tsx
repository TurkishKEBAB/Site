import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useBlogPosts, useBlogPost } from './useBlog'

// ─── Mock the services barrel (prevents api.ts VITE_API_BASE_URL throw) ────────
const mockGetPosts = vi.fn()
const mockGetPost = vi.fn()

vi.mock('../services', () => ({
  blogService: {
    getPosts: (...args: unknown[]) => mockGetPosts(...args),
    getPost: (...args: unknown[]) => mockGetPost(...args),
  },
}))

// ─── Test helpers ─────────────────────────────────────────────────────────────
function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        // Suppress "no window" error in jsdom during query fetch
        gcTime: 0,
      },
    },
  })

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('useBlogPosts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts in loading state', () => {
    mockGetPosts.mockReturnValue(new Promise(() => {})) // never resolves

    const { result } = renderHook(() => useBlogPosts(), {
      wrapper: makeWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })

  it('returns data on successful fetch', async () => {
    const mockData = {
      items: [
        {
          id: '1',
          slug: 'hello-world',
          title: 'Hello World',
          content: '',
          excerpt: '',
          is_published: true,
          views: 0,
          reading_time: 3,
          is_featured: false,
          created_at: '2024-01-01T00:00:00Z',
          tags: [],
        },
      ],
      total: 1,
      skip: 0,
      limit: 10,
    }
    mockGetPosts.mockResolvedValueOnce(mockData)

    const { result } = renderHook(() => useBlogPosts(), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockData)
  })

  it('exposes error state when fetch fails', async () => {
    mockGetPosts.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useBlogPosts(), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeInstanceOf(Error)
  })
})

describe('useBlogPost', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('is disabled when slug is empty', () => {
    const { result } = renderHook(() => useBlogPost(''), {
      wrapper: makeWrapper(),
    })

    // enabled: !!slug => false when slug is ''
    expect(result.current.isFetching).toBe(false)
    expect(mockGetPost).not.toHaveBeenCalled()
  })

  it('fetches post when slug is provided', async () => {
    const mockPost = {
      id: '1',
      slug: 'my-post',
      title: 'My Post',
      content: 'Content',
      excerpt: 'Excerpt',
      is_published: true,
      views: 42,
      reading_time: 5,
      is_featured: false,
      created_at: '2024-01-01T00:00:00Z',
      tags: [],
    }
    mockGetPost.mockResolvedValueOnce(mockPost)

    const { result } = renderHook(() => useBlogPost('my-post'), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockPost)
    expect(mockGetPost).toHaveBeenCalledWith('my-post', undefined)
  })
})
