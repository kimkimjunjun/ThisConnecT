'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createRoom } from '@/features/channel'
import styles from './CreateRoomModal.module.scss'

type Props = {
  channelId: string
  onClose: () => void
  onCreated: () => void
}

export const CreateRoomModal = ({ channelId, onClose, onCreated }: Props) => {
  const [title, setTitle] = useState('')
  const [maxCount, setMaxCount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const mouseDownOnBackdrop = useRef(false)
  const router = useRouter()

  const isValid = title.trim().length > 0 && parseInt(maxCount, 10) >= 1

  const handleClose = () => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(onClose, 200)
  }

  const handleSubmit = async () => {
    if (!isValid) return
    setIsLoading(true)
    try {
      const newRoom = await createRoom(channelId, { title: title.trim(), maxCount: parseInt(maxCount, 10) })
      onCreated()
      router.push(`/channels/${channelId}/rooms/${newRoom.id}`)
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
        <h3 className={styles.title}>채팅방 만들기</h3>

        <div className={styles.fields}>
          <label className={styles.label}>
            채팅방 제목
            <input
              className={styles.input}
              placeholder="채팅방 제목을 입력하세요"
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
              placeholder="최대 인원 (예: 10)"
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
            {isLoading ? '생성 중...' : '채팅방 생성'}
          </button>
        </div>
      </div>
    </div>
  )
}
