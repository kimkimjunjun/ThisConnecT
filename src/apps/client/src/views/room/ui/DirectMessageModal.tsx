'use client'

import { useState, useRef } from 'react'
import { sendDirectMessage } from '@/features/message'
import styles from './ActionModal.module.scss'

type Props = {
  targetNickname: string
  onClose: () => void
}

export const DirectMessageModal = ({ targetNickname, onClose }: Props) => {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const mouseDownOnBackdrop = useRef(false)

  const handleClose = () => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(onClose, 200)
  }

  const handleSubmit = async () => {
    if (!content.trim()) return
    setIsLoading(true)
    setError(null)
    try {
      await sendDirectMessage(targetNickname, content.trim())
      setSuccess(true)
      setTimeout(handleClose, 1200)
    } catch {
      setError('쪽지 발송에 실패했습니다. 다시 시도해주세요.')
      setIsLoading(false)
    }
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
      >
        <h3 className={styles.title}>쪽지 보내기</h3>
        <p className={styles.target}>{targetNickname} 님에게 쪽지를 보냅니다.</p>

        {success ? (
          <p className={styles.successMsg}>쪽지가 발송되었습니다.</p>
        ) : (
          <>
            <label className={styles.label}>
              내용
              <textarea
                className={styles.textarea}
                placeholder="쪽지 내용을 입력하세요 (최대 500자)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={500}
                rows={4}
                autoFocus
                disabled={isLoading}
              />
              <span className={styles.charCount}>{content.length} / 500</span>
            </label>

            {error && <p className={styles.errorMsg}>{error}</p>}

            <div className={styles.actions}>
              <button className={styles.cancelBtn} onClick={handleClose} disabled={isLoading}>
                취소
              </button>
              <button
                className={styles.submitBtn}
                onClick={handleSubmit}
                disabled={isLoading || !content.trim()}
              >
                {isLoading ? '전송 중...' : '보내기'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
