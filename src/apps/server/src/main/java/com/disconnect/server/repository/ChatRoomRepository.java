package com.disconnect.server.repository;

import com.disconnect.server.domain.chatroom.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    List<ChatRoom> findByChannelId(Long channelId);

    void deleteByChannelId(Long channelId);
}
