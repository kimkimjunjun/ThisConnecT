import { useState, useEffect, useRef, useCallback } from 'react'
import {
  createStompClient,
  type ChatMessageResponse,
  type ParticipantInfo,
} from '../api/chat-api'

export const useRoom = (roomId: string, accessToken: string | null) => {
  const [messages, setMessages] = useState<ChatMessageResponse[]>([])
  const [participants, setParticipants] = useState<ParticipantInfo[]>([])
  const [connected, setConnected] = useState(false)
  const clientRef = useRef<ReturnType<typeof createStompClient> | null>(null)

  const sendMessage = useCallback(
    (content: string) => {
      if (!clientRef.current?.connected) return
      clientRef.current.publish({
        destination: `/pub/rooms/${roomId}/chat`,
        body: JSON.stringify({ content }),
      })
    },
    [roomId],
  )

  useEffect(() => {
    if (!accessToken) return

    const client = createStompClient(accessToken)

    client.onConnect = () => {
      setConnected(true)

      client.subscribe(`/sub/rooms/${roomId}/chat`, (frame) => {
        const msg: ChatMessageResponse = JSON.parse(frame.body)
        setMessages((prev) => [...prev, msg])
      })

      client.subscribe(`/sub/rooms/${roomId}/participants`, (frame) => {
        const data: { participants: ParticipantInfo[] } = JSON.parse(frame.body)
        setParticipants(data.participants)
      })

      client.publish({ destination: `/pub/rooms/${roomId}/enter` })
    }

    client.onDisconnect = () => setConnected(false)
    client.onStompError = () => setConnected(false)

    client.activate()
    clientRef.current = client

    return () => {
      client.deactivate()
      clientRef.current = null
    }
  }, [roomId, accessToken])

  return { messages, participants, connected, sendMessage }
}
