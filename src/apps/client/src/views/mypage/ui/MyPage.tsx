"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/features/auth";
import { useMemberInfo, patchNickname } from "@/features/member";
import { useAudioStore } from "@/features/audio";
import styles from "./MyPage.module.scss";

// ─── Types ────────────────────────────────────────────────────────────────────
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

const useMicLevel = (enabled: boolean, noiseSuppression: boolean): number => {
  const [level, setLevel] = useState(0)
  const rafRef = useRef(0)

  useEffect(() => {
    if (!enabled) return

    let cancelled = false
    let stream: MediaStream | null = null
    let ctx: AudioContext | null = null
    let tryResume: (() => void) | null = null

    navigator.mediaDevices
      .getUserMedia({
        audio: {
          noiseSuppression,
          echoCancellation: noiseSuppression,
          autoGainControl: false,
        },
        video: false,
      })
      .then((s) => {
        if (cancelled) { s.getTracks().forEach((t) => t.stop()); return }
        stream = s
        ctx = new AudioContext()
        if (ctx.state === 'suspended') ctx.resume().catch(() => {})

        tryResume = () => {
          if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {})
        }

        const analyser = ctx.createAnalyser()
        analyser.fftSize = 512
        ctx.createMediaStreamSource(stream).connect(analyser)
        const data = new Uint8Array(analyser.fftSize)
        const tick = () => {
          if (cancelled) return
          // suspended 상태면 resume 요청 후 이 프레임은 건너뜀
          if (ctx?.state === 'suspended') {
            tryResume?.()
            rafRef.current = requestAnimationFrame(tick)
            return
          }
          analyser.getByteTimeDomainData(data)
          const rms = Math.sqrt(data.reduce((sum, v) => sum + (v - 128) ** 2, 0) / data.length)
          setLevel(Math.min(100, Math.round((rms / 64) * 100)))
          rafRef.current = requestAnimationFrame(tick)
        }
        rafRef.current = requestAnimationFrame(tick)

        // 클릭·키입력·탭 복귀 시 suspended AudioContext 자동 복구
        document.addEventListener('click', tryResume)
        document.addEventListener('keydown', tryResume)
        document.addEventListener('visibilitychange', tryResume)
      })
      .catch(() => {})

    return () => {
      cancelled = true
      cancelAnimationFrame(rafRef.current)
      stream?.getTracks().forEach((t) => t.stop())
      ctx?.close()
      if (tryResume) {
        document.removeEventListener('click', tryResume)
        document.removeEventListener('keydown', tryResume)
        document.removeEventListener('visibilitychange', tryResume)
      }
    }
  }, [enabled, noiseSuppression])

  return enabled ? level : 0
}

