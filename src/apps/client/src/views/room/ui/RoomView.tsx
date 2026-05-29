"use client";

import { useState, useEffect, useRef, useCallback, useMemo, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth";
import { useMemberInfo } from "@/features/member";
import { useAudioStore } from "@/features/audio";
import { useRoom } from "@/features/chat";
import { type ChannelRoom } from "@/features/channel";
import { EditRoomModal } from "./EditRoomModal";
import styles from "./RoomView.module.scss";

const getLevelTierClass = (level: number): string => {
  if (level >= 50) return styles.tierLegend;
  if (level >= 30) return styles.tierPlatinum;
  if (level >= 20) return styles.tierGold;
  if (level >= 10) return styles.tierSilver;
  if (level >= 5) return styles.tierBronze;
  return styles.tierNovice;
};

const formatTime = (timestamp: string): string =>
  new Date(timestamp).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });

type Props = {
  room: ChannelRoom;
  categoryId: string;
};

export const RoomView = ({ room, categoryId }: Props) => {
  const router = useRouter();
  const nickname = useAuthStore((s) => s.nickname);
  const storedLevel = useAuthStore((s) => s.level);
  const accessToken = useAuthStore((s) => s.accessToken);
  useMemberInfo();

  const [currentRoom, setCurrentRoom] = useState(room);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const isMicOn = useAudioStore((s) => s.isMicOn);
  const isSpeakerOn = useAudioStore((s) => s.isSpeakerOn);
  const micVolume = useAudioStore((s) => s.micVolume);
  const speakerVolume = useAudioStore((s) => s.speakerVolume);
  const setIsMicOn = useAudioStore((s) => s.setIsMicOn);
  const setIsSpeakerOn = useAudioStore((s) => s.setIsSpeakerOn);
  const setMicVolume = useAudioStore((s) => s.setMicVolume);
  const setSpeakerVolume = useAudioStore((s) => s.setSpeakerVolume);

  const [inputText, setInputText] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);

  const { messages, participants, connected, sendMessage, isDuplicate } = useRoom(
    currentRoom.id.toString(),
    accessToken,
    nickname,
  );

  useEffect(() => {
    if (isDuplicate) {
      router.replace(`/channels/${categoryId}`)
    }
  }, [isDuplicate, router, categoryId]);

  const displayParticipants = useMemo(
    () => participants.map((p) => ({ ...p, isMe: p.nickname === nickname })),
    [participants, nickname],
  );

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text || !connected) return;
    sendMessage(text);
    setInputText("");
  }, [inputText, connected, sendMessage]);

  return (
    <div className={styles.container}>
      {/* Room Header */}
      <div className={styles.roomHeader}>
        <button
          className={styles.backButton}
          onClick={() => router.push(`/channels/${categoryId}`)}
        >
          ‹ 뒤로
        </button>
        <span className={styles.headerDivider} />
        <span className={styles.voiceIcon}>🔊</span>
        <div className={styles.titleGroup}>
          <span className={styles.roomTitle}>{currentRoom.title}</span>
          {accessToken && (
            <button
              className={styles.editRoomBtn}
              onClick={() => setIsEditModalOpen(true)}
              title="채팅방 수정"
            >
              <PencilIcon />
            </button>
          )}
        </div>
        <span className={styles.participantCount}>
          {displayParticipants.length}/{currentRoom.maxCount}명
        </span>
      </div>

      {/* Participants */}
      <div className={styles.participantsSection}>
        <span className={styles.sectionLabel}>
          참여자 · {displayParticipants.length}명
        </span>
        <div className={styles.participantsList}>
          {displayParticipants.map((p) => (
            <div key={p.sessionId} className={styles.participantItem}>
              <div
                className={`${styles.participantAvatar} ${p.isMe ? styles.avatarMe : ""}`}
              >
                {p.nickname[0].toUpperCase()}
                {p.isMe && (
                  <span className={isMicOn ? styles.micDot : styles.mutedDot} />
                )}
              </div>
              <div className={styles.participantMeta}>
                <span className={styles.participantName}>
                  {p.nickname}
                  {p.isMe && <span className={styles.meBadge}>나</span>}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audio Controls */}
      <div className={styles.audioControls}>
        <AudioControl
          label="마이크"
          isOn={isMicOn}
          volume={micVolume}
          onToggle={() => setIsMicOn(!isMicOn)}
          onVolumeChange={setMicVolume}
          iconOn={<MicOnIcon />}
          iconOff={<MicOffIcon />}
        />
        <AudioControl
          label="스피커"
          isOn={isSpeakerOn}
          volume={speakerVolume}
          onToggle={() => setIsSpeakerOn(!isSpeakerOn)}
          onVolumeChange={setSpeakerVolume}
          iconOn={<SpeakerOnIcon />}
          iconOff={<SpeakerOffIcon />}
        />
        {!connected && (
          <span className={styles.connectingBadge}>연결 중…</span>
        )}
        <button
          className={styles.leaveBtn}
          onClick={() => router.push(`/channels/${categoryId}`)}
        >
          <PhoneOffIcon />
          <span>나가기</span>
        </button>
      </div>

      {/* Chat */}
      <div className={styles.chatArea} ref={chatRef}>
        <div className={styles.chatWelcome}>
          <span className={styles.welcomeIcon}>🔊</span>
          <h3 className={styles.welcomeTitle}>
            {currentRoom.title} 채널에 오신 것을 환영합니다!
          </h3>
          <p className={styles.welcomeSub}>이 채널의 시작점입니다.</p>
        </div>
        {messages.map((msg, i) => {
          if (msg.type === "JOIN" || msg.type === "LEAVE") {
            return (
              <div key={i} className={styles.systemMessage}>
                {msg.sender}님이 {msg.type === "JOIN" ? "입장" : "퇴장"}했습니다.
              </div>
            );
          }
          const isMe = msg.sender === nickname;
          return (
            <div key={i} className={styles.messageItem}>
              <div
                className={`${styles.messageAvatar} ${isMe ? styles.messageAvatarMe : ""}`}
              >
                {msg.sender[0].toUpperCase()}
              </div>
              <div className={styles.messageBody}>
                <div className={styles.messageHeader}>
                  <span
                    className={`${styles.messageSender} ${isMe ? styles.messageSenderMe : ""}`}
                  >
                    {msg.sender}
                  </span>
                  {isMe && (
                    <span
                      className={`${styles.levelBadge} ${getLevelTierClass(storedLevel)}`}
                    >
                      Lv.{storedLevel}
                    </span>
                  )}
                  <span className={styles.messageTime}>
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                <p className={styles.messageText}>{msg.content}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className={styles.inputArea}>
        <div className={styles.inputRow}>
          <input
            className={styles.chatInput}
            placeholder={
              connected
                ? `#${currentRoom.title} 에 메시지 보내기`
                : "연결 중..."
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={!connected}
          />
          <button
            className={styles.sendButton}
            onClick={handleSend}
            disabled={!inputText.trim() || !connected}
          >
            전송
          </button>
        </div>
      </div>

      {isEditModalOpen && (
        <EditRoomModal
          room={currentRoom}
          channelId={categoryId}
          onClose={() => setIsEditModalOpen(false)}
          onUpdated={(updated) => {
            setCurrentRoom(updated);
            setIsEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

const PencilIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

type AudioControlProps = {
  label: string;
  isOn: boolean;
  volume: number;
  onToggle: () => void;
  onVolumeChange: (v: number) => void;
  iconOn: ReactNode;
  iconOff: ReactNode;
};

const AudioControl = ({
  label,
  isOn,
  volume,
  onToggle,
  onVolumeChange,
  iconOn,
  iconOff,
}: AudioControlProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className={styles.audioControl} ref={ref}>
      <button
        className={`${styles.audioIconBtn} ${isOn ? styles.audioIconOn : styles.audioIconOff}`}
        onClick={() => setOpen((v) => !v)}
        title={label}
      >
        {isOn ? iconOn : iconOff}
      </button>
      {open && (
        <div className={styles.audioDropdown}>
          <span className={styles.dropdownLabel}>{label}</span>
          <div className={styles.dropdownRow}>
            <span className={styles.dropdownRowLabel}>{isOn ? "켜짐" : "꺼짐"}</span>
            <button
              className={`${styles.toggleSwitch} ${isOn ? styles.toggleOn : ""}`}
              onClick={onToggle}
              aria-pressed={isOn}
            >
              <span className={styles.toggleKnob} />
            </button>
          </div>
          {isOn && (
            <div className={styles.dropdownRow}>
              <span className={styles.dropdownRowLabel}>음량 {volume}%</span>
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                className={styles.volumeSlider}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const MicOnIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const MicOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const SpeakerOnIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

const SpeakerOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
);

const PhoneOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 2 2 0 0 1-.45-2.11 12.84 12.84 0 0 0 .7-2.81 2 2 0 0 1-.45-2.11z" />
    <line x1="23" y1="1" x2="1" y2="23" />
  </svg>
);
