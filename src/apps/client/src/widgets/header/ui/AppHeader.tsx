'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '@/features/auth'
import { env } from '@/shared/config'
import styles from './AppHeader.module.scss'

type Props = {
  isLoggedIn: boolean
  onLoginClick: () => void
}

export const AppHeader = ({ isLoggedIn, onLoginClick }: Props) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const nickname = useAuthStore((s) => s.nickname)
  const role = useAuthStore((s) => s.role)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  useEffect(() => {
    const onOutsideClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onOutsideClick)
    return () => document.removeEventListener('mousedown', onOutsideClick)
  }, [])

  const handleLogout = async () => {
    setOpen(false)
    try {
      await fetch(`${env.API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      clearAuth()
    }
  }

  const avatarChar = nickname ? nickname[0].toUpperCase() : '?'

  return (
    <header className={styles.header}>
      <span className={styles.logo}>ThisConnecT</span>

      <div className={styles.userSection} ref={ref}>
        {isLoggedIn ? (
          <>
            <button
              className={styles.userButton}
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={open}
            >
              <span className={styles.avatar}>{avatarChar}</span>
              <span className={styles.userName}>{nickname ?? '비회원'}</span>
              <span className={styles.role}>
                {role === 'GUEST' ? '게스트' : '멤버'}
              </span>
              <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}>
                ▾
              </span>
            </button>

            {open && (
              <ul className={styles.dropdown} role="menu">
                <li role="none">
                  <button className={styles.dropdownItem} role="menuitem">
                    마이페이지
                  </button>
                </li>
                <li role="none">
                  <div className={styles.divider} aria-hidden="true" />
                </li>
                <li role="none">
                  <button
                    className={`${styles.dropdownItem} ${styles.danger}`}
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    로그아웃
                  </button>
                </li>
              </ul>
            )}
          </>
        ) : (
          <button className={styles.loginButton} onClick={onLoginClick}>
            로그인
          </button>
        )}
      </div>
    </header>
  )
}
