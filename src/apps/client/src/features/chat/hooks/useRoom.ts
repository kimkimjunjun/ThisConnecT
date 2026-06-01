import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  createStompClient,
  type ChatMessageResponse,
  type ParticipantInfo,
  type VoiceSignalRequest,
  type VoiceSignalResponse,
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
  const [isRoomFull, setIsRoomFull] = useState(false)
  const [isKicked, setIsKicked] = useState(false)
  const clientRef = useRef<ReturnType<typeof createStompClient> | null>(null)
  const isDuplicateRef = useRef(false)
  const voiceSignalCbRef = useRef<((signal: VoiceSignalResponse) => void) | null>(null)

  const mySessionId = useMemo(
    () => participants.find((p) => p.nickname === nickname)?.sessionId ?? null,
    [participants, nickname],
  )

  // ref로 최신 sessionId 추적 — 구독 콜백이 stale closure 없이 참조
  const mySessionIdRef = useRef<string | null>(null)
  useEffect(() => {
    mySessionIdRef.current = mySessionId
  }, [mySessionId])

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

  const kickParticipant = useCallback(
    (targetSessionId: string) => {
      if (!clientRef.current?.connected) return
      clientRef.current.publish({
        destination: `/pub/rooms/${roomId}/kick`,
        body: JSON.stringify({ targetSessionId }),
      })
    },
    [roomId],
  )

  const sendVoiceSignal = useCallback(
    (req: VoiceSignalRequest) => {
      if (!clientRef.current?.connected) return
      clientRef.current.publish({
        destination: `/pub/rooms/${roomId}/voice/signal`,
        body: JSON.stringify(req),
      })
    },
    [roomId],
  )

  const setVoiceSignalCallback = useCallback(
    (cb: ((signal: VoiceSignalResponse) => void) | null) => {
      voiceSignalCbRef.current = cb
    },
    [],
  )

  // 동일 계정의 중복 탭 진입 감지
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
          // fallback: 본인 sessionId의 LEAVE 메시지가 도착하면 강제퇴장 처리
          if (
            msg.type === 'LEAVE' &&
            msg.sessionId != null &&
            mySessionIdRef.current != null &&
            msg.sessionId === mySessionIdRef.current
          ) {
            setIsKicked(true)
          }
        })

        client.subscribe(`/sub/rooms/${roomId}/participants`, (frame) => {
          const data: { participants: ParticipantInfo[] } = JSON.parse(frame.body)
          setParticipants(data.participants)
        })

        client.subscribe(`/sub/rooms/${roomId}/voice`, (frame) => {
          const signal: VoiceSignalResponse = JSON.parse(frame.body)
          voiceSignalCbRef.current?.(signal)
        })

        client.subscribe(`/user/queue/room-error`, (frame) => {
          const data: { type: string } = JSON.parse(frame.body)
          if (data.type === 'ROOM_FULL') setIsRoomFull(true)
        })

        client.subscribe(`/user/queue/kicked`, () => {
          setIsKicked(true)
        })

        // 어드민 전용: broadcast 타이밍 문제를 우회해 참여자 목록을 직접 수신
        client.subscribe(`/user/queue/participants-snapshot`, (frame) => {
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

  return {
    messages,
    participants,
    connected,
    sendMessage,
    kickParticipant,
    isDuplicate,
    isRoomFull,
    isKicked,
    mySessionId,
    sendVoiceSignal,
    setVoiceSignalCallback,
  }
}
