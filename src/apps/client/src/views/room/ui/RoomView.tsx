"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth";
import { useMemberInfo } from "@/features/member";
import { type ChannelRoom } from "@/features/channel";
import styles from "./RoomView.module.scss";

type Participant = {
  id: string;
  nickname: string;
  isMe: boolean;
};

type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  senderLevel: number;
  text: string;
  time: string;
};

// 레벨 구간별 tier 클래스 반환
const getLevelTierClass = (level: number): string => {
  if (level >= 50) return styles.tierLegend;
  if (level >= 30) return styles.tierPlatinum;
  if (level >= 20) return styles.tierGold;
  if (level >= 10) return styles.tierSilver;
  if (level >= 5) return styles.tierBronze;
  return styles.tierNovice;
};

const NICKNAME_POOL = [
  "하늘별",
  "바람소리",
  "달빛강물",
  "별빛구름",
  "초록나무",
  "파란하늘",
  "노란해살",
  "빨간꽃잎",
  "보라비",
  "하얀눈",
];

// 모의 참가자 레벨 (티어 다양성 확인용)
const MOCK_LEVELS = [3, 7, 12, 25, 35, 52, 8, 15, 22, 41];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "im1",
    senderId: "p0",
    senderName: "하늘별",
    senderLevel: MOCK_LEVELS[3],
    text: "안녕하세요! 처음 들어왔어요 😊",
    time: "오후 2:31",
  },
  {
    id: "im2",
    senderId: "p1",
    senderName: "바람소리",
    senderLevel: MOCK_LEVELS[1],
    text: "어서 오세요~",
    time: "오후 2:32",
  },
  {
    id: "im3",
    senderId: "p0",
    senderName: "하늘별",
    senderLevel: MOCK_LEVELS[0],
    text: "오늘 날씨가 정말 좋네요",
    time: "오후 2:33",
  },
  {
    id: "im4",
    senderId: "p2",
    senderName: "달빛강물",
    senderLevel: MOCK_LEVELS[2],
    text: "그러게요 ㅋㅋ 드라이브 가고 싶다",
    time: "오후 2:35",
  },
  {
    id: "im5",
    senderId: "p1",
    senderName: "바람소리",
    senderLevel: MOCK_LEVELS[1],
    text: "저도요! 누가 태워줘요",
    time: "오후 2:36",
  },
];

const buildParticipants = (
  room: ChannelRoom,
  myNickname: string | null,
): Participant[] => {
  const count = Math.max(1, room.currentCount);
  const list: Participant[] = [
    { id: "me", nickname: myNickname ?? "나", isMe: true },
  ];
  for (let i = 0; i < Math.min(count - 1, NICKNAME_POOL.length); i++) {
    list.push({ id: `p${i}`, nickname: NICKNAME_POOL[i], isMe: false });
  }
  return list;
};

type Props = {
  room: ChannelRoom;
  categoryId: string;
};

