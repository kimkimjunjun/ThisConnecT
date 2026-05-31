import { Client } from '@stomp/stompjs'
import { env } from '@/shared/config'

export type ChatMessageResponse = {
  type: 'CHAT' | 'JOIN' | 'LEAVE'
  roomId: number
  sender: string
  content: string
  timestamp: string
  sessionId?: string
}

export type ParticipantInfo = {
  sessionId: string
  nickname: string
  level: number
  isOwner: boolean
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

export const createStompClient = (accessToken: string): Client =>
  new Client({
    brokerURL: WS_URL,
    connectHeaders: {
      Authorization: `Bearer ${accessToken}`,
    },
    reconnectDelay: 5000,
  })
