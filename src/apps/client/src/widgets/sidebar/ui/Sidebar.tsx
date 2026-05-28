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
}

export const Sidebar = ({ rooms, activeRoomId, onSelectRoom }: Props) => {
  return (
    <nav className={styles.sidebar}>
      <div className={styles.section}>
        <span className={styles.sectionLabel}>채팅방</span>
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
