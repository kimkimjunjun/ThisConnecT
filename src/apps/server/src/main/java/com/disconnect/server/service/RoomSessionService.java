package com.disconnect.server.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;


@Service
public class RoomSessionService {

    // sessionId → RoomSession
    private final Map<String, RoomSession> sessionStore = new ConcurrentHashMap<>();
    // roomId → { sessionId → ParticipantData }
    private final Map<Long, Map<String, ParticipantData>> roomParticipants = new ConcurrentHashMap<>();

    public record RoomSession(Long roomId, String nickname, int level) {}
    public record ParticipantData(String nickname, int level) {}

    public void join(String sessionId, Long roomId, String nickname, int level) {
        sessionStore.put(sessionId, new RoomSession(roomId, nickname, level));
        roomParticipants.computeIfAbsent(roomId, k -> new ConcurrentHashMap<>())
                .put(sessionId, new ParticipantData(nickname, level));
    }

    public RoomSession leave(String sessionId) {
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

    public List<String> getParticipants(Long roomId) {
        Map<String, ParticipantData> participants = roomParticipants.get(roomId);
        if (participants == null) return List.of();
        return new ArrayList<>(participants.values().stream().map(ParticipantData::nickname).toList());
    }

    public int getCount(Long roomId) {
        Map<String, ParticipantData> participants = roomParticipants.get(roomId);
        return participants == null ? 0 : participants.size();
    }

    public record ParticipantDetail(String sessionId, String nickname, int level) {}

    public List<ParticipantDetail> getParticipantDetails(Long roomId) {
        Map<String, ParticipantData> participants = roomParticipants.get(roomId);
        if (participants == null) return List.of();
        return participants.entrySet().stream()
                .map(e -> new ParticipantDetail(e.getKey(), e.getValue().nickname(), e.getValue().level()))
                .toList();
    }
}
