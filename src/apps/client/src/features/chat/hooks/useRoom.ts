import { useState, useEffect, useRef, useCallback } from 'react'
import {
  createStompClient,
  type ChatMessageResponse,
  type ParticipantInfo,
} from '../api/chat-api'

const DUPLICATE_CHECK_MS = 300

export const useRoom = (
  roomId: string,
  accessToken: string | null,
  nickname: string | null,
) => {
  const [messages, setMessages] = useState<ChatMessageResponse[]>([])
  const [participants, setParticipants] = useState<ParticipantInfo[]>([])
  const [connected, setConnected] = useState(false)
  const [isDuplicate, setIsDuplicate] = useState(false)
  const clientRef = useRef<ReturnType<typeof createStompClient> | null>(null)
  const isDuplicateRef = useRef(false)

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

  // 동일 계정의 중복 탭 진입 감지 (BroadcastChannel은 동일 탭에 자신의 메시지를 전달하지 않음)
  useEffect(() => {
    if (!nickname || !accessToken) return

    const bc = new BroadcastChannel(`room-${roomId}`)

    bc.onmessage = (e: MessageEvent) => {
      if (e.data.type === 'ENTER' && e.data.nickname === nickname) {
        bc.postMessage({ type: 'OCCUPIED', nickname })
      }
      if (e.data.type === 'OCCUPIED' && e.data.nickname === nickname) {
        isDuplicateRef.current = true
        setIsDuplicate(true)
      }
    }

    bc.postMessage({ type: 'ENTER', nickname })

    return () => bc.close()
  }, [roomId, nickname, accessToken])

  useEffect(() => {
    if (!accessToken) return

    let cancelled = false

    const timer = setTimeout(() => {
      if (cancelled || isDuplicateRef.current) return

      const client = createStompClient(accessToken)

      client.onConnect = () => {
        if (cancelled) {
          client.deactivate()
          return
        }
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
    }, DUPLICATE_CHECK_MS)

    return () => {
      cancelled = true
      clearTimeout(timer)
      clientRef.current?.deactivate()
      clientRef.current = null
    }
  }, [roomId, accessToken])

  return { messages, participants, connected, sendMessage, isDuplicate }
}
