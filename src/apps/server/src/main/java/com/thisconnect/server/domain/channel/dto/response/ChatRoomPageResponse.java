package com.thisconnect.server.domain.channel.dto.response;

import java.util.List;

public record ChatRoomPageResponse(
        List<ChatRoomResponse> rooms,
        Long nextCursor,
        boolean hasNext
) {}
