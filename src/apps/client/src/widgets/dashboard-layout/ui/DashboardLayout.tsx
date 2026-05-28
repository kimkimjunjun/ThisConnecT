'use client'

import { useState, useEffect, useCallback, type ReactNode } from 'react'
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

export const DashboardLayout = ({ children }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const router = useRouter()
  const pathname = usePathname()
  const accessToken = useAuthStore((s) => s.accessToken)

  const activeCategoryId = pathname.match(/^\/channels\/([^/]+)/)?.[1] ?? null

  // Open modal on first visit if not logged in
  useEffect(() => {
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
