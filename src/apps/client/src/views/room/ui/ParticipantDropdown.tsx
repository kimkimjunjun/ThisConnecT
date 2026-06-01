'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import styles from './ParticipantDropdown.module.scss'

type Props = {
  nickname: string
  amIOwner: boolean
  anchor: DOMRect
  onKick: () => void
  onMessage: () => void
  onReport: () => void
  onClose: () => void
}

export const ParticipantDropdown = ({
  nickname,
  amIOwner,
  anchor,
  onKick,
  onMessage,
  onReport,
  onClose,
}: Props) => {
  const [kickConfirm, setKickConfirm] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const style: React.CSSProperties = {
    position: 'fixed',
    top: anchor.bottom + 4,
    left: anchor.left + anchor.width / 2,
    transform: 'translateX(-50%)',
  }

  const content = kickConfirm ? (
    <div className={styles.dropdown} style={style} ref={ref}>
      <p className={styles.confirmText}>{nickname}님을 퇴장시킬까요?</p>
      <div className={styles.confirmActions}>
        <button className={styles.item} onClick={() => setKickConfirm(false)}>
          취소
        </button>
        <button className={`${styles.item} ${styles.itemDanger}`} onClick={onKick}>
          퇴장
        </button>
      </div>
    </div>
  ) : (
    <div className={styles.dropdown} style={style} ref={ref}>
      {amIOwner && (
        <button
          className={`${styles.item} ${styles.itemDanger}`}
          onClick={() => setKickConfirm(true)}
        >
          강제퇴장
        </button>
      )}
      <button className={styles.item} onClick={onMessage}>
        쪽지보내기
      </button>
      <button className={`${styles.item} ${styles.itemWarn}`} onClick={onReport}>
        신고하기
      </button>
    </div>
  )

  return createPortal(content, document.body)
}
