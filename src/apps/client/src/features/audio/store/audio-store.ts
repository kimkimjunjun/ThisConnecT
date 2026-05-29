import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type AudioState = {
  micVolume: number
  speakerVolume: number
  noiseSuppression: boolean
  setMicVolume: (v: number) => void
  setSpeakerVolume: (v: number) => void
  setNoiseSuppression: (v: boolean) => void
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set) => ({
      micVolume: 100,
      speakerVolume: 100,
      noiseSuppression: true,
      setMicVolume: (micVolume) => set({ micVolume }),
      setSpeakerVolume: (speakerVolume) => set({ speakerVolume }),
      setNoiseSuppression: (noiseSuppression) => set({ noiseSuppression }),
    }),
    { name: 'audio' },
  ),
)
