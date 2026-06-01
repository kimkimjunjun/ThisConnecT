'use client'

import { useChannels } from '@/features/channel'
import { RoomBrowser } from '@/views/home'

type Props = { channelId: string }

export const ChannelView = ({ channelId }: Props) => {
  const { channels } = useChannels()
  const channel = channels.find((c) => c.id.toString() === channelId)
  const channelName = channel?.name ?? ''

  return <RoomBrowser key={channelId} categoryId={channelId} categoryName={channelName} />
}
