import { useState, useEffect, useCallback, useRef } from 'react'
import { getChannelRoomsCursor } from '../api/channel-api'
import type { ChannelRoom } from '../api/channel-api'

export const useChannelRoomsCursor = (channelId: string, keyword: string) => {
  const [rooms, setRooms] = useState<ChannelRoom[]>([])
  const [nextCursor, setNextCursor] = useState<number | null>(null)
  const [hasNext, setHasNext] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const isFetchingMoreRef = useRef(false)

  const fetchFirst = useCallback(() => {
    if (!channelId) return
    setIsPending(true)
    getChannelRoomsCursor(channelId, null, keyword || undefined)
      .then((page) => {
        setRooms(page.rooms)
        setNextCursor(page.nextCursor)
        setHasNext(page.hasNext)
      })
      .catch(() => {})
      .finally(() => setIsPending(false))
  }, [channelId, keyword])

  useEffect(() => {
    fetchFirst()
  }, [fetchFirst])

  const loadMore = useCallback(() => {
    if (!hasNext || isFetchingMoreRef.current || nextCursor == null) return
    isFetchingMoreRef.current = true
    setIsFetchingMore(true)
    getChannelRoomsCursor(channelId, nextCursor, keyword || undefined)
      .then((page) => {
        setRooms((prev) => [...prev, ...page.rooms])
        setNextCursor(page.nextCursor)
        setHasNext(page.hasNext)
      })
      .catch(() => {})
      .finally(() => {
        isFetchingMoreRef.current = false
        setIsFetchingMore(false)
      })
  }, [channelId, nextCursor, keyword, hasNext])

  return { rooms, hasNext, isPending, isFetchingMore, loadMore, refresh: fetchFirst }
}
