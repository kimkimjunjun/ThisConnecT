import { fetchAPI } from '@/shared/api'

export type AuthProvider = 'kakao' | 'google'

export type AuthCallbackResponse = {
  accessToken: string
  user: {
    id: string
    nickname: string
    provider: AuthProvider
  }
}

export type GuestLoginResponse = {
  accessToken: string
  user: {
    id: string
    nickname: string
  }
}

export const postSocialCallback = (provider: AuthProvider, code: string) =>
  fetchAPI<AuthCallbackResponse>(`/api/auth/${provider}/callback`, {
    method: 'POST',
    body: JSON.stringify({ code }),
    credentials: 'include',
  })

export const postGuestLogin = (nickname: string) =>
  fetchAPI<GuestLoginResponse>('/api/auth/guest', {
    method: 'POST',
    body: JSON.stringify({ nickname }),
    credentials: 'include',
  })
