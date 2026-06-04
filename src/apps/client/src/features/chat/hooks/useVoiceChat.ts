import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import type { ParticipantInfo, VoiceSignalRequest, VoiceSignalResponse } from '../api/chat-api'

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
]

export type PeerAudioState = { muted: boolean; volume: number }

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

  // localStream 준비 여부 — OFFER 전송 타이밍 게이트
  const [localStreamReady, setLocalStreamReady] = useState(false)

  // 마이크 발화 감지
  const [isMySpeaking, setIsMySpeaking] = useState(false)
  const animFrameRef = useRef<number | null>(null)
  const isMicOnRef = useRef(isMicOn)
  useEffect(() => { isMicOnRef.current = isMicOn }, [isMicOn])

  const [peerAudio, setPeerAudio] = useState<Record<string, PeerAudioState>>({})

  const sendSignalRef = useRef(sendVoiceSignal)
  const isSpeakerOnRef = useRef(isSpeakerOn)
  const speakerVolumeRef = useRef(speakerVolume)
  const peerAudioRef = useRef(peerAudio)
  useEffect(() => { sendSignalRef.current = sendVoiceSignal }, [sendVoiceSignal])
  useEffect(() => { isSpeakerOnRef.current = isSpeakerOn }, [isSpeakerOn])
  useEffect(() => { speakerVolumeRef.current = speakerVolume }, [speakerVolume])
  useEffect(() => { peerAudioRef.current = peerAudio }, [peerAudio])

  // 마이크 스트림 획득 — 완료 시 localStreamReady = true
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then((stream) => {
        localStreamRef.current = stream
        stream.getAudioTracks().forEach((t) => { t.enabled = isMicOn })
        setLocalStreamReady(true)
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

  // 글로벌 스피커 상태/볼륨 변경 시 모든 오디오에 반영
  useEffect(() => {
    audiosRef.current.forEach((audio, sessionId) => {
      const userState = peerAudioRef.current[sessionId]
      const userMuted = userState?.muted ?? false
      const userVolume = userState?.volume ?? 100
      audio.muted = !isSpeakerOn || userMuted
      audio.volume = Math.min(1, (speakerVolume / 100) * (userVolume / 100))
    })
  }, [isSpeakerOn, speakerVolume])

  const getOrCreatePc = useCallback((remoteId: string): RTCPeerConnection => {
    const existing = pcsRef.current.get(remoteId)
    if (existing && existing.signalingState !== 'closed') return existing

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })

    // 로컬 스트림 트랙 추가 — stream이 준비된 시점에 호출되므로 항상 존재
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

    pc.ontrack = ({ track, streams }) => {
      // streams[0]이 없는 경우를 대비해 track으로 직접 MediaStream 생성
      const stream = streams[0] ?? new MediaStream([track])

      let audio = audiosRef.current.get(remoteId)
      if (!audio) {
        audio = new Audio()
        audio.autoplay = true
        audiosRef.current.set(remoteId, audio)
      }

      if (audio.srcObject !== stream) {
        audio.srcObject = stream
        // 브라우저 autoplay 정책 우회를 위해 명시적 play() 호출
        audio.play().catch(() => {})
      }

      const userState = peerAudioRef.current[remoteId]
      const userMuted = userState?.muted ?? false
      const userVolume = userState?.volume ?? 100
      audio.muted = !isSpeakerOnRef.current || userMuted
      audio.volume = Math.min(1, (speakerVolumeRef.current / 100) * (userVolume / 100))

      setPeerAudio((prev) => {
        if (prev[remoteId]) return prev
        return { ...prev, [remoteId]: { muted: false, volume: 100 } }
      })
    }

    pcsRef.current.set(remoteId, pc)
    return pc
  }, [])

  // per-user 음소거 토글
  const setParticipantMuted = useCallback((sessionId: string, muted: boolean) => {
    const audio = audiosRef.current.get(sessionId)
    if (audio) audio.muted = !isSpeakerOnRef.current || muted
    setPeerAudio((prev) => ({
      ...prev,
      [sessionId]: { muted, volume: prev[sessionId]?.volume ?? 100 },
    }))
  }, [])

  // per-user 볼륨 조절
  const setParticipantVolume = useCallback((sessionId: string, volume: number) => {
    const audio = audiosRef.current.get(sessionId)
    if (audio) audio.volume = Math.min(1, (speakerVolumeRef.current / 100) * (volume / 100))
    setPeerAudio((prev) => ({
      ...prev,
      [sessionId]: { muted: prev[sessionId]?.muted ?? false, volume },
    }))
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

  // 입장 시 기존 참여자에게 OFFER 전송
  // localStreamReady가 true일 때만 실행 — getUserMedia 완료 전에 OFFER를 보내면
  // 오디오 트랙이 없는 OFFER가 전송되어 상대방이 소리를 들을 수 없음
  useEffect(() => {
    if (!mySessionId || !localStreamReady || initialDoneRef.current) return
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
  }, [mySessionId, participants, getOrCreatePc, localStreamReady])

  // 퇴장한 참여자 WebRTC/Audio 정리 — setState는 호출하지 않음 (React Compiler 규칙)
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

  // 퇴장한 참여자를 peerAudio에서 필터링 — effect 내 setState 대신 useMemo로 파생
  const activePeerAudio = useMemo(() => {
    const currentIds = new Set(participants.map((p) => p.sessionId))
    const filtered: Record<string, PeerAudioState> = {}
    for (const [id, state] of Object.entries(peerAudio)) {
      if (currentIds.has(id)) filtered[id] = state
    }
    return filtered
  }, [participants, peerAudio])

  // 마이크 발화 감지 — localStreamReady 이후 AudioContext + AnalyserNode 루프
  useEffect(() => {
    if (!localStreamReady || !localStreamRef.current) return

    let ctx: AudioContext | null = null
    let source: MediaStreamAudioSourceNode | null = null
    let analyser: AnalyserNode | null = null
    let frameId: number | null = null

    try {
      ctx = new AudioContext()
      // 브라우저 autoplay 정책으로 suspended 상태가 될 수 있으므로 명시적 resume
      if (ctx.state === 'suspended') ctx.resume().catch(() => {})

      source = ctx.createMediaStreamSource(localStreamRef.current)
      analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      source.connect(analyser)

      // 시간 도메인(time-domain) RMS — 주파수 도메인보다 발화 감지에 정확함
      const buf = new Uint8Array(analyser.fftSize)

      const tick = () => {
        frameId = requestAnimationFrame(tick)
        if (!analyser || !isMicOnRef.current) {
          setIsMySpeaking((prev) => (prev ? false : prev))
          return
        }
        analyser.getByteTimeDomainData(buf)
        // 128이 무음 기준값, 편차의 RMS로 진폭 측정
        const rms = Math.sqrt(buf.reduce((s, v) => s + (v - 128) ** 2, 0) / buf.length)
        const speaking = rms > 8
        setIsMySpeaking((prev) => (prev === speaking ? prev : speaking))
      }

      frameId = requestAnimationFrame(tick)
    } catch {
      // AudioContext 불가 환경 무시
    }

    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId)
      source?.disconnect()
      ctx?.close().catch(() => {})
      setIsMySpeaking(false)
    }
  }, [localStreamReady])

  // 언마운트 시 전체 정리
  useEffect(() => {
    return () => {
      pcsRef.current.forEach((pc) => pc.close())
      pcsRef.current.clear()
      audiosRef.current.forEach((audio) => { audio.srcObject = null })
      audiosRef.current.clear()
    }
  }, [])

  return { peerAudio: activePeerAudio, setParticipantMuted, setParticipantVolume, isMySpeaking }
}
