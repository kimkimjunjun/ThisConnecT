package com.thisconnect.server.controller;

import com.thisconnect.server.dto.request.CreateChannelRequest;
import com.thisconnect.server.dto.request.CreateChatRoomRequest;
import com.thisconnect.server.dto.request.UpdateChatRoomRequest;
import com.thisconnect.server.dto.response.ChannelResponse;
import com.thisconnect.server.dto.response.ChatRoomPageResponse;
import com.thisconnect.server.dto.response.ChatRoomResponse;
import com.thisconnect.server.service.ChannelService;

import java.util.List;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Channel", description = "채널(카테고리) 및 채팅방 관리 API")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/channels")
@RequiredArgsConstructor
public class ChannelController {

    private final ChannelService channelService;

    @Operation(summary = "채널 목록 조회", description = "전체 채널(카테고리) 목록을 반환합니다. 인증 불필요.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공")
    })
    @SecurityRequirements({})
    @GetMapping
    public ResponseEntity<List<ChannelResponse>> getChannels() {
        return ResponseEntity.ok(channelService.getChannels());
    }

    @Operation(summary = "채널 생성 (USER 이상)", description = "새 채널을 생성합니다. USER 이상 권한 필요.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "생성 성공"),
            @ApiResponse(responseCode = "400", description = "유효성 실패"),
            @ApiResponse(responseCode = "401", description = "인증 필요"),
            @ApiResponse(responseCode = "403", description = "권한 없음")
    })
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ChannelResponse> createChannel(@Valid @RequestBody CreateChannelRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(channelService.createChannel(request));
    }

    @Operation(summary = "채널 삭제 (ADMIN 전용)", description = "채널 및 하위 채팅방을 모두 삭제합니다. ADMIN 권한 필요.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "삭제 성공"),
            @ApiResponse(responseCode = "401", description = "인증 필요"),
            @ApiResponse(responseCode = "403", description = "권한 없음"),
            @ApiResponse(responseCode = "404", description = "채널 없음")
    })
    @DeleteMapping("/{channelId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteChannel(@PathVariable Long channelId) {
        channelService.deleteChannel(channelId);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "채팅방 목록 조회 (커서 기반 무한 스크롤)",
            description = "채널의 채팅방을 커서 기반으로 페이지네이션하여 반환합니다. keyword로 제목 검색 가능. 인증 불필요."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "404", description = "채널 없음")
    })
    @SecurityRequirements({})
    @GetMapping("/{channelId}/rooms")
    public ResponseEntity<ChatRoomPageResponse> getRooms(
            @PathVariable Long channelId,
            @RequestParam(required = false) Long cursor,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "30") int size
    ) {
        return ResponseEntity.ok(channelService.getRooms(channelId, cursor, keyword, size));
    }

    @Operation(summary = "채팅방 생성 (USER 이상)", description = "채널에 새 채팅방을 생성합니다. USER 이상 권한 필요.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "생성 성공"),
            @ApiResponse(responseCode = "400", description = "유효성 실패"),
            @ApiResponse(responseCode = "401", description = "인증 필요"),
            @ApiResponse(responseCode = "403", description = "권한 없음"),
            @ApiResponse(responseCode = "404", description = "채널 없음")
    })
    @PostMapping("/{channelId}/rooms")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ChatRoomResponse> createRoom(
            @PathVariable Long channelId,
            @Valid @RequestBody CreateChatRoomRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(channelService.createRoom(channelId, request));
    }

    @Operation(summary = "채팅방 수정 (USER 이상)", description = "채팅방 제목과 최대 인원을 수정합니다. USER 이상 권한 필요.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "수정 성공"),
            @ApiResponse(responseCode = "400", description = "유효성 실패 또는 채널 불일치"),
            @ApiResponse(responseCode = "401", description = "인증 필요"),
            @ApiResponse(responseCode = "403", description = "권한 없음"),
            @ApiResponse(responseCode = "404", description = "채팅방 없음")
    })
    @PatchMapping("/{channelId}/rooms/{roomId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ChatRoomResponse> updateRoom(
            @PathVariable Long channelId,
            @PathVariable Long roomId,
            @Valid @RequestBody UpdateChatRoomRequest request
    ) {
        return ResponseEntity.ok(channelService.updateRoom(channelId, roomId, request));
    }

    @Operation(summary = "채팅방 삭제 (ADMIN 전용)", description = "채팅방을 삭제합니다. ADMIN 권한 필요.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "삭제 성공"),
            @ApiResponse(responseCode = "401", description = "인증 필요"),
            @ApiResponse(responseCode = "403", description = "권한 없음"),
            @ApiResponse(responseCode = "404", description = "채팅방 없음")
    })
    @DeleteMapping("/{channelId}/rooms/{roomId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteRoom(
            @PathVariable Long channelId,
            @PathVariable Long roomId
    ) {
        channelService.deleteRoom(channelId, roomId);
        return ResponseEntity.noContent().build();
    }
}
