'use client'

import { useState, useRef } from 'react'
import { updateRoom, type ChannelRoom } from '@/features/channel'
import styles from './EditRoomModal.module.scss'

type Props = {
  room: ChannelRoom
  channelId: string
  onClose: () => void
  onUpdated: (updated: ChannelRoom) => void
}

export const EditRoomModal = ({ room, channelId, onClose, onUpdated }: Props) => {
  const [title, setTitle] = useState(room.title)
  const [maxCount, setMaxCount] = useState(String(room.maxCount))
  const [isLoading, setIsLoading] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const mouseDownOnBackdrop = useRef(false)

  const isValid =
    title.trim().length > 0 &&
    parseInt(maxCount, 10) >= 1 &&
    (title.trim() !== room.title || parseInt(maxCount, 10) !== room.maxCount)

  const handleClose = () => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(onClose, 200)
  }

  const handleSubmit = async () => {
    if (!isValid) return
    setIsLoading(true)
    try {
      const updated = await updateRoom(channelId, room.id, {
        title: title.trim(),
        maxCount: parseInt(maxCount, 10),
      })
      onUpdated(updated)
      onClose()
    } catch {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid && !isLoading) handleSubmit()
    if (e.key === 'Escape') handleClose()
  }

  return (
    <div
      className={`${styles.backdrop} ${isClosing ? styles.backdropClosing : ''}`}
      onMouseDown={(e) => { mouseDownOnBackdrop.current = e.target === e.currentTarget }}
      onClick={() => { if (mouseDownOnBackdrop.current) handleClose() }}
    >
      <div
        className={`${styles.modal} ${isClosing ? styles.modalClosing : ''}`}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <h3 className={styles.title}>채팅방 수정</h3>

        <div className={styles.fields}>
          <label className={styles.label}>
            채팅방 제목
            <input
              className={styles.input}
              placeholder="채팅방 제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={50}
              autoFocus
            />
          </label>
          <label className={styles.label}>
            제한 인원수
            <input
              className={styles.input}
              type="number"
              placeholder="최대 인원"
              value={maxCount}
              onChange={(e) => setMaxCount(e.target.value)}
              min={1}
              max={100}
            />
          </label>
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={handleClose} disabled={isLoading}>
            닫기
          </button>
          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={isLoading || !isValid}
          >
            {isLoading ? '수정 중...' : '수정하기'}
          </button>
        </div>
      </div>
    </div>
  )
}
