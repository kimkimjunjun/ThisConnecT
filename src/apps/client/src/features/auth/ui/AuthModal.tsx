'use client'

import { useState, useEffect, useRef } from 'react'
import { redirectToKakao, redirectToGoogle } from '../lib/oauth'
import { postGuestLogin } from '../api/auth-api'
import { useAuthStore } from '../store/auth-store'
import { KakaoIcon, GoogleIcon } from '@/shared/assets/icons'
import styles from './AuthModal.module.scss'

type Step = 'auth' | 'nickname'

type Props = {
  isOpen: boolean
  onClose: () => void
}

export const AuthModal = ({ isOpen, onClose }: Props) => {
  const [step, setStep] = useState<Step>('auth')
  const [nickname, setNickname] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const mouseDownOnBackdrop = useRef(false)
  const setAuth = useAuthStore((s) => s.setAuth)

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false)
    } else {
      setStep('auth')
      setNickname('')
    }
  }, [isOpen])

  const handleClose = () => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 200)
  }

  if (!isOpen && !isClosing) return null

  const handleSubmitNickname = async () => {
    const trimmed = nickname.trim()
    if (!trimmed || isPending) return

    setIsPending(true)
    try {
      const data = await postGuestLogin(trimmed)
      setAuth(data)
      onClose()
    } catch {
      // TODO: 에러 토스트 처리
    } finally {
      setIsPending(false)
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
        key={step}
        onClick={(e) => e.stopPropagation()}
      >
        {step === 'auth' ? (
          <>
            <div className={styles.header}>
              <h1 className={styles.logo}>ThisConnecT</h1>
              <p className={styles.description}>계정으로 시작하세요</p>
            </div>

            <div className={styles.buttons}>
              <button
                className={`${styles.button} ${styles.guestButton}`}
                onClick={() => setStep('nickname')}
              >
                비회원으로 들어가기
              </button>

              <button
                className={`${styles.button} ${styles.kakaoButton}`}
                onClick={redirectToKakao}
              >
                <KakaoIcon />
                카카오 로그인
              </button>

              <button
                className={`${styles.button} ${styles.googleButton}`}
                onClick={redirectToGoogle}
              >
                <GoogleIcon />
                구글 로그인
              </button>
            </div>
          </>
        ) : (
          <>
            <p className={styles.nicknameTitle}>사용하실 닉네임을 입력해주세요</p>

            <div className={styles.nicknameRow}>
              <input
                className={styles.nicknameInput}
                type="text"
                placeholder="닉네임"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitNickname()}
                autoFocus
                maxLength={20}
                disabled={isPending}
              />
              <button
                className={styles.submitButton}
                onClick={handleSubmitNickname}
                disabled={isPending || !nickname.trim()}
              >
                {isPending ? '접속 중...' : '접속하기'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

