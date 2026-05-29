export type AuthProvider = 'kakao' | 'google'

export const END_POINT = {
  AUTH: {
    SOCIAL_CALLBACK: (provider: AuthProvider) => `/api/auth/${provider}/callback`,
    GUEST_LOGIN: '/api/auth/guest',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
  },
  MEMBER: {
    MY_INFO: '/api/members/me',
    UPDATE_NICKNAME: '/api/members/me/nickname',
  },
} as const
