import { useState, useEffect, useCallback } from 'react'
import { getChannelRoomsCursor } from '../api/channel-api'
import type { ChannelRoom } from '../api/channel-api'

export const useChannelRooms = (channelId: string) => {
  const [rooms, setRooms] = useState<ChannelRoom[]>([])
  const [isPending, setIsPending] = useState(false)

  const refresh = useCallback(() => {
    if (!channelId) return
    setIsPending(true)
    getChannelRoomsCursor(channelId)
      .then((page) => setRooms(page.rooms))
      .catch(() => {})
      .finally(() => setIsPending(false))
  }, [channelId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { rooms, isPending, refresh }
}
