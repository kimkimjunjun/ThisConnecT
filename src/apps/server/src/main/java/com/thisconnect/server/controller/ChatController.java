package com.thisconnect.server.controller;

import com.thisconnect.server.domain.member.Member;
import com.thisconnect.server.dto.request.ChatRequest;
import com.thisconnect.server.dto.request.KickRequest;
import com.thisconnect.server.dto.request.VoiceSignalRequest;
import com.thisconnect.server.dto.response.ChatMessageResponse;
import com.thisconnect.server.dto.response.ParticipantListResponse;
import com.thisconnect.server.dto.response.VoiceSignalResponse;
import com.thisconnect.server.repository.ChatRoomRepository;
import com.thisconnect.server.repository.MemberRepository;
import com.thisconnect.server.service.RoomSessionService;
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
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

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
        String role = resolveRole(principal);
        boolean isAdmin = "ADMIN".equals(role);

        // 일반 유저만 정원 초과 체크 (어드민은 항상 입장 허용)
        if (!isAdmin) {
            boolean isFull = chatRoomRepository.findById(roomId)
                    .map(room -> roomSessionService.getCount(roomId) >= room.getMaxCount())
                    .orElse(false);

            if (isFull) {
                if (principal != null) {
                    messagingTemplate.convertAndSendToUser(
                            principal.getName(), "/queue/room-error",
                            Map.of("type", "ROOM_FULL", "roomId", roomId)
                    );
                }
                return;
            }
        }

        int level = resolveLevel(principal);
        String principalName = principal != null ? principal.getName() : "guest-" + sessionId;
        Long memberId = resolveMemberId(principal);
        roomSessionService.join(sessionId, roomId, nickname, level, isAdmin, principalName, memberId);

        if (!isAdmin) {
            // 일반 유저: 인원수 증가 + 입장 메시지 브로드캐스트
            chatRoomRepository.findById(roomId).ifPresent(room -> room.updateCurrentCount(1));
            broadcastParticipants(roomId);
            broadcastMessage(roomId, "JOIN", nickname, nickname + "님이 입장했습니다.", sessionId);
        } else {
            // 어드민: 인원수·입장 메시지 없음
            // broadcast 타이밍 경쟁 조건을 우회해 참여자 목록을 어드민에게 직접 전송
            List<ParticipantListResponse.Participant> participants =
                    roomSessionService.getParticipantDetails(roomId).stream()
                            .map(d -> new ParticipantListResponse.Participant(d.sessionId(), d.memberId(), d.nickname(), d.level(), d.isOwner()))
                            .toList();
            messagingTemplate.convertAndSendToUser(
                    principal.getName(), "/queue/participants-snapshot",
                    new ParticipantListResponse(roomId, participants.size(), participants)
            );
        }
    }

    @MessageMapping("/rooms/{roomId}/chat")
    public void chat(@DestinationVariable Long roomId,
                     @Payload ChatRequest request,
                     Principal principal) {
        String nickname = resolveNickname(principal);
        boolean isAdmin = "ADMIN".equals(resolveRole(principal));
        messagingTemplate.convertAndSend(
                "/sub/rooms/" + roomId + "/chat",
                new ChatMessageResponse("CHAT", roomId, nickname, request.content(), now(), null, isAdmin)
        );
    }

    // ─── WebRTC 시그널링 ─────────────────────────────────────────────────────────
    // 클라이언트가 Offer/Answer/ICE_CANDIDATE를 보내면 방 전체에 중계
    // 수신 측은 targetSessionId가 자신의 sessionId와 일치하는 메시지만 처리
    @MessageMapping("/rooms/{roomId}/voice/signal")
    public void voiceSignal(@DestinationVariable Long roomId,
                            @Payload VoiceSignalRequest request,
                            SimpMessageHeaderAccessor headerAccessor) {
        String senderSessionId = headerAccessor.getSessionId();
        messagingTemplate.convertAndSend(
                "/sub/rooms/" + roomId + "/voice",
                new VoiceSignalResponse(
                        request.type(),
                        senderSessionId,
                        request.targetSessionId(),
                        request.data()
                )
        );
    }

    // 방장이 특정 참여자를 강퇴: 방장 sessionId 검증 → 대상에게 KICKED 전송 → 퇴장 처리
    @Transactional
    @MessageMapping("/rooms/{roomId}/kick")
    public void kick(@DestinationVariable Long roomId,
                     @Payload KickRequest request,
                     SimpMessageHeaderAccessor headerAccessor) {
        String callerSessionId = headerAccessor.getSessionId();
        String ownerSessionId = roomSessionService.getOwnerSessionId(roomId);

        if (!callerSessionId.equals(ownerSessionId)) return;

        String targetSessionId = request.targetSessionId();
        if (targetSessionId.equals(callerSessionId)) return;

        String targetPrincipalName = roomSessionService.getPrincipalNameBySession(targetSessionId);
        if (targetPrincipalName == null) return;

        // 강퇴 대상에게 알림 전송 → 클라이언트는 채널 목록으로 리다이렉트
        messagingTemplate.convertAndSendToUser(
                targetPrincipalName, "/queue/kicked",
                Map.of("type", "KICKED", "roomId", roomId)
        );

        // 세션 제거 (handleDisconnect 중복 처리 방지)
        RoomSessionService.RoomSession kicked = roomSessionService.leave(targetSessionId);
        if (kicked != null && !kicked.isAdmin()) {
            chatRoomRepository.findById(roomId).ifPresent(room -> room.updateCurrentCount(-1));
            broadcastParticipants(roomId);
            broadcastMessage(roomId, "LEAVE", kicked.nickname(), kicked.nickname() + "님이 퇴장했습니다.", targetSessionId);
        }
    }

    @Transactional
    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        RoomSessionService.RoomSession session = roomSessionService.leave(sessionId);
        if (session == null) return;

        Long roomId = session.roomId();
        String nickname = session.nickname();
        boolean isAdmin = session.isAdmin();

        if (!isAdmin) {
            // 일반 유저: 인원수 감소 + 퇴장 메시지 브로드캐스트
            chatRoomRepository.findById(roomId).ifPresent(room -> room.updateCurrentCount(-1));
            broadcastParticipants(roomId);
            broadcastMessage(roomId, "LEAVE", nickname, nickname + "님이 퇴장했습니다.", sessionId);
        }
        // 어드민: 조용히 퇴장 (인원수·참여자 목록 변화 없음)
    }

    private void broadcastParticipants(Long roomId) {
        List<ParticipantListResponse.Participant> participants =
                roomSessionService.getParticipantDetails(roomId).stream()
                        .map(d -> new ParticipantListResponse.Participant(d.sessionId(), d.memberId(), d.nickname(), d.level(), d.isOwner()))
                        .toList();
        messagingTemplate.convertAndSend(
                "/sub/rooms/" + roomId + "/participants",
                new ParticipantListResponse(roomId, participants.size(), participants)
        );
    }

    private void broadcastMessage(Long roomId, String type, String sender, String content, String sessionId) {
        messagingTemplate.convertAndSend(
                "/sub/rooms/" + roomId + "/chat",
                new ChatMessageResponse(type, roomId, sender, content, now(), sessionId, false)
        );
    }

    private Long resolveMemberId(Principal principal) {
        if (principal == null) return null;
        String role = resolveRole(principal);
        if ("GUEST".equals(role)) return null;
        try {
            return Long.parseLong(principal.getName());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private String resolveRole(Principal principal) {
        if (principal == null) return "GUEST";
        UsernamePasswordAuthenticationToken auth = (UsernamePasswordAuthenticationToken) principal;
        return auth.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .orElse("GUEST");
    }

    private int resolveLevel(Principal principal) {
        if (principal == null) return 0;
        UsernamePasswordAuthenticationToken auth = (UsernamePasswordAuthenticationToken) principal;
        String role = auth.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .orElse("GUEST");
        if ("GUEST".equals(role)) return 0;
        return memberRepository.findById(Long.parseLong(principal.getName()))
                .map(Member::getLevel)
                .orElse(0);
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
        return ZonedDateTime.now(ZoneId.of("Asia/Seoul")).format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"));
    }
}
