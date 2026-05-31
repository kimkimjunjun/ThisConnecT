'use client'

import { useChannels, useChannelRooms } from '@/features/channel'
import { RoomBrowser } from '@/views/home'

type Props = { channelId: string }

export const ChannelView = ({ channelId }: Props) => {
  const { channels } = useChannels()
  const { rooms, refresh, isPending } = useChannelRooms(channelId)

  const channel = channels.find((c) => c.id.toString() === channelId)
  const channelName = channel?.name ?? ''

  return (
    <RoomBrowser
      categoryId={channelId}
      categoryName={channelName}
      rooms={rooms}
      onRoomCreated={refresh}
      onRoomDeleted={refresh}
      onRefresh={refresh}
      isRefreshing={isPending}
    />
  )
}
