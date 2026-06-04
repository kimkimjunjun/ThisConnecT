package com.thisconnect.server.controller;

import com.thisconnect.server.dto.request.SendMessageRequest;
import com.thisconnect.server.dto.response.MessageResponse;
import com.thisconnect.server.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@Tag(name = "Message", description = "쪽지 API")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @Operation(summary = "쪽지 보내기", description = "소셜 로그인 회원만 쪽지를 보낼 수 있으며, 비회원(게스트)에게는 전송 불가합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "전송 성공"),
            @ApiResponse(responseCode = "400", description = "유효성 실패 / 자기 자신에게 전송 / 비회원에게 전송 시도"),
            @ApiResponse(responseCode = "401", description = "인증 필요"),
            @ApiResponse(responseCode = "403", description = "비회원(게스트)은 쪽지 전송 불가"),
            @ApiResponse(responseCode = "404", description = "수신자 없음")
    })
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @PostMapping
    public ResponseEntity<MessageResponse> send(
            @Valid @RequestBody SendMessageRequest request,
            Principal principal
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(messageService.send(Long.parseLong(principal.getName()), request));
    }

    @Operation(summary = "수신함 조회", description = "내가 받은 쪽지 목록을 최신순으로 반환합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증 필요")
    })
    @GetMapping("/inbox")
    public ResponseEntity<List<MessageResponse>> getInbox(Principal principal) {
        return ResponseEntity.ok(messageService.getInbox(Long.parseLong(principal.getName())));
    }

    @Operation(summary = "발신함 조회", description = "내가 보낸 쪽지 목록을 최신순으로 반환합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증 필요")
    })
    @GetMapping("/outbox")
    public ResponseEntity<List<MessageResponse>> getOutbox(Principal principal) {
        return ResponseEntity.ok(messageService.getOutbox(Long.parseLong(principal.getName())));
    }

    @Operation(summary = "쪽지 읽음 처리", description = "수신한 쪽지를 읽음으로 표시합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "처리 성공"),
            @ApiResponse(responseCode = "401", description = "인증 필요"),
            @ApiResponse(responseCode = "404", description = "쪽지 없음")
    })
    @PatchMapping("/{messageId}/read")
    public ResponseEntity<MessageResponse> markAsRead(
            @PathVariable Long messageId,
            Principal principal
    ) {
        return ResponseEntity.ok(messageService.markAsRead(Long.parseLong(principal.getName()), messageId));
    }

    @Operation(summary = "수신함 쪽지 삭제", description = "수신한 쪽지를 수신함에서 삭제합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "삭제 성공"),
            @ApiResponse(responseCode = "401", description = "인증 필요"),
            @ApiResponse(responseCode = "404", description = "쪽지 없음")
    })
    @DeleteMapping("/inbox/{messageId}")
    public ResponseEntity<Void> deleteFromInbox(
            @PathVariable Long messageId,
            Principal principal
    ) {
        messageService.deleteFromInbox(Long.parseLong(principal.getName()), messageId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "발신함 쪽지 삭제", description = "보낸 쪽지를 발신함에서 삭제합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "삭제 성공"),
            @ApiResponse(responseCode = "401", description = "인증 필요"),
            @ApiResponse(responseCode = "404", description = "쪽지 없음")
    })
    @DeleteMapping("/outbox/{messageId}")
    public ResponseEntity<Void> deleteFromOutbox(
            @PathVariable Long messageId,
            Principal principal
    ) {
        messageService.deleteFromOutbox(Long.parseLong(principal.getName()), messageId);
        return ResponseEntity.noContent().build();
    }
}
