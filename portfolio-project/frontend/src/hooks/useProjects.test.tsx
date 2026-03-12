import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useProjects, useProject, useFeaturedProjects } from './useProjects'

// ─── Mock the services barrel ─────────────────────────────────────────────────
const mockGetProjects = vi.fn()
const mockGetProject = vi.fn()

vi.mock('../services', () => ({
  projectService: {
    getProjects: (...args: unknown[]) => mockGetProjects(...args),
    getProject: (...args: unknown[]) => mockGetProject(...args),
  },
}))

// ─── Test helpers ─────────────────────────────────────────────────────────────
function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  })

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('useProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts in loading state', () => {
    mockGetProjects.mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useProjects(), {
      wrapper: makeWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
  })

  it('returns paginated project data on success', async () => {
    const mockData = {
      items: [
        {
          id: '1',
          slug: 'portfolio',
          title: 'Portfolio',
          short_description: 'My portfolio',
          description: 'A full-stack portfolio site',
          featured: true,
          display_order: 1,
          project_technologies: [],
          images: [],
          translations: [],
        },
      ],
      total: 1,
      skip: 0,
      limit: 10,
    }
    mockGetProjects.mockResolvedValueOnce(mockData)

    const { result } = renderHook(() => useProjects(), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockData)
  })

  it('exposes error state when fetch fails', async () => {
    mockGetProjects.mockRejectedValueOnce(new Error('Server error'))

    const { result } = renderHook(() => useProjects(), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('passes params to the service call', async () => {
    mockGetProjects.mockResolvedValueOnce({ items: [], total: 0, skip: 0, limit: 3 })

    const { result } = renderHook(
      () => useProjects({ featured_only: true, limit: 3, language: 'en' }),
      { wrapper: makeWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockGetProjects).toHaveBeenCalledWith({
      featured_only: true,
      limit: 3,
      language: 'en',
    })
  })
})

describe('useProject', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('is disabled when slug is empty', () => {
    const { result } = renderHook(() => useProject(''), {
      wrapper: makeWrapper(),
    })

    expect(result.current.isFetching).toBe(false)
    expect(mockGetProject).not.toHaveBeenCalled()
  })

  it('fetches a single project by slug', async () => {
    const mockProject = {
      id: '1',
      slug: 'portfolio',
      title: 'Portfolio',
      short_description: 'Short',
      description: 'Full description',
      featured: true,
      display_order: 1,
      project_technologies: [],
      images: [],
      translations: [],
    }
    mockGetProject.mockResolvedValueOnce(mockProject)

    const { result } = renderHook(() => useProject('portfolio'), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockProject)
    expect(mockGetProject).toHaveBeenCalledWith('portfolio', undefined)
  })
})

describe('useFeaturedProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches featured projects filtered by language', async () => {
    const mockData = { items: [], total: 0, skip: 0, limit: 3 }
    mockGetProjects.mockResolvedValueOnce(mockData)

    const { result } = renderHook(() => useFeaturedProjects('en'), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockGetProjects).toHaveBeenCalledWith({
      featured_only: true,
      limit: 3,
      language: 'en',
    })
  })
})
