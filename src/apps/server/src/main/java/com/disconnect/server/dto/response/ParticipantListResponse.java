package com.disconnect.server.dto.response;

import java.util.List;

public record ParticipantListResponse(
        Long roomId,
        int count,
        List<Participant> participants
) {
    public record Participant(String sessionId, String nickname, int level, boolean isOwner) {}
}
