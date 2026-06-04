'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getRoomById, type ChannelRoom } from '@/features/channel'
import { RoomFullModal } from './RoomFullModal'
import { RoomView } from './RoomView'

type Props = { channelId: string; roomId: string }

export const RoomWrapper = ({ channelId, roomId }: Props) => {
  const router = useRouter()
  const [room, setRoom] = useState<ChannelRoom | null>(null)
  const [isRoomFull, setIsRoomFull] = useState(false)

  useEffect(() => {
    let cancelled = false
    getRoomById(channelId, roomId)
      .then((found) => {
        if (cancelled) return
        if (!found) return
        if (found.currentCount >= found.maxCount) {
          setIsRoomFull(true)
        } else {
          setRoom(found)
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [channelId, roomId])

  if (isRoomFull) {
    return <RoomFullModal onConfirm={() => router.replace(`/channels/${channelId}`)} />
  }

  if (!room) return null

  return <RoomView room={room} categoryId={channelId} />
}
