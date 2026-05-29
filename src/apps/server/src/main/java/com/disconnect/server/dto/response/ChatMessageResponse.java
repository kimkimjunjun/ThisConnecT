package com.disconnect.server.dto.response;

public record ChatMessageResponse(
        String type,
        Long roomId,
        String sender,
        String content,
        String timestamp
) {}
