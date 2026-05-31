"use client";

import { useState } from "react";
import { TrashIcon } from "@/shared/assets/icons";
import styles from "./Sidebar.module.scss";

type Room = {
  id: string;
  name: string;
  unread?: number;
};

type Props = {
  rooms: Room[];
  activeRoomId: string | null;
  onSelectRoom: (id: string) => void;
  onAddChannel?: () => void;
  onDeleteChannel?: (id: string) => void;
};

export const Sidebar = ({
  rooms,
  activeRoomId,
  onSelectRoom,
  onAddChannel,
  onDeleteChannel,
}: Props) => {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const targetName = rooms.find((r) => r.id === confirmId)?.name ?? "";

  const handleConfirmDelete = async () => {
    if (!confirmId) return;
    setIsDeleting(true);
    try {
      await onDeleteChannel?.(confirmId);
    } finally {
      setIsDeleting(false);
      setConfirmId(null);
    }
  };

  return (
    <nav className={styles.sidebar}>
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>채널</span>
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
            <li key={room.id} className={styles.roomRow}>
              <button
                className={`${styles.roomItem} ${activeRoomId === room.id ? styles.active : ""}`}
                onClick={() => onSelectRoom(room.id)}
              >
                <span className={styles.hash}>#</span>
                <span className={styles.roomName}>{room.name}</span>
                {!!room.unread && (
                  <span className={styles.badge}>{room.unread}</span>
                )}
              </button>
              {onDeleteChannel && (
                <button
                  className={styles.deleteChannelBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmId(room.id);
                  }}
                  title="채널 삭제"
                >
                  <TrashIcon />
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {confirmId && (
        <div className={styles.confirmBackdrop} onClick={() => setConfirmId(null)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <span className={styles.confirmIcon}>🗑️</span>
            <h3 className={styles.confirmTitle}>채널을 삭제할까요?</h3>
            <p className={styles.confirmDesc}>
              <strong>#{targetName}</strong> 채널과 하위 채팅방이 모두 삭제됩니다.<br />
              이 작업은 되돌릴 수 없습니다.
            </p>
            <div className={styles.confirmActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setConfirmId(null)}
                disabled={isDeleting}
              >
                취소
              </button>
              <button
                className={styles.deleteBtn}
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
