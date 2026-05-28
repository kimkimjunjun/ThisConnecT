'use client'

import { useState } from 'react'
import { useAuthStore } from '@/features/auth'
import styles from './MyPage.module.scss'

const XP_PER_LEVEL = 100

export const MyPage = () => {
  const nickname = useAuthStore((s) => s.nickname)
  const role = useAuthStore((s) => s.role)
  const level = useAuthStore((s) => s.level)
  const updateNickname = useAuthStore((s) => s.updateNickname)

  const [nicknameInput, setNicknameInput] = useState(nickname ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [micVolume, setMicVolume] = useState(50)
  const [speakerVolume, setSpeakerVolume] = useState(80)
  const [isMicOn, setIsMicOn] = useState(true)

  const avatarChar = nickname ? nickname[0].toUpperCase() : '?'
  const currentXP = 0
  const requiredXP = (level + 1) * XP_PER_LEVEL
  const xpPercent = Math.min((currentXP / requiredXP) * 100, 100)

  const handleSaveNickname = async () => {
    const trimmed = nicknameInput.trim()
    if (!trimmed || isSaving) return
    setIsSaving(true)
    try {
      // TODO: 백엔드 API 연동
      updateNickname(trimmed)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={styles.container}>
      {/* Profile header */}
      <div className={styles.profileSection}>
        <div className={styles.avatarWrap}>
          <div className={styles.avatar}>{avatarChar}</div>
          <span className={styles.levelBadge}>Lv.{level}</span>
        </div>
        <div className={styles.profileInfo}>
          <h2 className={styles.profileName}>{nickname ?? '비회원'}</h2>
          <span className={styles.roleBadge}>
            {role === 'GUEST' ? '게스트' : '멤버'}
          </span>
        </div>
      </div>

      {/* Profile edit */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>프로필 편집</h3>
        <div className={styles.field}>
          <label className={styles.label}>닉네임</label>
          <div className={styles.inputRow}>
            <input
              className={styles.input}
              value={nicknameInput}
              onChange={(e) => {
                setNicknameInput(e.target.value)
                setSaveSuccess(false)
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveNickname()}
              maxLength={20}
              placeholder="닉네임 입력"
            />
            <button
              className={`${styles.saveBtn} ${saveSuccess ? styles.saveBtnSuccess : ''}`}
              onClick={handleSaveNickname}
              disabled={
                isSaving ||
                !nicknameInput.trim() ||
                nicknameInput.trim() === nickname
              }
            >
              {saveSuccess ? '저장됨 ✓' : isSaving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      </section>

      {/* Audio settings */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>오디오 설정</h3>
        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label className={styles.label}>
              <span className={styles.labelIcon}>🎤</span>
              마이크 볼륨
            </label>
            <span className={styles.volumeValue}>{micVolume}%</span>
          </div>
          <input
            type="range"
            className={styles.slider}
            min={0}
            max={100}
            value={micVolume}
            onChange={(e) => setMicVolume(Number(e.target.value))}
          />
        </div>
        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label className={styles.label}>
              <span className={styles.labelIcon}>🔊</span>
              스피커 볼륨
            </label>
            <span className={styles.volumeValue}>{speakerVolume}%</span>
          </div>
          <input
            type="range"
            className={styles.slider}
            min={0}
            max={100}
            value={speakerVolume}
            onChange={(e) => setSpeakerVolume(Number(e.target.value))}
          />
        </div>
        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label className={styles.label}>마이크 테스트</label>
            <button
              className={`${styles.micToggle} ${isMicOn ? styles.micToggleOn : styles.micToggleOff}`}
              onClick={() => setIsMicOn((v) => !v)}
            >
              {isMicOn ? '🎤 켜짐' : '🔇 꺼짐'}
            </button>
          </div>
        </div>
      </section>

      {/* Level section */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>레벨 정보</h3>
        <div className={styles.levelCard}>
          <div className={styles.levelHeader}>
            <span className={styles.levelNum}>Lv.{level}</span>
            <span className={styles.levelXP}>
              {currentXP} / {requiredXP} XP
            </span>
          </div>
          <div className={styles.xpBar}>
            <div
              className={styles.xpFill}
              style={{ width: `${xpPercent}%` }}
            />
          </div>
          <p className={styles.levelHint}>
            채팅방 활동을 통해 경험치를 획득할 수 있어요
          </p>
        </div>
      </section>
    </div>
  )
}
