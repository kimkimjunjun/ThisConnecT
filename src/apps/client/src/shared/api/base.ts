import * as Sentry from '@sentry/react'
import axios, { isAxiosError } from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { toast } from 'sonner'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { END_POINT } from './endpoint'

// AuthResponse: refresh / 소셜 콜백 / 게스트 로그인 공통 응답 구조
export type AuthResponse = {
  accessToken: string
  nickname: string
  role: string
}

// publicApi: 인증 불필요 (소셜 콜백, 게스트 로그인, 토큰 갱신)
// privateApi: 인증 필요 (request interceptor로 Authorization 헤더 자동 주입)
// baseURL은 비워 둠 → 브라우저 상대 경로 → Next.js rewrite proxy 경유 → 쿠키 same-origin
// 두 인스턴스 모두 withCredentials: true (refresh_token 쿠키 전송 필요)
export const publicApi = axios.create({
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

export const privateApi = axios.create({
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

// subscriber 패턴: 토큰 갱신 중 들어온 요청을 대기 큐에 쌓고 갱신 완료 후 일괄 재시도
let isRefreshing = false
let refreshSubscribers: ((token: string | null) => void)[] = []

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

// refresh 실패 시 대기 큐를 null로 비워 영구 pending / 메모리 누수 방지
const onRefreshFailed = () => {
  refreshSubscribers.forEach((cb) => cb(null))
  refreshSubscribers = []
}

// request interceptor: Authorization 헤더 주입 + FormData 시 Content-Type 위임
privateApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState()
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
    if (config.data instanceof FormData) delete config.headers['Content-Type']
    return config
  },
  (error: AxiosError) => Promise.reject(error),
)

// response interceptor: 401 → refresh → 재시도, 그 외 에러 분류 처리
privateApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // 갱신 중이면 대기 큐에 추가
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshSubscribers.push((token: string | null) => {
            // refresh 실패 시 null → 원본 에러로 reject (영구 pending 방지)
            if (!token) {
              reject(error)
              return
            }
            // 큐 경유 재시도 요청에도 _retry 설정 → 재시도 401 시 무한 루프 차단
            originalRequest._retry = true
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(privateApi(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // 쿠키 기반 refresh: withCredentials로 refresh_token 쿠키 자동 전송, body 없음
        const { data } = await publicApi.post<AuthResponse>(END_POINT.AUTH.REFRESH)
        useAuthStore.getState().setAuth(data)
        onRefreshed(data.accessToken)
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return privateApi(originalRequest)
      } catch (refreshError) {
        // 대기 큐를 null로 비워 pending 요청을 reject (BLOCK 1)
        onRefreshFailed()
        // 401: 실제 토큰 만료 → 강제 로그아웃
        // 5xx/timeout/네트워크: 일시적 실패 → 로그아웃 방지, Sentry만 기록
        const isAuthFailure =
          isAxiosError(refreshError) && refreshError.response?.status === 401
        if (isAuthFailure) {
          useAuthStore.getState().clearAuth()
          if (typeof window !== 'undefined') window.location.href = '/'
        } else {
          Sentry.captureException(refreshError, { tags: { source: 'token-refresh' } })
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // 타임아웃
    if (isAxiosError(error) && error.code === 'ECONNABORTED') {
      toast.error('요청 시간이 초과되었습니다.')
      return Promise.reject(error)
    }

    // 네트워크 단절 (response 없음, timeout 아님)
    if (isAxiosError(error) && !error.response) {
      toast.error('네트워크 연결을 확인해 주세요.')
      return Promise.reject(error)
    }

    // 5xx 서버 에러 → Sentry
    if (error.response?.status && error.response.status >= 500) {
      Sentry.captureException(error, {
        extra: {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response.status,
        },
      })
    }

    return Promise.reject(error)
  },
)

// 하위 호환: isTokenExpired는 chat 훅(useRoom.ts)에서 사용 중이므로 유지
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

// 하위 호환: getStoredToken은 chat-api.ts(STOMP)에서 사용 중이므로 유지
export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('auth')
    return raw ? (JSON.parse(raw)?.state?.accessToken ?? null) : null
  } catch {
    return null
  }
}

// 하위 호환: tryRefresh는 STOMP 연결 직전(useRoom.ts)에서 만료 토큰 선제 갱신용으로 사용
// 쿠키 기반 refresh를 publicApi로 수행하고 갱신된 accessToken을 반환
export const tryRefresh = async (): Promise<string | null> => {
  try {
    const { data } = await publicApi.post<AuthResponse>(END_POINT.AUTH.REFRESH)
    useAuthStore.getState().setAuth(data)
    return data.accessToken
  } catch {
    return null
  }
}
