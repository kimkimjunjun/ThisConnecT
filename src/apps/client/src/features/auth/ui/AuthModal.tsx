'use client'

import { useState } from 'react'
import styles from './AuthModal.module.scss'

type Step = 'auth' | 'nickname'

export const AuthModal = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [step, setStep] = useState<Step>('auth')
  const [nickname, setNickname] = useState('')

  if (!isOpen) return null

  const handleKakaoLogin = () => {
    // TODO: Kakao OAuth redirect
  }

  const handleGoogleLogin = () => {
    // TODO: Google OAuth redirect
  }

  const handleSubmitNickname = () => {
    if (!nickname.trim()) return
    // TODO: 비회원 세션 처리
    setIsOpen(false)
  }

  return (
    <div className={styles.backdrop} onClick={() => setIsOpen(false)}>
      {/* key={step}으로 step 변경 시 모달을 리마운트 → modal-in 애니메이션 재실행 */}
      <div className={styles.modal} key={step} onClick={(e) => e.stopPropagation()}>
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
                onClick={handleKakaoLogin}
              >
                <KakaoIcon />
                카카오 로그인
              </button>

              <button
                className={`${styles.button} ${styles.googleButton}`}
                onClick={handleGoogleLogin}
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
              />
              <button
                className={styles.submitButton}
                onClick={handleSubmitNickname}
              >
                접속하기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const KakaoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path
      d="M9 1.5C4.858 1.5 1.5 4.134 1.5 7.368c0 2.07 1.356 3.888 3.402 4.944l-.87 3.24a.225.225 0 0 0 .348.243l3.798-2.52A8.88 8.88 0 0 0 9 13.236c4.142 0 7.5-2.634 7.5-5.868S13.142 1.5 9 1.5z"
      fill="#191919"
    />
  </svg>
)

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path
      d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      fill="#4285F4"
    />
    <path
      d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      fill="#34A853"
    />
    <path
      d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      fill="#FBBC05"
    />
    <path
      d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      fill="#EA4335"
    />
  </svg>
)
