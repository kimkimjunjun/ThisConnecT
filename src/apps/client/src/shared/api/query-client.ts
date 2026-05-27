import { QueryClient } from '@tanstack/react-query'
import { cache } from 'react'

// cache()로 요청당 단일 인스턴스 보장 (서버 전용)
export const getQueryClient = cache(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          gcTime: 5 * 60 * 1000,
          retry: 1,
          refetchOnWindowFocus: false,
        },
      },
    }),
)
