'use client'

import { createContext, useContext } from 'react'

type AuthContextValue = {
  isLoggedIn: boolean
  openLoginModal: (redirectTo?: string) => void
}

const AuthContext = createContext<AuthContextValue>({
  isLoggedIn: false,
  openLoginModal: () => {},
})

export const AuthContextProvider = AuthContext.Provider

export const useAuthContext = () => useContext(AuthContext)
