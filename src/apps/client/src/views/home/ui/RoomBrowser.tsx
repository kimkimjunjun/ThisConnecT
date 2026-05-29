'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/features/auth'
import { type ChannelRoom } from '@/features/channel'
import { CreateRoomModal } from './CreateRoomModal'
import styles from './RoomBrowser.module.scss'

type Props = {
  categoryId: string
  categoryName: string
  rooms: ChannelRoom[]
  onRoomCreated?: () => void
}

const PAGE_SIZE = 8

export const RoomBrowser = ({ categoryId, categoryName, rooms, onRoomCreated }: Props) => {
  const [query, setQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()
  const { isLoggedIn, openLoginModal } = useAuthContext()

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
            <button className={styles.addRoomBtn} onClick={handleAddRoom}>
              채팅방 추가
            </button>
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
              <button className={styles.addRoomBtn} onClick={handleAddRoom}>
                채팅방 추가
              </button>
            </div>
            <span className={styles.metaCount}>{filtered.length}개의 채팅방</span>
          </div>

          {filtered.length > 0 ? (
            <div className={styles.grid}>
              {filtered.map((room) => {
                const isFull = room.currentCount >= room.maxCount
                const handleClick = () => {
                  if (isFull) return
                  const dest = `/channels/${categoryId}/rooms/${room.id}`
                  if (!isLoggedIn) { openLoginModal(dest); return }
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

const SearchIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)
