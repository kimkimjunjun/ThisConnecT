'use client'

import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'

let initialModalShown = false
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

export const DashboardLayout = ({ children }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pendingRoute, setPendingRoute] = useState<string | null>(null)

  const router = useRouter()
  const pathname = usePathname()
  const accessToken = useAuthStore((s) => s.accessToken)

  const activeCategoryId = pathname.match(/^\/channels\/([^/]+)/)?.[1] ?? null

  useEffect(() => {
    if (initialModalShown) return
    initialModalShown = true
    if (!useAuthStore.getState().accessToken) {
      setIsModalOpen(true)
    }
  }, [])

  // Auto-close modal on login, then navigate to pending route if any
  useEffect(() => {
    if (accessToken) {
      setIsModalOpen(false)
      if (pendingRoute) {
        router.push(pendingRoute)
        setPendingRoute(null)
        sessionStorage.removeItem('auth_pending_route')
      }
    }
  }, [accessToken, pendingRoute, router])

  const openModal = useCallback((redirectTo?: string) => {
    if (typeof redirectTo === 'string') {
      setPendingRoute(redirectTo)
      sessionStorage.setItem('auth_pending_route', redirectTo)
    }
    setIsModalOpen(true)
  }, [])
  const closeModal = useCallback(() => setIsModalOpen(false), [])

  const handleSelectCategory = useCallback(
    (id: string) => router.push(`/channels/${id}`),
    [router],
  )

  return (
    <AuthContextProvider
      value={{ isLoggedIn: !!accessToken, openLoginModal: openModal }}
    >
      <div className={styles.app}>
        <AppHeader onLoginClick={openModal} />

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
