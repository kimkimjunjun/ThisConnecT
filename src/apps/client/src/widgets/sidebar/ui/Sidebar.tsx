'use client'

import styles from './Sidebar.module.scss'

type Room = {
  id: string
  name: string
  unread?: number
}

type Props = {
  rooms: Room[]
  activeRoomId: string | null
  onSelectRoom: (id: string) => void
  onAddChannel?: () => void
}

export const Sidebar = ({ rooms, activeRoomId, onSelectRoom, onAddChannel }: Props) => {
  return (
    <nav className={styles.sidebar}>
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>채팅방</span>
          {onAddChannel && (
            <button
              className={styles.addChannelBtn}
              onClick={onAddChannel}
              title="채널 추가"
            >
              +
            </button>
          )}
        </div>
        <ul className={styles.roomList}>
          {rooms.map((room) => (
            <li key={room.id}>
              <button
                className={`${styles.roomItem} ${activeRoomId === room.id ? styles.active : ''}`}
                onClick={() => onSelectRoom(room.id)}
              >
                <span className={styles.hash}>#</span>
                <span className={styles.roomName}>{room.name}</span>
                {!!room.unread && (
                  <span className={styles.badge}>{room.unread}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
