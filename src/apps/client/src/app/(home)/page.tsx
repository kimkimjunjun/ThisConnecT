import { DashboardLayout } from '@/widgets/dashboard-layout'
import styles from './page.module.scss'

export default function Page() {
  return (
    <DashboardLayout>
      <div className={styles.empty}>
        <span className={styles.icon}>#</span>
        <h2 className={styles.title}>채널을 선택해 주세요</h2>
        <p className={styles.desc}>
          왼쪽 목록에서 채널을 선택하면 채팅방을 둘러볼 수 있어요
        </p>
      </div>
    </DashboardLayout>
  )
}
