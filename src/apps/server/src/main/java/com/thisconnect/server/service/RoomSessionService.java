package com.thisconnect.server.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RoomSessionService {

    // sessionId → RoomSession
    private final Map<String, RoomSession> sessionStore = new ConcurrentHashMap<>();
    // roomId → { sessionId → ParticipantData } (LinkedHashMap: 삽입 순서 유지 → 첫 번째 일반 유저가 방장)
    private final Map<Long, Map<String, ParticipantData>> roomParticipants = new ConcurrentHashMap<>();

    public record RoomSession(Long roomId, String nickname, int level, boolean isAdmin, String principalName) {}
    public record ParticipantData(String nickname, int level, boolean isAdmin, String principalName, Long memberId) {}
    public record ParticipantDetail(String sessionId, Long memberId, String nickname, int level, boolean isOwner) {}

    public synchronized void join(String sessionId, Long roomId, String nickname, int level, boolean isAdmin, String principalName, Long memberId) {
        sessionStore.put(sessionId, new RoomSession(roomId, nickname, level, isAdmin, principalName));
        roomParticipants.computeIfAbsent(roomId, k -> new LinkedHashMap<>())
                .put(sessionId, new ParticipantData(nickname, level, isAdmin, principalName, memberId));
    }

    public synchronized RoomSession leave(String sessionId) {
        RoomSession session = sessionStore.remove(sessionId);
        if (session != null) {
            Map<String, ParticipantData> participants = roomParticipants.get(session.roomId());
            if (participants != null) {
                participants.remove(sessionId);
                if (participants.isEmpty()) {
                    roomParticipants.remove(session.roomId());
                }
            }
        }
        return session;
    }

    public synchronized List<String> getParticipants(Long roomId) {
        Map<String, ParticipantData> participants = roomParticipants.get(roomId);
        if (participants == null) return List.of();
        return participants.values().stream()
                .filter(p -> !p.isAdmin())
                .map(ParticipantData::nickname)
                .toList();
    }

    // 어드민 제외한 실제 인원 수
    public synchronized int getCount(Long roomId) {
        Map<String, ParticipantData> participants = roomParticipants.get(roomId);
        if (participants == null) return 0;
        return (int) participants.values().stream().filter(p -> !p.isAdmin()).count();
    }

    // 첫 번째 일반 유저(어드민 제외) = 방장
    public synchronized String getOwnerSessionId(Long roomId) {
        Map<String, ParticipantData> participants = roomParticipants.get(roomId);
        if (participants == null) return null;
        return participants.entrySet().stream()
                .filter(e -> !e.getValue().isAdmin())
                .map(Map.Entry::getKey)
                .findFirst()
                .orElse(null);
    }

    // 어드민 제외한 참여자만 반환
    public synchronized List<ParticipantDetail> getParticipantDetails(Long roomId) {
        Map<String, ParticipantData> participants = roomParticipants.get(roomId);
        if (participants == null) return List.of();
        String ownerSessionId = getOwnerSessionId(roomId);
        return participants.entrySet().stream()
                .filter(e -> !e.getValue().isAdmin())
                .map(e -> new ParticipantDetail(
                        e.getKey(),
                        e.getValue().memberId(),
                        e.getValue().nickname(),
                        e.getValue().level(),
                        e.getKey().equals(ownerSessionId)
                ))
                .toList();
    }

    // sessionId로 principalName(JWT subject) 조회
    public synchronized String getPrincipalNameBySession(String sessionId) {
        RoomSession session = sessionStore.get(sessionId);
        return session != null ? session.principalName() : null;
    }

    // 방장의 principalName 조회
    public synchronized String getOwnerPrincipalName(Long roomId) {
        Map<String, ParticipantData> participants = roomParticipants.get(roomId);
        if (participants == null) return null;
        return participants.entrySet().stream()
                .filter(e -> !e.getValue().isAdmin())
                .map(e -> e.getValue().principalName())
                .findFirst()
                .orElse(null);
    }
}
