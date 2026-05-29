package com.disconnect.server.dto.response;

import com.disconnect.server.domain.chatroom.ChatRoom;

public record ChatRoomResponse(
        Long id,
        Long channelId,
        String title,
        int currentCount,
        int maxCount
) {
    public static ChatRoomResponse from(ChatRoom room) {
        return new ChatRoomResponse(
                room.getId(),
                room.getChannel().getId(),
                room.getTitle(),
                room.getCurrentCount(),
                room.getMaxCount()
        );
    }
}
