package com.thisconnect.server.domain.message.repository;

import com.thisconnect.server.domain.message.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MessageRepository extends JpaRepository<Message, Long> {

    // 수신함: 나에게 온 메시지 (삭제하지 않은 것, 최신순)
    List<Message> findByReceiverIdAndDeletedByReceiverFalseOrderBySentAtDesc(Long receiverId);

    // 발신함: 내가 보낸 메시지 (삭제하지 않은 것, 최신순)
    List<Message> findBySenderIdAndDeletedBySenderFalseOrderBySentAtDesc(Long senderId);

    Optional<Message> findByIdAndReceiverId(Long id, Long receiverId);

    Optional<Message> findByIdAndSenderId(Long id, Long senderId);
}
