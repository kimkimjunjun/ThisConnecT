'use client'

import { useChannelsQuery } from '@/features/channel'
import { RoomBrowser } from '@/views/home'

type Props = { channelId: string }

export const ChannelView = ({ channelId }: Props) => {
  const { data: channels = [] } = useChannelsQuery()
  const channel = channels.find((c) => c.id.toString() === channelId)
  const channelName = channel?.name ?? ''

  return <RoomBrowser categoryId={channelId} categoryName={channelName} />
}
