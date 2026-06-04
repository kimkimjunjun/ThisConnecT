import { Client } from '@stomp/stompjs'
import { env } from '@/shared/config'
import { getStoredToken } from '@/shared/api'

export type ChatMessageResponse = {
  type: 'CHAT' | 'JOIN' | 'LEAVE'
  roomId: number
  sender: string
  content: string
  timestamp: string
  sessionId?: string
  isAdmin?: boolean
}

export type ParticipantInfo = {
  sessionId: string
  nickname: string
  level: number
  isOwner: boolean
  memberId?: number
}

export type ParticipantListResponse = {
  roomId: number
  count: number
  participants: ParticipantInfo[]
}

export type VoiceSignalType = 'OFFER' | 'ANSWER' | 'ICE_CANDIDATE'

export type VoiceSignalRequest = {
  type: VoiceSignalType
  targetSessionId: string
  data: RTCSessionDescriptionInit | RTCIceCandidateInit
}

export type VoiceSignalResponse = {
  type: VoiceSignalType
  senderSessionId: string
  targetSessionId: string
  data: RTCSessionDescriptionInit | RTCIceCandidateInit
}

const WS_URL = env.API_BASE_URL.replace(/^http/, 'ws') + '/ws'

export const createStompClient = (): Client => {
  const client = new Client({
    brokerURL: WS_URL,
    reconnectDelay: 5000,
  })
  // beforeConnect은 최초 연결 및 모든 재연결 시 호출되므로
  // 토큰 갱신 후에도 항상 최신 토큰을 사용할 수 있음
  client.beforeConnect = () => {
    const token = getStoredToken()
    client.connectHeaders = { Authorization: `Bearer ${token ?? ''}` }
  }
  return client
}
