'use client'

import { useState, useEffect } from 'react'
import { getRoomById, type ChannelRoom } from '@/features/channel'
import { RoomView } from './RoomView'

type Props = { channelId: string; roomId: string }

export const RoomWrapper = ({ channelId, roomId }: Props) => {
  const [room, setRoom] = useState<ChannelRoom | null>(null)

  useEffect(() => {
    let cancelled = false
    getRoomById(channelId, roomId)
      .then((found) => { if (!cancelled) setRoom(found) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [channelId, roomId])

  if (!room) return null

  return <RoomView room={room} categoryId={channelId} />
}
