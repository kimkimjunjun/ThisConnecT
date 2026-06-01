'use client'

import styles from './KickedModal.module.scss'

type Props = {
  onConfirm: () => void
}

export const RoomFullModal = ({ onConfirm }: Props) => (
  <div className={styles.backdrop}>
    <div className={styles.modal}>
      <span className={styles.icon}>🚫</span>
      <h3 className={styles.title}>입장할 수 없습니다</h3>
      <p className={styles.desc}>채팅방 인원이 가득 찼습니다.</p>
      <button className={styles.confirmBtn} onClick={onConfirm}>
        확인
      </button>
    </div>
  </div>
)
