'use client'

import dynamic from 'next/dynamic'
import styles from './AppHeader.module.scss'

type Props = {
  onLoginClick: () => void
}

// ssr: false → UserSection은 서버 HTML에 포함되지 않음
// 클라이언트 마운트 시 Zustand가 이미 localStorage를 읽은 상태이므로
// 첫 렌더부터 올바른 인증 상태를 표시 (로그인 버튼 flash 없음)
const UserSection = dynamic(() => import('./UserSection'), {
  ssr: false,
  loading: () => <div className={styles.userSkeleton} />,
})

export const AppHeader = ({ onLoginClick }: Props) => {
  return (
    <header className={styles.header}>
      <span className={styles.logo}>ThisConnecT</span>
      <UserSection onLoginClick={onLoginClick} />
    </header>
  )
}
