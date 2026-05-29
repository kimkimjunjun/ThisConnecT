import { create } from "zustand";
import { persist } from "zustand/middleware";

type AudioState = {
  isMicOn: boolean;
  isSpeakerOn: boolean;
  micVolume: number;
  speakerVolume: number;
  noiseSuppression: boolean;
  setIsMicOn: (v: boolean) => void;
  setIsSpeakerOn: (v: boolean) => void;
  setMicVolume: (v: number) => void;
  setSpeakerVolume: (v: number) => void;
  setNoiseSuppression: (v: boolean) => void;
};

export const useAudioStore = create<AudioState>()(
  persist(
    (set) => ({
      isMicOn: true,
      isSpeakerOn: true,
      micVolume: 100,
      speakerVolume: 100,
      noiseSuppression: true,
      setIsMicOn: (isMicOn) => set({ isMicOn }),
      setIsSpeakerOn: (isSpeakerOn) => set({ isSpeakerOn }),
      setMicVolume: (micVolume) => set({ micVolume }),
      setSpeakerVolume: (speakerVolume) => set({ speakerVolume }),
      setNoiseSuppression: (noiseSuppression) => set({ noiseSuppression }),
    }),
    { name: "audio" },
  ),
);
