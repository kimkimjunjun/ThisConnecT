'use client'

import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'

let initialModalShown = false
let permissionRequested = false
import {
  AuthModal,
  useAuthStore,
  AuthContextProvider,
} from '@/features/auth'
import { AppHeader } from '@/widgets/header'
import { Sidebar, CreateChannelModal } from '@/widgets/sidebar'
import { useChannels } from '@/features/channel'
import styles from './DashboardLayout.module.scss'

type Props = { children: ReactNode }

export const DashboardLayout = ({ children }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false)
  const [pendingRoute, setPendingRoute] = useState<string | null>(null)

  const router = useRouter()
  const pathname = usePathname()
  const accessToken = useAuthStore((s) => s.accessToken)

  const { channels, refresh: refreshChannels } = useChannels()
  const sidebarRooms = channels.map((c) => ({ id: c.id.toString(), name: c.name }))

  const activeCategoryId = pathname.match(/^\/channels\/([^/]+)/)?.[1] ?? null

  useEffect(() => {
    if (initialModalShown) return
    initialModalShown = true
    if (!useAuthStore.getState().accessToken) {
      setIsModalOpen(true)
    }
  }, [])

  useEffect(() => {
    if (permissionRequested) return
    permissionRequested = true
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => stream.getTracks().forEach((t) => t.stop()))
      .catch(() => {})
  }, [])

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

  const handleAddChannel = useCallback(() => {
    if (!accessToken) { openModal(); return }
    setIsChannelModalOpen(true)
  }, [accessToken, openModal])

  return (
    <AuthContextProvider
      value={{ isLoggedIn: !!accessToken, openLoginModal: openModal }}
    >
      <div className={styles.app}>
        <AppHeader onLoginClick={openModal} />

        <div className={styles.body}>
          <Sidebar
            rooms={sidebarRooms}
            activeRoomId={activeCategoryId}
            onSelectRoom={handleSelectCategory}
            onAddChannel={handleAddChannel}
          />

          <main className={styles.content}>{children}</main>
        </div>

        <AuthModal isOpen={isModalOpen} onClose={closeModal} />

        {isChannelModalOpen && (
          <CreateChannelModal
            onClose={() => setIsChannelModalOpen(false)}
            onCreated={refreshChannels}
          />
        )}
      </div>
    </AuthContextProvider>
  )
}
