import { env } from '@/shared/config'
import { END_POINT } from './endpoint'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

let isRefreshing = false
let pendingRefresh: Promise<string | null> | null = null

// 브라우저: 상대 경로 사용 → Next.js 프록시(/api/*) 경유 → 쿠키 same-origin 보장
// 서버: 절대 URL 사용 → 백엔드 직접 호출
const getApiBase = () => (typeof window !== 'undefined' ? '' : env.API_BASE_URL)

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('auth')
    return raw ? (JSON.parse(raw)?.state?.accessToken ?? null) : null
  } catch {
    return null
  }
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

export const tryRefresh = (): Promise<string | null> => {
  if (isRefreshing) return pendingRefresh!

  isRefreshing = true
  pendingRefresh = (async () => {
    try {
      const res = await fetch(`${getApiBase()}${END_POINT.AUTH.REFRESH}`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) return null

      const data = await res.json()
      const { useAuthStore } = await import('@/features/auth/store/auth-store')
      useAuthStore.getState().setAuth(data)
      return data.accessToken as string
    } catch {
      return null
    } finally {
      isRefreshing = false
      pendingRefresh = null
    }
  })()

  return pendingRefresh
}

const buildHeaders = (
  token: string | null,
  extra?: RequestInit['headers'],
): Record<string, string> => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
  ...(extra as Record<string, string> | undefined),
})

const parseResponse = async <T>(res: Response): Promise<T> => {
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T
  }
  return res.json() as Promise<T>
}

export const fetchAPI = async <T>(
  path: string,
  options?: RequestInit,
): Promise<T> => {
  const token = getStoredToken()
  const res = await fetch(`${getApiBase()}${path}`, {
    ...options,
    headers: buildHeaders(token, options?.headers),
  })

  if (res.status === 401 && typeof window !== 'undefined') {
    const newToken = await tryRefresh()

    if (newToken) {
      const retry = await fetch(`${getApiBase()}${path}`, {
        ...options,
        headers: buildHeaders(newToken, options?.headers),
      })
      if (!retry.ok) {
        throw new ApiError(retry.status, `${retry.status} ${retry.statusText}`)
      }
      return parseResponse<T>(retry)
    }

    const { useAuthStore } = await import('@/features/auth/store/auth-store')
    useAuthStore.getState().clearAuth()
    throw new ApiError(401, 'Unauthorized')
  }

  if (!res.ok) {
    throw new ApiError(res.status, `${res.status} ${res.statusText}`)
  }

  return parseResponse<T>(res)
}
