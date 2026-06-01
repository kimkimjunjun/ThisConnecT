package com.disconnect.server.repository;

import com.disconnect.server.domain.chatroom.ChatRoom;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    void deleteByChannelId(Long channelId);

    @Query("""
            SELECT r FROM ChatRoom r
            WHERE r.channel.id = :channelId
            AND (:cursor IS NULL OR r.id > :cursor)
            AND (:keyword IS NULL OR LOWER(r.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
            ORDER BY r.id ASC
            """)
    List<ChatRoom> findByChannelIdWithCursor(
            @Param("channelId") Long channelId,
            @Param("cursor") Long cursor,
            @Param("keyword") String keyword,
            Pageable pageable
    );
}
