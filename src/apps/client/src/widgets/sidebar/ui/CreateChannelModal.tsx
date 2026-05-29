'use client'

import { useState } from 'react'
import { createChannel } from '@/features/channel'
import styles from './CreateChannelModal.module.scss'

type Props = {
  onClose: () => void
  onCreated: () => void
}

export const CreateChannelModal = ({ onClose, onCreated }: Props) => {
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const isValid = name.trim().length > 0

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
    if (e.key === 'Escape') onClose()
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
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
          <button className={styles.cancelBtn} onClick={onClose} disabled={isLoading}>
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
