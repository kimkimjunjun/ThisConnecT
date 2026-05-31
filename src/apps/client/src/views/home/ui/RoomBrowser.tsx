'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext, useAuthStore } from '@/features/auth'
import { type ChannelRoom, getChannelRooms } from '@/features/channel'
import { SearchIcon, RefreshIcon } from '@/shared/assets/icons'
import { CreateRoomModal } from './CreateRoomModal'
import styles from './RoomBrowser.module.scss'

type Props = {
  categoryId: string
  categoryName: string
  rooms: ChannelRoom[]
  onRoomCreated?: () => void
  onRefresh?: () => void
  isRefreshing?: boolean
}

const PAGE_SIZE = 8

export const RoomBrowser = ({ categoryId, categoryName, rooms, onRoomCreated, onRefresh, isRefreshing = false }: Props) => {
  const [query, setQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()
  const { isLoggedIn, openLoginModal } = useAuthContext()
  const role = useAuthStore((s) => s.role)
  const canManage = role === 'USER' || role === 'ADMIN'

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const result = q
      ? rooms.filter((r) => r.title.toLowerCase().includes(q))
      : rooms
    return result.slice(0, PAGE_SIZE)
  }, [rooms, query])

  const handleAddRoom = useCallback(() => {
    if (!isLoggedIn) { openLoginModal(); return }
    setIsModalOpen(true)
  }, [isLoggedIn, openLoginModal])

  const handleCreated = useCallback(() => {
    onRoomCreated?.()
  }, [onRoomCreated])

  if (isRefreshing) {
    return (
      <div className={styles.container}>
        <div className={styles.searchWrap}>
          <SearchIcon className={styles.searchIcon} />
          <div className={styles.skeletonSearch} />
        </div>
        <div className={styles.meta}>
          <div className={styles.metaLeft}>
            <h2 className={styles.categoryTitle}>
              <span className={styles.hash}>#</span>
              {categoryName}
            </h2>
          </div>
        </div>
        <div className={styles.grid}>
          {Array.from({ length: rooms.length || 4 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {rooms.length === 0 ? (
        <>
          <div className={styles.meta}>
            <h2 className={styles.categoryTitle}>
              <span className={styles.hash}>#</span>
              {categoryName}
            </h2>
          </div>

          <div className={styles.emptyChannel}>
            <span className={styles.emptyChannelIcon}>💬</span>
            <p className={styles.emptyChannelText}>해당 채널에서 채팅방을 만들어보세요</p>
            {canManage && (
              <button className={styles.addRoomBtn} onClick={handleAddRoom}>
                채팅방 추가
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <div className={styles.searchWrap}>
            <SearchIcon className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="채팅방 검색..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button className={styles.clearBtn} onClick={() => setQuery('')}>
                ✕
              </button>
            )}
          </div>

          <div className={styles.meta}>
            <div className={styles.metaLeft}>
              <h2 className={styles.categoryTitle}>
                <span className={styles.hash}>#</span>
                {categoryName}
              </h2>
              {canManage && (
                <button className={styles.addRoomBtn} onClick={handleAddRoom}>
                  채팅방 추가
                </button>
              )}
              <button
                className={styles.refreshBtn}
                onClick={onRefresh}
                disabled={isRefreshing}
                title="새로고침"
              >
                <RefreshIcon />
              </button>
            </div>
            <span className={styles.metaCount}>{filtered.length}개의 채팅방</span>
          </div>

          {filtered.length > 0 ? (
            <div className={styles.grid}>
              {filtered.map((room) => {
                const isFull = room.currentCount >= room.maxCount
                const handleClick = async () => {
                  if (isFull) return
                  const dest = `/channels/${categoryId}/rooms/${room.id}`
                  if (!isLoggedIn) { openLoginModal(dest); return }
                  try {
                    const latest = await getChannelRooms(categoryId)
                    const fresh = latest.find((r) => r.id === room.id)
                    if (fresh && fresh.currentCount >= fresh.maxCount) return
                  } catch {
                    // API 실패 시 그냥 진입 (BE 게이트가 최종 방어)
                  }
                  router.push(dest)
                }
                return (
                  <button
                    key={room.id}
                    className={`${styles.card} ${isFull ? styles.cardFull : ''}`}
                    onClick={handleClick}
                    disabled={isFull}
                  >
                    <span className={styles.cardTitle}>{room.title}</span>
                    <div className={styles.cardFooter}>
                      <ParticipantBar
                        current={room.currentCount}
                        max={room.maxCount}
                      />
                      <span
                        className={`${styles.countText} ${isFull ? styles.countFull : ''}`}
                      >
                        {room.currentCount}/{room.maxCount}
                      </span>
                      {isFull && <span className={styles.fullBadge}>꽉 참</span>}
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>🔍</span>
              <p className={styles.emptyText}>검색 결과가 없습니다</p>
              <p className={styles.emptySubtext}>다른 검색어를 입력해 보세요</p>
            </div>
          )}
        </>
      )}

      {isModalOpen && (
        <CreateRoomModal
          channelId={categoryId}
          onClose={() => setIsModalOpen(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  )
}

// ─── Sub components ───────────────────────────────────────────────────────────

const ParticipantBar = ({
  current,
  max,
}: {
  current: number
  max: number
}) => {
  const pct = Math.min((current / max) * 100, 100)
  const isFull = current >= max

  return (
    <div className={styles.bar}>
      <div
        className={`${styles.barFill} ${isFull ? styles.barFull : ''}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
