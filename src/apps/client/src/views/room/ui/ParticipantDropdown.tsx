'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import styles from './ParticipantDropdown.module.scss'

type Props = {
  nickname: string
  level: number
  isOwner: boolean
  amIOwner: boolean
  anchor: DOMRect
  onKick: () => void
  onMessage: () => void
  onReport: () => void
  onClose: () => void
}

const getLevelTierClass = (level: number): string => {
  if (level >= 50) return styles.tierLegend
  if (level >= 30) return styles.tierPlatinum
  if (level >= 20) return styles.tierGold
  if (level >= 10) return styles.tierSilver
  if (level >= 5) return styles.tierBronze
  return styles.tierNovice
}

export const ParticipantDropdown = ({
  nickname,
  level,
  isOwner,
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

  const profileSection = (
    <div className={styles.profile}>
      <div className={styles.profileAvatar}>{nickname[0].toUpperCase()}</div>
      <div className={styles.profileMeta}>
        <span className={styles.profileName}>
          {nickname}
          {isOwner && <span className={styles.ownerBadge}>방장</span>}
        </span>
        <span className={`${styles.levelBadge} ${getLevelTierClass(level)}`}>
          Lv.{level}
        </span>
      </div>
    </div>
  )

  const content = kickConfirm ? (
    <div className={styles.dropdown} style={style} ref={ref}>
      {profileSection}
      <div className={styles.divider} />
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
      {profileSection}
      <div className={styles.divider} />
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
