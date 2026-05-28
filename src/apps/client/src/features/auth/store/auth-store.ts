import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type AuthState = {
  accessToken: string | null
  nickname: string | null
  role: string | null
  level: number
  setAuth: (auth: { accessToken: string; nickname: string; role: string }) => void
  updateNickname: (nickname: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      nickname: null,
      role: null,
      level: 0,
      setAuth: ({ accessToken, nickname, role }) =>
        set({ accessToken, nickname, role }),
      updateNickname: (nickname) => set({ nickname }),
      clearAuth: () =>
        set({ accessToken: null, nickname: null, role: null, level: 0 }),
    }),
    {
      name: 'auth',
      partialize: ({ accessToken, nickname, role, level }) => ({
        accessToken,
        nickname,
        role,
        level,
      }),
    },
  ),
)