export const RoomView = ({ room, categoryId }: Props) => {
  const router = useRouter();
  const nickname = useAuthStore((s) => s.nickname);
  const storedLevel = useAuthStore((s) => s.level);
  useMemberInfo(); // 마운트 시 API 호출 → 스토어 level 동기화

  const [isMicOn, setIsMicOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [speakingIds, setSpeakingIds] = useState<Set<string>>(new Set());
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);

  const participants = useMemo(
    () => buildParticipants(room, nickname),
    [room, nickname],
  );
  const others = useMemo(
    () => participants.filter((p) => !p.isMe),
    [participants],
  );

  useEffect(() => {
    if (others.length === 0) return;
    const interval = setInterval(() => {
      const target = others[Math.floor(Math.random() * others.length)];
      setSpeakingIds((prev) => {
        const next = new Set(prev);
        if (next.has(target.id)) next.delete(target.id);
        else next.add(target.id);
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [others]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;
    const timeStr = new Date().toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setMessages((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        senderId: "me",
        senderName: nickname ?? "나",
        senderLevel: storedLevel,
        text,
        time: timeStr,
      },
    ]);
    setInputText("");
  }, [inputText, nickname, storedLevel]);

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
        <span className={styles.roomTitle}>{room.title}</span>
        <span className={styles.participantCount}>
          {room.currentCount}/{room.maxCount}명
        </span>
      </div>

      {/* Participants */}
      <div className={styles.participantsSection}>
        <span className={styles.sectionLabel}>
          참여자 · {participants.length}명
        </span>
        <div className={styles.participantsList}>
          {participants.map((p) => {
            const speaking = speakingIds.has(p.id);
            return (
              <div
                key={p.id}
                className={`${styles.participantItem} ${speaking ? styles.participantSpeaking : ""}`}
              >
                <div
                  className={`${styles.participantAvatar} ${speaking ? styles.avatarSpeaking : ""} ${p.isMe ? styles.avatarMe : ""}`}
                >
                  {p.nickname[0].toUpperCase()}
                  {p.isMe && (
                    <span
                      className={isMicOn ? styles.micDot : styles.mutedDot}
                    />
                  )}
                </div>
                <div className={styles.participantMeta}>
                  <span className={styles.participantName}>
                    {p.nickname}
                    {p.isMe && <span className={styles.meBadge}>나</span>}
                  </span>
                  {speaking && (
                    <span className={styles.speakingLabel}>
                      <span className={styles.speakingWave}>
                        <span />
                        <span />
                        <span />
                      </span>
                      말하는 중
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audio Controls */}
      <div className={styles.audioControls}>
        <button
          className={`${styles.audioBtn} ${isMicOn ? styles.audioBtnOn : styles.audioBtnOff}`}
          onClick={() => setIsMicOn((v) => !v)}
        >
          <span className={styles.audioBtnIcon}>{isMicOn ? "🎤" : "🔇"}</span>
          <span>{isMicOn ? "마이크 ON" : "마이크 OFF"}</span>
        </button>
        <button
          className={`${styles.audioBtn} ${isSpeakerOn ? styles.audioBtnOn : styles.audioBtnOff}`}
          onClick={() => setIsSpeakerOn((v) => !v)}
        >
          <span className={styles.audioBtnIcon}>
            {isSpeakerOn ? "🔊" : "🔈"}
          </span>
          <span>{isSpeakerOn ? "스피커 ON" : "스피커 OFF"}</span>
        </button>
        <button
          className={`${styles.audioBtn} ${styles.audioBtnLeave}`}
          onClick={() => router.push(`/channels/${categoryId}`)}
        >
          <span className={styles.audioBtnIcon}>📞</span>
          <span>나가기</span>
        </button>
      </div>

      {/* Chat */}
      <div className={styles.chatArea} ref={chatRef}>
        <div className={styles.chatWelcome}>
          <span className={styles.welcomeIcon}>🔊</span>
          <h3 className={styles.welcomeTitle}>
            {room.title} 채널에 오신 것을 환영합니다!
          </h3>
          <p className={styles.welcomeSub}>이 채널의 시작점입니다.</p>
        </div>
        {messages.map((msg) => {
          const isMe = msg.senderId === "me";
          return (
            <div key={msg.id} className={styles.messageItem}>
              <div
                className={`${styles.messageAvatar} ${isMe ? styles.messageAvatarMe : ""}`}
              >
                {msg.senderName[0].toUpperCase()}
              </div>
              <div className={styles.messageBody}>
                <div className={styles.messageHeader}>
                  <span
                    className={`${styles.messageSender} ${isMe ? styles.messageSenderMe : ""}`}
                  >
                    {msg.senderName}
                  </span>
                  <span
                    className={`${styles.levelBadge} ${getLevelTierClass(msg.senderLevel)}`}
                  >
                    Lv.{msg.senderLevel}
                  </span>
                  <span className={styles.messageTime}>{msg.time}</span>
                </div>
                <p className={styles.messageText}>{msg.text}</p>
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
            placeholder={`#${room.title} 에 메시지 보내기`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            className={styles.sendButton}
            onClick={handleSend}
            disabled={!inputText.trim()}
          >
            전송
          </button>
        </div>
      </div>
    </div>
  );
};
