import { useEffect, useRef, useCallback } from 'react'
import type { ParticipantInfo, VoiceSignalRequest, VoiceSignalResponse } from '../api/chat-api'

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
]

type Props = {
  mySessionId: string | null
  participants: ParticipantInfo[]
  sendVoiceSignal: (req: VoiceSignalRequest) => void
  setVoiceSignalCallback: (cb: ((signal: VoiceSignalResponse) => void) | null) => void
  isMicOn: boolean
  isSpeakerOn: boolean
  speakerVolume: number
}

export const useVoiceChat = ({
  mySessionId,
  participants,
  sendVoiceSignal,
  setVoiceSignalCallback,
  isMicOn,
  isSpeakerOn,
  speakerVolume,
}: Props) => {
  const pcsRef = useRef<Map<string, RTCPeerConnection>>(new Map())
  const audiosRef = useRef<Map<string, HTMLAudioElement>>(new Map())
  const localStreamRef = useRef<MediaStream | null>(null)
  const initialDoneRef = useRef(false)

  // 최신 값을 ref로 유지해 peer connection 콜백에서 클로저 문제 방지
  const sendSignalRef = useRef(sendVoiceSignal)
  const isSpeakerOnRef = useRef(isSpeakerOn)
  const speakerVolumeRef = useRef(speakerVolume)
  useEffect(() => { sendSignalRef.current = sendVoiceSignal }, [sendVoiceSignal])
  useEffect(() => { isSpeakerOnRef.current = isSpeakerOn }, [isSpeakerOn])
  useEffect(() => { speakerVolumeRef.current = speakerVolume }, [speakerVolume])

  // 마이크 스트림 획득
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then((stream) => {
        localStreamRef.current = stream
        stream.getAudioTracks().forEach((t) => { t.enabled = isMicOn })
      })
      .catch(() => {})

    return () => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop())
      localStreamRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 마이크 음소거 동기화
  useEffect(() => {
    localStreamRef.current?.getAudioTracks().forEach((t) => { t.enabled = isMicOn })
  }, [isMicOn])

  // 스피커 상태/볼륨 동기화
  useEffect(() => {
    audiosRef.current.forEach((audio) => {
      audio.muted = !isSpeakerOn
      audio.volume = speakerVolume / 100
    })
  }, [isSpeakerOn, speakerVolume])

  const getOrCreatePc = useCallback((remoteId: string): RTCPeerConnection => {
    const existing = pcsRef.current.get(remoteId)
    if (existing && existing.signalingState !== 'closed') return existing

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })

    localStreamRef.current?.getTracks().forEach((track) => {
      pc.addTrack(track, localStreamRef.current!)
    })

    pc.onicecandidate = ({ candidate }) => {
      if (!candidate) return
      sendSignalRef.current({
        type: 'ICE_CANDIDATE',
        targetSessionId: remoteId,
        data: candidate.toJSON(),
      })
    }

    pc.ontrack = ({ streams }) => {
      const stream = streams[0]
      if (!stream) return

      let audio = audiosRef.current.get(remoteId)
      if (!audio) {
        audio = new Audio()
        audio.autoplay = true
        audiosRef.current.set(remoteId, audio)
      }
      audio.srcObject = stream
      audio.muted = !isSpeakerOnRef.current
      audio.volume = speakerVolumeRef.current / 100
    }

    pcsRef.current.set(remoteId, pc)
    return pc
  }, [])

  // 수신 시그널 처리
  const handleSignal = useCallback(
    async (signal: VoiceSignalResponse) => {
      if (!mySessionId || signal.targetSessionId !== mySessionId) return

      const { type, senderSessionId, data } = signal

      try {
        if (type === 'OFFER') {
          const pc = getOrCreatePc(senderSessionId)
          await pc.setRemoteDescription(new RTCSessionDescription(data as RTCSessionDescriptionInit))
          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)
          sendSignalRef.current({ type: 'ANSWER', targetSessionId: senderSessionId, data: answer })
        } else if (type === 'ANSWER') {
          await pcsRef.current
            .get(senderSessionId)
            ?.setRemoteDescription(new RTCSessionDescription(data as RTCSessionDescriptionInit))
        } else if (type === 'ICE_CANDIDATE') {
          await pcsRef.current
            .get(senderSessionId)
            ?.addIceCandidate(new RTCIceCandidate(data as RTCIceCandidateInit))
        }
      } catch {
        // WebRTC 협상 오류 무시
      }
    },
    [mySessionId, getOrCreatePc],
  )

  // 시그널 콜백 등록
  useEffect(() => {
    setVoiceSignalCallback(handleSignal)
    return () => setVoiceSignalCallback(null)
  }, [setVoiceSignalCallback, handleSignal])

  // 입장 시 기존 참여자에게 OFFER 전송 (최초 1회)
  useEffect(() => {
    if (!mySessionId || initialDoneRef.current) return
    initialDoneRef.current = true

    participants
      .filter((p) => p.sessionId !== mySessionId)
      .forEach(async (p) => {
        try {
          const pc = getOrCreatePc(p.sessionId)
          const offer = await pc.createOffer()
          await pc.setLocalDescription(offer)
          sendSignalRef.current({ type: 'OFFER', targetSessionId: p.sessionId, data: offer })
        } catch {
          // ignore
        }
      })
  }, [mySessionId, participants, getOrCreatePc])

  // 퇴장한 참여자 정리
  useEffect(() => {
    const currentIds = new Set(participants.map((p) => p.sessionId))
    pcsRef.current.forEach((pc, sessionId) => {
      if (!currentIds.has(sessionId)) {
        pc.close()
        pcsRef.current.delete(sessionId)
        const audio = audiosRef.current.get(sessionId)
        if (audio) {
          audio.srcObject = null
          audiosRef.current.delete(sessionId)
        }
      }
    })
  }, [participants])

  // 언마운트 시 전체 정리
  useEffect(() => {
    return () => {
      pcsRef.current.forEach((pc) => pc.close())
      pcsRef.current.clear()
      audiosRef.current.forEach((audio) => { audio.srcObject = null })
      audiosRef.current.clear()
    }
  }, [])
}
