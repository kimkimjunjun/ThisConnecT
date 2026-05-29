package com.disconnect.server.dto.response;

import java.util.List;

public record ParticipantListResponse(
        Long roomId,
        int count,
        List<String> participants
) {}
