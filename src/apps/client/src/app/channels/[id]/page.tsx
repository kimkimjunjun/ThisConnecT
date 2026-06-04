import { PrefetchBoundary } from '@/shared/api/prefetch'
import { getChannels, getChannelRoomsCursor } from '@/features/channel/api/channel-api'
import { channelsQueryKey, channelRoomsQueryKey } from '@/features/channel/query-keys'
import { DashboardLayout } from '@/widgets/dashboard-layout'
import { ChannelView } from '@/views/channel'

type Props = { params: Promise<{ id: string }> }

export default async function ChannelPage({ params }: Props) {
  const { id } = await params

  return (
    <DashboardLayout>
      <PrefetchBoundary
        queries={[
          { queryKey: channelsQueryKey, queryFn: getChannels },
        ]}
        infiniteQueries={[
          {
            queryKey: channelRoomsQueryKey(id, ''),
            queryFn: ({ pageParam }) =>
              getChannelRoomsCursor(id, pageParam as number | null),
            initialPageParam: null,
          },
        ]}
      >
        <ChannelView channelId={id} />
      </PrefetchBoundary>
    </DashboardLayout>
  )
}