// ─── Component ────────────────────────────────────────────────────────────────
export const MyPage = () => {
  const nickname = useAuthStore((s) => s.nickname);
  const role = useAuthStore((s) => s.role);
  const updateNickname = useAuthStore((s) => s.updateNickname);

  const memberInfo = useMemberInfo();

  const level = memberInfo?.level ?? 0;
  const currentXP = memberInfo?.xp ?? 0;
  const requiredXP = memberInfo?.requiredXp ?? 100;
  const xpPercent = Math.min((currentXP / requiredXP) * 100, 100);

  // null = 사용자가 아직 편집하지 않은 상태 → API 값을 그대로 표시
  const [nicknameInput, setNicknameInput] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const isMicOn = useAudioStore((s) => s.isMicOn);
  const isSpeakerOn = useAudioStore((s) => s.isSpeakerOn);
  const micVolume = useAudioStore((s) => s.micVolume);
  const speakerVolume = useAudioStore((s) => s.speakerVolume);
  const noiseSuppression = useAudioStore((s) => s.noiseSuppression);
  const setIsMicOn = useAudioStore((s) => s.setIsMicOn);
  const setIsSpeakerOn = useAudioStore((s) => s.setIsSpeakerOn);
  const setMicVolume = useAudioStore((s) => s.setMicVolume);
  const setSpeakerVolume = useAudioStore((s) => s.setSpeakerVolume);
  const setNoiseSuppression = useAudioStore((s) => s.setNoiseSuppression);
  const [selectedOutput, setSelectedOutput] = useState("");
  const [selectedInput, setSelectedInput] = useState("");

  const initialNickname = memberInfo
    ? (memberInfo.username ?? memberInfo.nickname)
    : (nickname ?? "");

  // 사용자가 입력한 값이 있으면 그것을, 없으면 API에서 받은 초기값 사용
  const nicknameValue = nicknameInput ?? initialNickname;

  const micPermission = useMicPermission();
  const { outputs, inputs } = useAudioDevices(micPermission);
  const micBlocked = micPermission === "denied";
  const micLevel = useMicLevel(isMicOn && micPermission === "granted" && !micBlocked, noiseSuppression);

  const effectiveOutput = selectedOutput || outputs[0]?.deviceId || "";
  const effectiveInput = selectedInput || inputs[0]?.deviceId || "";

  const avatarChar = nickname ? nickname[0].toUpperCase() : "?";

  const handleSaveNickname = async () => {
    const trimmed = nicknameValue.trim();
    if (!trimmed || isSaving) return;
    setIsSaving(true);
    try {
      await patchNickname(trimmed);
      updateNickname(trimmed);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch {
      // 요청 실패 시 저장 실패 처리
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
              value={nicknameValue}
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
                !nicknameValue.trim() ||
                nicknameValue.trim() === initialNickname
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
          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>스피커</span>
              <span className={styles.settingDesc}>스피커를 켜거나 끕니다</span>
            </div>
            <button
              className={`${styles.settingToggle} ${isSpeakerOn ? styles.settingToggleOn : ""}`}
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              aria-pressed={isSpeakerOn}
            >
              <span className={styles.settingToggleKnob} />
            </button>
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
          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>마이크</span>
              <span className={styles.settingDesc}>마이크를 켜거나 끕니다</span>
            </div>
            <button
              className={`${styles.settingToggle} ${isMicOn && !micBlocked ? styles.settingToggleOn : ""}`}
              onClick={() => !micBlocked && setIsMicOn(!isMicOn)}
              disabled={micBlocked}
              aria-pressed={isMicOn}
            >
              <span className={styles.settingToggleKnob} />
            </button>
          </div>
          {isMicOn && micPermission === "granted" && !micBlocked && (
            <div className={styles.sliderRow}>
              <span className={styles.sliderLabel}>입력</span>
              <div className={styles.micLevelTrack}>
                <div
                  className={styles.micLevelBar}
                  style={{ width: `${micLevel}%` }}
                />
              </div>
              <span className={styles.volumeValue}>{micLevel}%</span>
            </div>
          )}
          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>주변음 제거</span>
              <span className={styles.settingDesc}>
                마이크 가까이 말소리만 전달, 멀리 있는 소리 차단
              </span>
            </div>
            <button
              className={`${styles.settingToggle} ${noiseSuppression ? styles.settingToggleOn : ""}`}
              onClick={() => setNoiseSuppression(!noiseSuppression)}
              disabled={micBlocked}
              aria-pressed={noiseSuppression}
            >
              <span className={styles.settingToggleKnob} />
            </button>
          </div>
        </div>
      </section>

      {/* Level section */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>레벨 정보</h3>
        <div className={`${styles.levelCard} ${role !== "USER" && role !== "ADMIN" ? styles.levelCardDisabled : ""}`}>
          <div className={styles.levelHeader}>
            <span className={styles.levelNum}>Lv.{level}</span>
            <span className={styles.levelXP}>
              {currentXP} / {requiredXP} XP
            </span>
          </div>
          <div className={styles.xpBar}>
            <div className={styles.xpFill} style={{ width: `${xpPercent}%` }} />
          </div>
          <p className={role !== "USER" && role !== "ADMIN" ? styles.levelGuestHint : styles.levelHint}>
            {role !== "USER" && role !== "ADMIN"
              ? "비회원은 레벨을 올릴 수 없어요"
              : "매일 로그인하면 경험치를 획득할 수 있어요"}
          </p>
        </div>
      </section>
    </div>
  );
};
