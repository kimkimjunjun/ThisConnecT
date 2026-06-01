import { useState, useEffect, useCallback, useRef } from 'react'
import { getChannelRoomsCursor } from '../api/channel-api'
import type { ChannelRoom } from '../api/channel-api'

export const useChannelRoomsCursor = (channelId: string, keyword: string) => {
  const [rooms, setRooms] = useState<ChannelRoom[] | null>(null)
  const [nextCursor, setNextCursor] = useState<number | null>(null)
  const [hasNext, setHasNext] = useState(false)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const isFetchingMoreRef = useRef(false)

  useEffect(() => {
    if (!channelId) return
    let cancelled = false
    getChannelRoomsCursor(channelId, null, keyword || undefined)
      .then((page) => {
        if (cancelled) return
        setRooms(page.rooms)
        setNextCursor(page.nextCursor)
        setHasNext(page.hasNext)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [channelId, keyword, refreshKey])

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  const loadMore = useCallback(() => {
    if (!hasNext || isFetchingMoreRef.current || nextCursor == null) return
    isFetchingMoreRef.current = true
    setIsFetchingMore(true)
    getChannelRoomsCursor(channelId, nextCursor, keyword || undefined)
      .then((page) => {
        setRooms((prev) => [...(prev ?? []), ...page.rooms])
        setNextCursor(page.nextCursor)
        setHasNext(page.hasNext)
      })
      .catch(() => {})
      .finally(() => {
        isFetchingMoreRef.current = false
        setIsFetchingMore(false)
      })
  }, [channelId, nextCursor, keyword, hasNext])

  return {
    rooms: rooms ?? [],
    isPending: rooms === null,
    hasNext,
    isFetchingMore,
    loadMore,
    refresh,
  }
}
