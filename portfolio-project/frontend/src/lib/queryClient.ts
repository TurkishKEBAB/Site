import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 30,   // 30 min — portfolio data rarely changes
      gcTime: 1000 * 60 * 60,      // 1 hour — unused cache cleanup
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
