package com.disconnect.server.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RoomSessionService {

    // sessionId → RoomSession
    private final Map<String, RoomSession> sessionStore = new ConcurrentHashMap<>();
    // roomId → { sessionId → ParticipantData } (LinkedHashMap: 삽입 순서 유지 → 첫 번째 항목이 방장)
    private final Map<Long, Map<String, ParticipantData>> roomParticipants = new ConcurrentHashMap<>();

    public record RoomSession(Long roomId, String nickname, int level) {}
    public record ParticipantData(String nickname, int level) {}
    public record ParticipantDetail(String sessionId, String nickname, int level, boolean isOwner) {}

    public synchronized void join(String sessionId, Long roomId, String nickname, int level) {
        sessionStore.put(sessionId, new RoomSession(roomId, nickname, level));
        // LinkedHashMap으로 삽입 순서 보장 (첫 번째 = 방장)
        roomParticipants.computeIfAbsent(roomId, k -> new LinkedHashMap<>())
                .put(sessionId, new ParticipantData(nickname, level));
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
        return participants.values().stream().map(ParticipantData::nickname).toList();
    }

    public synchronized int getCount(Long roomId) {
        Map<String, ParticipantData> participants = roomParticipants.get(roomId);
        return participants == null ? 0 : participants.size();
    }

    // 첫 번째 항목(삽입 순서 기준) = 방장
    public synchronized String getOwnerSessionId(Long roomId) {
        Map<String, ParticipantData> participants = roomParticipants.get(roomId);
        if (participants == null || participants.isEmpty()) return null;
        return participants.keySet().iterator().next();
    }

    public synchronized List<ParticipantDetail> getParticipantDetails(Long roomId) {
        Map<String, ParticipantData> participants = roomParticipants.get(roomId);
        if (participants == null) return List.of();
        String ownerSessionId = participants.keySet().iterator().next();
        return participants.entrySet().stream()
                .map(e -> new ParticipantDetail(
                        e.getKey(),
                        e.getValue().nickname(),
                        e.getValue().level(),
                        e.getKey().equals(ownerSessionId)
                ))
                .toList();
    }
}
