package com.thisconnect.server.dto.response;

import com.thisconnect.server.domain.message.Message;

import java.time.format.DateTimeFormatter;

public record MessageResponse(
        Long id,
        Long senderId,
        String senderNickname,
        Long receiverId,
        String receiverNickname,
        String title,
        String content,
        String sentAt,
        boolean isRead,
        String readAt
) {
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public static MessageResponse from(Message m) {
        return new MessageResponse(
                m.getId(),
                m.getSender().getId(),
                m.getSender().getNickname(),
                m.getReceiver().getId(),
                m.getReceiver().getNickname(),
                m.getTitle(),
                m.getContent(),
                m.getSentAt().format(FMT),
                m.getReadAt() != null,
                m.getReadAt() != null ? m.getReadAt().format(FMT) : null
        );
    }
}
