import { useInfiniteQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { getChannelRoomsCursor } from '../api/channel-api'
import type { ChannelRoom } from '../api/channel-api'
import { channelRoomsQueryKey } from '../query-keys'

export { channelRoomsQueryKey }

export const useChannelRoomsQuery = (channelId: string, keyword: string) => {
  const queryClient = useQueryClient()

  const query = useInfiniteQuery({
    queryKey: channelRoomsQueryKey(channelId, keyword),
    queryFn: ({ pageParam }) =>
      getChannelRoomsCursor(channelId, pageParam as number | null, keyword || undefined),
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : undefined,
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  })

  const rooms: ChannelRoom[] = query.data?.pages.flatMap((p) => p.rooms) ?? []
  const hasNext = query.data?.pages.at(-1)?.hasNext ?? false

  const loadMore = () => {
    if (hasNext && !query.isFetchingNextPage) query.fetchNextPage()
  }

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: channelRoomsQueryKey(channelId, keyword) })

  return {
    rooms,
    isPending: query.isPending,
    isPlaceholderData: query.isPlaceholderData,
    hasNext,
    isFetchingMore: query.isFetchingNextPage,
    loadMore,
    refresh,
  }
}
