'use client'

import styles from './KickedModal.module.scss'

type Props = {
  onConfirm: () => void
}

export const KickedModal = ({ onConfirm }: Props) => (
  <div className={styles.backdrop}>
    <div className={styles.modal}>
      <span className={styles.icon}>🚫</span>
      <h3 className={styles.title}>강제퇴장 당했습니다</h3>
      <p className={styles.desc}>방장에 의해 채팅방에서 퇴장되었습니다.</p>
      <button className={styles.confirmBtn} onClick={onConfirm}>
        확인
      </button>
    </div>
  </div>
)
