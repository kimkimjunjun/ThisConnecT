"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth";
import { useMemberInfo } from "@/features/member";
import { useAudioStore } from "@/features/audio";
import { useRoom, useVoiceChat } from "@/features/chat";
import { type ChannelRoom } from "@/features/channel";
import {
  PencilIcon,
  MicOnIcon,
  MicOffIcon,
  SpeakerOnIcon,
  SpeakerOffIcon,
  PhoneOffIcon,
} from "@/shared/assets/icons";
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
  const myRole = useAuthStore((s) => s.role);
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
  const isComposingRef = useRef(false);

  const {
    messages,
    participants,
    connected,
    sendMessage,
    isDuplicate,
    isRoomFull,
    mySessionId,
    sendVoiceSignal,
    setVoiceSignalCallback,
  } = useRoom(currentRoom.id.toString(), accessToken, nickname);

  useVoiceChat({
    mySessionId,
    participants,
    sendVoiceSignal,
    setVoiceSignalCallback,
    isMicOn,
    isSpeakerOn,
    speakerVolume,
  });

  useEffect(() => {
    if (isDuplicate) {
      router.replace(`/channels/${categoryId}`);
    }
  }, [isDuplicate, router, categoryId]);

  useEffect(() => {
    if (isRoomFull) {
      router.replace(`/channels/${categoryId}`);
    }
  }, [isRoomFull, router, categoryId]);

  const displayParticipants = useMemo(
    () => participants.map((p) => ({ ...p, isMe: p.nickname === nickname })),
    [participants, nickname],
  );

  const levelByNickname = useMemo(
    () => new Map(participants.map((p) => [p.nickname, p.level])),
    [participants],
  );

  const amIOwner = useMemo(
    () => displayParticipants.some((p) => p.isMe && p.isOwner),
    [displayParticipants],
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
          {amIOwner && (
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
                  {p.isOwner && <span className={styles.ownerBadge}>방장</span>}
                </span>
                <span className={`${styles.levelBadge} ${getLevelTierClass(p.level)}`}>
                  Lv.{p.level}
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
        {!connected && <span className={styles.connectingBadge}>연결 중…</span>}
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
            {currentRoom.title} 채팅방에 오신 것을 환영합니다!
          </h3>
          <p className={styles.welcomeSub}>이 채팅방의 시작점입니다.</p>
        </div>
        {messages.map((msg, i) => {
          if (msg.type === "JOIN" || msg.type === "LEAVE") {
            return (
              <div key={i} className={styles.systemMessage}>
                {msg.sender}님이 {msg.type === "JOIN" ? "입장" : "퇴장"}
                했습니다.
              </div>
            );
          }
          const isMe = msg.sender === nickname;
          const isAdminSender = isMe && myRole === "ADMIN";
          const senderLevel = isMe
            ? storedLevel
            : (levelByNickname.get(msg.sender) ?? 0);
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
                  <span
                    className={`${styles.levelBadge} ${isAdminSender ? styles.tierLegend : getLevelTierClass(senderLevel)}`}
                  >
                    {isAdminSender ? "관리자" : `Lv.${senderLevel}`}
                  </span>
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
            onCompositionStart={() => { isComposingRef.current = true }}
            onCompositionEnd={() => { isComposingRef.current = false }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !isComposingRef.current) {
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
            <span className={styles.dropdownRowLabel}>
              {isOn ? "켜짐" : "꺼짐"}
            </span>
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

