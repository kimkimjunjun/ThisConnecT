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
    BY_NICKNAME: (nickname: string) => `/api/members/nickname/${encodeURIComponent(nickname)}`,
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
    LIST: '/api/reports',
    BY_REPORTED: (reportedId: number) => `/api/reports/users/${reportedId}`,
  },
  MESSAGE: {
    SEND: '/api/messages',
    INBOX: '/api/messages/inbox',
    OUTBOX: '/api/messages/outbox',
    MARK_READ: (messageId: number) => `/api/messages/${messageId}/read`,
    INBOX_DELETE: (messageId: number) => `/api/messages/inbox/${messageId}`,
    OUTBOX_DELETE: (messageId: number) => `/api/messages/outbox/${messageId}`,
  },
} as const
