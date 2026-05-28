'use client'

import {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  AuthModal,
  useAuthStore,
  AuthContextProvider,
} from '@/features/auth'
import { AppHeader } from '@/widgets/header'
import { Sidebar } from '@/widgets/sidebar'
import { CATEGORIES } from '@/mock/channels'
import styles from './DashboardLayout.module.scss'

type Props = { children: ReactNode }

// Avoids the SSR "useLayoutEffect does nothing on the server" warning
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

export const DashboardLayout = ({ children }: Props) => {
  const [mounted, setMounted] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const router = useRouter()
  const pathname = usePathname()
  const accessToken = useAuthStore((s) => s.accessToken)

  // Resolve active category from URL (e.g. /channels/2 → "2")
  const activeCategoryId = pathname.match(/^\/channels\/([^/]+)/)?.[1] ?? null

  // useLayoutEffect fires before browser paint → no visible flash
  useIsomorphicLayoutEffect(() => {
    setMounted(true)
    if (!useAuthStore.getState().accessToken) {
      setIsModalOpen(true)
    }
  }, [])

  // Auto-close modal on login
  useEffect(() => {
    if (accessToken) setIsModalOpen(false)
  }, [accessToken])

  const openModal = useCallback(() => setIsModalOpen(true), [])
  const closeModal = useCallback(() => setIsModalOpen(false), [])

  const handleSelectCategory = useCallback(
    (id: string) => router.push(`/channels/${id}`),
    [router],
  )

  // isLoggedIn is only true after hydration to prevent SSR mismatch
  const isLoggedIn = mounted && !!accessToken

  return (
    <AuthContextProvider value={{ isLoggedIn, openLoginModal: openModal }}>
      <div className={styles.app}>
        <AppHeader isLoggedIn={isLoggedIn} onLoginClick={openModal} />

        <div className={styles.body}>
          <Sidebar
            rooms={CATEGORIES}
            activeRoomId={activeCategoryId}
            onSelectRoom={handleSelectCategory}
          />

          <main className={styles.content}>{children}</main>
        </div>

        <AuthModal isOpen={isModalOpen} onClose={closeModal} />
      </div>
    </AuthContextProvider>
  )
}
