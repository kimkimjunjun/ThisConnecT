package com.disconnect.server.dto.response;

import java.util.List;

public record ChatRoomPageResponse(
        List<ChatRoomResponse> rooms,
        Long nextCursor,
        boolean hasNext
) {}
