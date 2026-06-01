"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth";
import { useMemberInfo } from "@/features/member";
import { useAudioStore } from "@/features/audio";
import { useRoom, useVoiceChat } from "@/features/chat";
import { type ChannelRoom } from "@/features/channel";
import type { ParticipantInfo } from "@/features/chat";
import {
  PencilIcon,
  MicOnIcon,
  MicOffIcon,
  SpeakerOnIcon,
  SpeakerOffIcon,
  PhoneOffIcon,
} from "@/shared/assets/icons";
import { EditRoomModal } from "./EditRoomModal";
import { ReportModal } from "./ReportModal";
import { DirectMessageModal } from "./DirectMessageModal";
import { KickedModal } from "./KickedModal";
import { RoomFullModal } from "./RoomFullModal";
import styles from "./RoomView.module.scss";

type DisplayParticipant = ParticipantInfo & { isMe: boolean };

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
  const role = useAuthStore((s) => s.role);
  useMemberInfo();

  const [currentRoom, setCurrentRoom] = useState(room);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownAnchor, setDropdownAnchor] = useState<DOMRect | null>(null);
  const [isDropdownClosing, setIsDropdownClosing] = useState(false);
  const [kickConfirmFor, setKickConfirmFor] = useState<string | null>(null);
  const [reportTarget, setReportTarget] = useState<DisplayParticipant | null>(null);
  const [dmTarget, setDmTarget] = useState<DisplayParticipant | null>(null);
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isComposingRef = useRef(false);

  const {
    messages,
    participants,
    connected,
    sendMessage,
    kickParticipant,
    isDuplicate,
    isRoomFull,
    isKicked,
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

  // GUEST 또는 미인증이면 다른 참여자 클릭 불가
  const canInteract = !!accessToken && role !== "GUEST";

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

  const activeParticipant = useMemo(
    () => displayParticipants.find((p) => p.sessionId === activeDropdown) ?? null,
    [displayParticipants, activeDropdown],
  );

  const closeDropdown = useCallback(() => {
    setIsDropdownClosing(true);
    setTimeout(() => {
      setIsDropdownClosing(false);
      setActiveDropdown(null);
      setDropdownAnchor(null);
      setKickConfirmFor(null);
    }, 120);
  }, []);

  const handleCardClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, sessionId: string) => {
      if (activeDropdown === sessionId) {
        closeDropdown();
      } else {
        setIsDropdownClosing(false);
        setActiveDropdown(sessionId);
        setDropdownAnchor(e.currentTarget.getBoundingClientRect());
        setKickConfirmFor(null);
      }
    },
    [activeDropdown, closeDropdown],
  );

  useEffect(() => {
    if (!activeDropdown) return;
    const handler = (e: MouseEvent) => {
      if ((e.target as Element).closest("[data-session]")) return;
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [activeDropdown, closeDropdown]);

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
            <div
              key={p.sessionId}
              data-session={p.sessionId}
              className={`${styles.participantItem}${activeDropdown === p.sessionId ? ` ${styles.participantItemActive}` : ""}${!p.isMe && canInteract ? ` ${styles.participantItemClickable}` : ""}`}
              onClick={!p.isMe && canInteract ? (e) => handleCardClick(e, p.sessionId) : undefined}
            >
              <div className={styles.participantAvatarWrap}>
                <div className={`${styles.participantAvatar} ${p.isMe ? styles.avatarMe : ""}`}>
                  {p.nickname[0].toUpperCase()}
                  {p.isMe && (
                    <span className={isMicOn ? styles.micDot : styles.mutedDot} />
                  )}
                </div>
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
          const isAdminSender = !!msg.isAdmin;
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

      {reportTarget && (
        <ReportModal
          targetNickname={reportTarget.nickname}
          targetMemberId={reportTarget.memberId}
          onClose={() => setReportTarget(null)}
        />
      )}

      {dmTarget && (
        <DirectMessageModal
          targetNickname={dmTarget.nickname}
          onClose={() => setDmTarget(null)}
        />
      )}

      {isRoomFull && (
        <RoomFullModal onConfirm={() => router.replace(`/channels/${categoryId}`)} />
      )}

      {isKicked && (
        <KickedModal onConfirm={() => router.replace(`/channels/${categoryId}`)} />
      )}

      {activeParticipant && dropdownAnchor && createPortal(
        <div
          ref={dropdownRef}
          className={`${styles.floatingDropdown} ${isDropdownClosing ? styles.floatingDropdownClosing : ""}`}
          style={{
            position: "fixed",
            top: dropdownAnchor.bottom + 4,
            left: dropdownAnchor.left,
          }}
        >
          {kickConfirmFor === activeParticipant.sessionId ? (
            <>
              <p className={styles.kickConfirmText}>
                {activeParticipant.nickname}님을 퇴장시킬까요?
              </p>
              <div className={styles.kickConfirmActions}>
                <button
                  className={styles.floatingItem}
                  onClick={() => setKickConfirmFor(null)}
                >
                  취소
                </button>
                <button
                  className={`${styles.floatingItem} ${styles.floatingItemDanger}`}
                  onClick={() => {
                    kickParticipant(activeParticipant.sessionId);
                    setActiveDropdown(null);
                    setDropdownAnchor(null);
                    setKickConfirmFor(null);
                  }}
                >
                  퇴장
                </button>
              </div>
            </>
          ) : (
            <>
              {amIOwner && (
                <button
                  className={`${styles.floatingItem} ${styles.floatingItemDanger}`}
                  onClick={() => setKickConfirmFor(activeParticipant.sessionId)}
                >
                  강제퇴장
                </button>
              )}
              <button
                className={styles.floatingItem}
                onClick={() => {
                  setDmTarget(activeParticipant);
                  setActiveDropdown(null);
                  setDropdownAnchor(null);
                }}
              >
                쪽지보내기
              </button>
              <button
                className={`${styles.floatingItem} ${styles.floatingItemWarn}`}
                onClick={() => {
                  setReportTarget(activeParticipant);
                  setActiveDropdown(null);
                  setDropdownAnchor(null);
                }}
              >
                신고하기
              </button>
            </>
          )}
        </div>,
        document.body,
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
