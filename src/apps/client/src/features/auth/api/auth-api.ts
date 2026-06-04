import { fetchAPI } from '@/shared/api'
import { END_POINT, type AuthProvider } from '@/shared/api/endpoint'

export type { AuthProvider }

export type AuthResponse = {
  accessToken: string
  nickname: string
  role: string
}

export const postSocialCallback = (provider: AuthProvider, code: string) =>
  fetchAPI<AuthResponse>(END_POINT.AUTH.SOCIAL_CALLBACK(provider), {
    method: 'POST',
    body: JSON.stringify({ code }),
    credentials: 'include',
  })

export const postGuestLogin = (nickname: string) =>
  fetchAPI<AuthResponse>(END_POINT.AUTH.GUEST_LOGIN, {
    method: 'POST',
    body: JSON.stringify({ nickname }),
    credentials: 'include',
  })

export const logout = () =>
  fetchAPI<void>(END_POINT.AUTH.LOGOUT, {
    method: 'POST',
    credentials: 'include',
  })
