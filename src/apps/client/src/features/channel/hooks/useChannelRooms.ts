import { useState, useEffect, useCallback } from 'react'
import { getChannelRoomsCursor } from '../api/channel-api'
import type { ChannelRoom } from '../api/channel-api'

export const useChannelRooms = (channelId: string) => {
  const [rooms, setRooms] = useState<ChannelRoom[] | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!channelId) return
    let cancelled = false
    getChannelRoomsCursor(channelId)
      .then((page) => { if (!cancelled) setRooms(page.rooms) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [channelId, refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  return { rooms: rooms ?? [], isPending: rooms === null, refresh }
}
