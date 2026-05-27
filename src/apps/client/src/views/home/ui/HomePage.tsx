import { AuthModal } from '@/features/auth'
import styles from './HomePage.module.scss'

export const HomePage = () => {
  return (
    <main className={styles.page}>
      <AuthModal />
    </main>
  )
}
