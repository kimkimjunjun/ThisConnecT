package com.thisconnect.server.dto.response;

public record ChatMessageResponse(
        String type,
        Long roomId,
        String sender,
        String content,
        String timestamp,
        String sessionId,  // JOIN/LEAVE 시에만 세팅, 채팅 메시지는 null
        boolean isAdmin
) {}
