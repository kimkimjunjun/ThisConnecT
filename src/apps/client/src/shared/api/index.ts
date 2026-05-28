export { fetchAPI, ApiError } from './base'
export { getQueryClient } from './query-client'
export { createQuery } from './create-query'
export type { QueryOverrides } from './create-query'
// PrefetchBoundary는 server-only이므로 배럴에서 제외 — 직접 import 사용:
// import { PrefetchBoundary } from '@/shared/api/prefetch'
