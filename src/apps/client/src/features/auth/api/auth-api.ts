import { fetchAPI } from '@/shared/api'

export type AuthProvider = 'kakao' | 'google'

export type AuthResponse = {
  accessToken: string
  nickname: string
  role: string
}

export const postSocialCallback = (provider: AuthProvider, code: string) =>
  fetchAPI<AuthResponse>(`/api/auth/${provider}/callback`, {
    method: 'POST',
    body: JSON.stringify({ code }),
    credentials: 'include',
  })

export const postGuestLogin = (nickname: string) =>
  fetchAPI<AuthResponse>('/api/auth/guest', {
    method: 'POST',
    body: JSON.stringify({ nickname }),
    credentials: 'include',
  })
