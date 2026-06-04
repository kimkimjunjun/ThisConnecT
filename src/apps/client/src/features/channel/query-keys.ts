export const channelsQueryKey = ['channels'] as const

export const channelRoomsQueryKey = (channelId: string, keyword: string) =>
  ['channels', channelId, 'rooms', keyword] as const
