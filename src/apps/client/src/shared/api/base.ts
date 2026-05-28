import { env } from '@/shared/config'

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

const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('auth')
    return raw ? (JSON.parse(raw)?.state?.accessToken ?? null) : null
  } catch {
    return null
  }
}

const tryRefresh = (): Promise<string | null> => {
  if (isRefreshing) return pendingRefresh!

  isRefreshing = true
  pendingRefresh = (async () => {
    try {
      const res = await fetch(`${env.API_BASE_URL}/api/auth/refresh`, {
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

export const fetchAPI = async <T>(
  path: string,
  options?: RequestInit,
): Promise<T> => {
  const token = getStoredToken()
  const res = await fetch(`${env.API_BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(token, options?.headers),
  })

  if (res.status === 401 && typeof window !== 'undefined') {
    const newToken = await tryRefresh()

    if (newToken) {
      const retry = await fetch(`${env.API_BASE_URL}${path}`, {
        ...options,
        headers: buildHeaders(newToken, options?.headers),
      })
      if (!retry.ok) {
        throw new ApiError(retry.status, `${retry.status} ${retry.statusText}`)
      }
      return retry.json() as Promise<T>
    }

    const { useAuthStore } = await import('@/features/auth/store/auth-store')
    useAuthStore.getState().clearAuth()
    throw new ApiError(401, 'Unauthorized')
  }

  if (!res.ok) {
    throw new ApiError(res.status, `${res.status} ${res.statusText}`)
  }

  return res.json() as Promise<T>
}
