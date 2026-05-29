"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/features/auth";
import styles from "./MyPage.module.scss";

type MicPermission = "unknown" | "granted" | "denied" | "prompt";

const useMicPermission = (): MicPermission => {
  const [state, setState] = useState<MicPermission>("unknown");

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.permissions) return;
    navigator.permissions
      .query({ name: "microphone" as PermissionName })
      .then((result) => {
        setState(result.state as MicPermission);
        result.onchange = () => setState(result.state as MicPermission);
      })
      .catch(() => setState("unknown"));
  }, []);

  return state;
};

const useAudioDevices = (micPermission: MicPermission) => {
  const [outputs, setOutputs] = useState<MediaDeviceInfo[]>([]);
  const [inputs, setInputs] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.enumerateDevices
    )
      return;

    const enumerate = () => {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          setOutputs(devices.filter((d) => d.kind === "audiooutput"));
          setInputs(devices.filter((d) => d.kind === "audioinput"));
        })
        .catch(() => {});
    };

    enumerate();
    navigator.mediaDevices.addEventListener("devicechange", enumerate);
    return () =>
      navigator.mediaDevices.removeEventListener("devicechange", enumerate);
  }, [micPermission]);

  return { outputs, inputs };
};

const XP_BASE = 100;

export const MyPage = () => {
  const nickname = useAuthStore((s) => s.nickname);
  const role = useAuthStore((s) => s.role);
  const level = useAuthStore((s) => s.level);
  const updateNickname = useAuthStore((s) => s.updateNickname);

  const [nicknameInput, setNicknameInput] = useState(nickname ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [micVolume, setMicVolume] = useState(50);
  const [speakerVolume, setSpeakerVolume] = useState(80);
  const [isMicOn, setIsMicOn] = useState(true);
  const [selectedOutput, setSelectedOutput] = useState("");
  const [selectedInput, setSelectedInput] = useState("");

  const micPermission = useMicPermission();
  const { outputs, inputs } = useAudioDevices(micPermission);
  const micBlocked = micPermission === "denied";

  const effectiveOutput = selectedOutput || outputs[0]?.deviceId || "";
  const effectiveInput = selectedInput || inputs[0]?.deviceId || "";

  const avatarChar = nickname ? nickname[0].toUpperCase() : "?";
  const currentXP = 0;
  const requiredXP = XP_BASE * Math.pow(2, level);
  const xpPercent = Math.min((currentXP / requiredXP) * 100, 100);

  const handleSaveNickname = async () => {
    const trimmed = nicknameInput.trim();
    if (!trimmed || isSaving) return;
    setIsSaving(true);
    try {
      // TODO: 백엔드 API 연동
      updateNickname(trimmed);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Profile header */}
      <div className={styles.profileSection}>
        <div className={styles.avatarWrap}>
          <div className={styles.avatar}>{avatarChar}</div>
          <span className={styles.levelBadge}>Lv.{level}</span>
        </div>
        <div className={styles.profileInfo}>
          <h2 className={styles.profileName}>{nickname ?? "비회원"}</h2>
          <span className={styles.roleBadge}>
            {role === "GUEST" ? "게스트" : "멤버"}
          </span>
        </div>
      </div>

      {/* Profile edit */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>프로필 편집</h3>
        <div className={styles.field}>
          <label className={styles.label}>닉네임</label>
          <div className={styles.inputRow}>
            <input
              className={styles.input}
              value={nicknameInput}
              onChange={(e) => {
                setNicknameInput(e.target.value);
                setSaveSuccess(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSaveNickname()}
              maxLength={20}
              placeholder="닉네임 입력"
            />
            <button
              className={`${styles.saveBtn} ${saveSuccess ? styles.saveBtnSuccess : ""}`}
              onClick={handleSaveNickname}
              disabled={
                isSaving ||
                !nicknameInput.trim() ||
                nicknameInput.trim() === nickname
              }
            >
              {saveSuccess ? "저장됨 ✓" : isSaving ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>
      </section>

      {/* Audio settings */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>오디오 설정</h3>

        {/* Speaker */}
        <div className={styles.field}>
          <label className={styles.label}>
            <span className={styles.labelIcon}>🔊</span>
            출력 장치
          </label>
          <select
            className={styles.deviceSelect}
            value={effectiveOutput}
            onChange={(e) => setSelectedOutput(e.target.value)}
          >
            {outputs.length > 0 ? (
              outputs.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || "기본 스피커"}
                </option>
              ))
            ) : (
              <option value="">장치를 찾을 수 없음</option>
            )}
          </select>
          <div className={styles.sliderRow}>
            <span className={styles.sliderLabel}>볼륨</span>
            <input
              type="range"
              className={styles.slider}
              min={0}
              max={100}
              value={speakerVolume}
              onChange={(e) => setSpeakerVolume(Number(e.target.value))}
            />
            <span className={styles.volumeValue}>{speakerVolume}%</span>
          </div>
        </div>

        {/* Microphone */}
        <div className={styles.field}>
          <label className={styles.label}>
            <span className={styles.labelIcon}>🎤</span>
            입력 장치
          </label>
          {micBlocked ? (
            <div className={styles.permDeniedMsg}>
              <span>🚫</span>
              <span>
                마이크 권한이 차단되었습니다. 브라우저 설정에서 권한을
                허용해주세요.
              </span>
            </div>
          ) : (
            <select
              className={`${styles.deviceSelect} ${micPermission !== "granted" ? styles.deviceSelectPending : ""}`}
              value={effectiveInput}
              onChange={(e) => setSelectedInput(e.target.value)}
              disabled={micPermission !== "granted"}
            >
              {inputs.length > 0 ? (
                inputs.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || "기본 마이크"}
                  </option>
                ))
              ) : (
                <option value="">
                  {micPermission === "granted"
                    ? "장치를 찾을 수 없음"
                    : "권한 허용 후 표시됩니다"}
                </option>
              )}
            </select>
          )}
          <div className={styles.sliderRow}>
            <span className={styles.sliderLabel}>볼륨</span>
            <input
              type="range"
              className={styles.slider}
              min={0}
              max={100}
              value={micVolume}
              onChange={(e) => setMicVolume(Number(e.target.value))}
              disabled={micBlocked}
            />
            <span className={styles.volumeValue}>{micVolume}%</span>
          </div>
          <div className={styles.sliderRow}>
            <span className={styles.sliderLabel}>테스트</span>
            <button
              className={`${styles.micToggle} ${
                !micBlocked && isMicOn
                  ? styles.micToggleOn
                  : styles.micToggleOff
              }`}
              onClick={() => !micBlocked && setIsMicOn((v) => !v)}
              disabled={micBlocked}
            >
              {micBlocked ? "🚫 차단됨" : isMicOn ? "🎤 켜짐" : "🔇 꺼짐"}
            </button>
          </div>
        </div>
      </section>

      {/* Level section */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>레벨 정보</h3>
        <div className={styles.levelCard}>
          <div className={styles.levelHeader}>
            <span className={styles.levelNum}>Lv.{level}</span>
            <span className={styles.levelXP}>
              {currentXP} / {requiredXP} XP
            </span>
          </div>
          <div className={styles.xpBar}>
            <div className={styles.xpFill} style={{ width: `${xpPercent}%` }} />
          </div>
          <p className={styles.levelHint}>
            채팅방 활동을 통해 경험치를 획득할 수 있어요
          </p>
        </div>
      </section>
    </div>
  );
};
