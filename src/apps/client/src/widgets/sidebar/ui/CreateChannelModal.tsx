'use client'

import { useState, useRef } from 'react'
import { createChannel } from '@/features/channel'
import styles from './CreateChannelModal.module.scss'

type Props = {
  onClose: () => void
  onCreated: () => void
}

export const CreateChannelModal = ({ onClose, onCreated }: Props) => {
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const mouseDownOnBackdrop = useRef(false)

  const isValid = name.trim().length > 0

  const handleClose = () => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(onClose, 200)
  }

  const handleSubmit = async () => {
    if (!isValid) return
    setIsLoading(true)
    try {
      await createChannel(name.trim())
      onCreated()
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
        <h3 className={styles.title}>채널 만들기</h3>
        <p className={styles.desc}>새 채널의 이름을 입력하세요</p>

        <label className={styles.label}>
          채널 이름
          <input
            className={styles.input}
            placeholder="채널 이름을 입력하세요"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={30}
            autoFocus
          />
        </label>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={handleClose} disabled={isLoading}>
            닫기
          </button>
          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={isLoading || !isValid}
          >
            {isLoading ? '생성 중...' : '채널 생성'}
          </button>
        </div>
      </div>
    </div>
  )
}
