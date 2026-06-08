package com.thisconnect.server.domain.chat.dto.response;

import java.util.List;

public record ParticipantListResponse(
        Long roomId,
        int count,
        List<Participant> participants
) {
    public record Participant(String sessionId, Long memberId, String nickname, int level, boolean isOwner) {}
}
