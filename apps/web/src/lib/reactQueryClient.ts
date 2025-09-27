import { QueryClient } from '@tanstack/react-query'

/**
 * React Query Client
 * @description Refetch on window focus is disabled
 */
export const reactQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})
