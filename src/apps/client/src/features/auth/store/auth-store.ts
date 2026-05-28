import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type AuthState = {
  accessToken: string | null
  nickname: string | null
  role: string | null
  setAuth: (auth: { accessToken: string; nickname: string; role: string }) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      nickname: null,
      role: null,
      setAuth: ({ accessToken, nickname, role }) =>
        set({ accessToken, nickname, role }),
      clearAuth: () => set({ accessToken: null, nickname: null, role: null }),
    }),
    {
      name: 'auth',
      partialize: ({ accessToken, nickname, role }) => ({
        accessToken,
        nickname,
        role,
      }),
    },
  ),
)
