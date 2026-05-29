'use client'

import { useChannelRooms } from '@/features/channel'
import { RoomView } from './RoomView'

type Props = { channelId: string; roomId: string }

export const RoomWrapper = ({ channelId, roomId }: Props) => {
  const { rooms } = useChannelRooms(channelId)
  const room = rooms.find((r) => r.id.toString() === roomId)

  if (!room) return null

  return <RoomView room={room} categoryId={channelId} />
}
