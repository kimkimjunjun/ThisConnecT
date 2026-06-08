package com.thisconnect.server.domain.message.service;

import com.thisconnect.server.domain.member.entity.AuthProvider;
import com.thisconnect.server.domain.member.entity.Member;
import com.thisconnect.server.domain.message.entity.Message;
import com.thisconnect.server.domain.message.dto.request.SendMessageRequest;
import com.thisconnect.server.domain.message.dto.response.MessageResponse;
import com.thisconnect.server.domain.member.repository.MemberRepository;
import com.thisconnect.server.domain.message.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MessageService {

    private final MessageRepository messageRepository;
    private final MemberRepository memberRepository;

    public MessageResponse send(Long senderId, SendMessageRequest request) {
        Member sender = memberRepository.findById(senderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "발신자를 찾을 수 없습니다"));
        Member receiver = memberRepository.findByNickname(request.receiverNickname())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "수신자를 찾을 수 없습니다"));
        if (receiver.getProvider() == AuthProvider.GUEST) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "비회원에게는 쪽지를 보낼 수 없습니다");
        }
        if (sender.getId().equals(receiver.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "자기 자신에게 쪽지를 보낼 수 없습니다");
        }
        Message message = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .title(request.title())
                .content(request.content())
                .build();
        return MessageResponse.from(messageRepository.save(message));
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> getInbox(Long receiverId) {
        return messageRepository
                .findByReceiverIdAndDeletedByReceiverFalseOrderBySentAtDesc(receiverId)
                .stream().map(MessageResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> getOutbox(Long senderId) {
        return messageRepository
                .findBySenderIdAndDeletedBySenderFalseOrderBySentAtDesc(senderId)
                .stream().map(MessageResponse::from).toList();
    }

    public MessageResponse markAsRead(Long receiverId, Long messageId) {
        Message message = messageRepository.findByIdAndReceiverId(messageId, receiverId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "쪽지를 찾을 수 없습니다"));
        message.markAsRead();
        return MessageResponse.from(message);
    }

    public void deleteFromInbox(Long receiverId, Long messageId) {
        Message message = messageRepository.findByIdAndReceiverId(messageId, receiverId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "쪽지를 찾을 수 없습니다"));
        message.deleteByReceiver();
    }

    public void deleteFromOutbox(Long senderId, Long messageId) {
        Message message = messageRepository.findByIdAndSenderId(messageId, senderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "쪽지를 찾을 수 없습니다"));
        message.deleteBySender();
    }
}
