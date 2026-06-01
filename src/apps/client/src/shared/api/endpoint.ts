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
  CHANNEL: {
    LIST: '/api/channels',
    DETAIL: (channelId: number | string) => `/api/channels/${channelId}`,
    ROOMS: (channelId: number | string) => `/api/channels/${channelId}/rooms`,
    ROOM: (channelId: number | string, roomId: number | string) =>
      `/api/channels/${channelId}/rooms/${roomId}`,
  },
  REPORT: {
    CREATE: '/api/reports',
  },
  MESSAGE: {
    SEND: '/api/messages',
  },
} as const
