'use client'

import { useState } from 'react'
import { createReport } from '@/features/report'
import styles from './ActionModal.module.scss'

type Props = {
  targetNickname: string
  targetMemberId: number | undefined
  onClose: () => void
}

export const ReportModal = ({ targetNickname, targetMemberId, onClose }: Props) => {
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const isValid = reason.trim().length > 0 && !!targetMemberId

  const handleClose = () => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(onClose, 200)
  }

  const handleSubmit = async () => {
    if (!isValid || !targetMemberId) return
    setIsLoading(true)
    setError(null)
    try {
      await createReport(targetMemberId, reason.trim())
      setSuccess(true)
      setTimeout(handleClose, 1200)
    } catch {
      setError('신고 접수에 실패했습니다. 다시 시도해주세요.')
      setIsLoading(false)
    }
  }

  return (
    <div
      className={`${styles.backdrop} ${isClosing ? styles.backdropClosing : ''}`}
      onClick={handleClose}
    >
      <div
        className={`${styles.modal} ${isClosing ? styles.modalClosing : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={styles.title}>신고하기</h3>
        <p className={styles.target}>{targetNickname} 님을 신고합니다.</p>

        {success ? (
          <p className={styles.successMsg}>신고가 접수되었습니다.</p>
        ) : (
          <>
            <label className={styles.label}>
              신고 사유
              <textarea
                className={styles.textarea}
                placeholder="신고 사유를 입력하세요 (최대 1000자)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={1000}
                rows={4}
                autoFocus
                disabled={isLoading}
              />
              <span className={styles.charCount}>{reason.length} / 1000</span>
            </label>

            {!targetMemberId && (
              <p className={styles.errorMsg}>현재 신고 기능을 사용할 수 없습니다.</p>
            )}
            {error && <p className={styles.errorMsg}>{error}</p>}

            <div className={styles.actions}>
              <button className={styles.cancelBtn} onClick={handleClose} disabled={isLoading}>
                취소
              </button>
              <button
                className={`${styles.submitBtn} ${styles.submitBtnDanger}`}
                onClick={handleSubmit}
                disabled={isLoading || !isValid}
              >
                {isLoading ? '신고 중...' : '신고하기'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
