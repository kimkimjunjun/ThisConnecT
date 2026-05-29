package com.disconnect.server.controller;

import com.disconnect.server.dto.request.ChatRequest;
import com.disconnect.server.dto.response.ChatMessageResponse;
import com.disconnect.server.dto.response.ParticipantListResponse;
import com.disconnect.server.repository.ChatRoomRepository;
import com.disconnect.server.repository.MemberRepository;
import com.disconnect.server.service.RoomSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final RoomSessionService roomSessionService;
    private final ChatRoomRepository chatRoomRepository;
    private final MemberRepository memberRepository;

    @Transactional
    @MessageMapping("/rooms/{roomId}/enter")
    public void enter(@DestinationVariable Long roomId,
                      SimpMessageHeaderAccessor headerAccessor,
                      Principal principal) {
        String sessionId = headerAccessor.getSessionId();
        String nickname = resolveNickname(principal);

        roomSessionService.join(sessionId, roomId, nickname);
        chatRoomRepository.findById(roomId).ifPresent(room -> room.updateCurrentCount(1));

        broadcastParticipants(roomId);
        broadcastSystemMessage(roomId, "JOIN", nickname, nickname + "님이 입장했습니다.");
    }

    @MessageMapping("/rooms/{roomId}/chat")
    public void chat(@DestinationVariable Long roomId,
                     @Payload ChatRequest request,
                     Principal principal) {
        String nickname = resolveNickname(principal);
        messagingTemplate.convertAndSend(
                "/sub/rooms/" + roomId + "/chat",
                new ChatMessageResponse("CHAT", roomId, nickname, request.content(), now())
        );
    }

    @Transactional
    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        RoomSessionService.RoomSession session = roomSessionService.leave(sessionId);
        if (session == null) return;

        Long roomId = session.roomId();
        String nickname = session.nickname();

        chatRoomRepository.findById(roomId).ifPresent(room -> room.updateCurrentCount(-1));
        broadcastParticipants(roomId);
        broadcastSystemMessage(roomId, "LEAVE", nickname, nickname + "님이 퇴장했습니다.");
    }

    private void broadcastParticipants(Long roomId) {
        List<String> participants = roomSessionService.getParticipants(roomId);
        messagingTemplate.convertAndSend(
                "/sub/rooms/" + roomId + "/participants",
                new ParticipantListResponse(roomId, participants.size(), participants)
        );
    }

    private void broadcastSystemMessage(Long roomId, String type, String sender, String content) {
        messagingTemplate.convertAndSend(
                "/sub/rooms/" + roomId + "/chat",
                new ChatMessageResponse(type, roomId, sender, content, now())
        );
    }

    private String resolveNickname(Principal principal) {
        if (principal == null) return "Anonymous";
        UsernamePasswordAuthenticationToken auth = (UsernamePasswordAuthenticationToken) principal;
        String role = auth.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .orElse("GUEST");
        String subject = principal.getName();
        if ("GUEST".equals(role)) return subject;
        return memberRepository.findById(Long.parseLong(subject))
                .map(m -> m.getNickname())
                .orElse(subject);
    }

    private String now() {
        return LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"));
    }
}
