import { useState, useEffect, useCallback } from 'react'
import { getChannelRooms } from '../api/channel-api'
import type { ChannelRoom } from '../api/channel-api'

export const useChannelRooms = (channelId: string) => {
  const [rooms, setRooms] = useState<ChannelRoom[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!channelId) return
    getChannelRooms(channelId).then(setRooms).catch(() => {})
  }, [channelId, refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  return { rooms, refresh }
}
