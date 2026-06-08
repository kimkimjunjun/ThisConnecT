import { publicApi, type AuthResponse } from '@/shared/api'
import { END_POINT, type AuthProvider } from '@/shared/api/endpoint'

export type { AuthProvider, AuthResponse }

export const postSocialCallback = (provider: AuthProvider, code: string) =>
  publicApi
    .post<AuthResponse>(END_POINT.AUTH.SOCIAL_CALLBACK(provider), { code })
    .then((r) => r.data)

export const postGuestLogin = (nickname: string) =>
  publicApi
    .post<AuthResponse>(END_POINT.AUTH.GUEST_LOGIN, { nickname })
    .then((r) => r.data)

export const logout = () =>
  publicApi.post<void>(END_POINT.AUTH.LOGOUT).then((r) => r.data)
