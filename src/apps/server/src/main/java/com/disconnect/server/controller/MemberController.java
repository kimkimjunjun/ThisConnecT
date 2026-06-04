package com.disconnect.server.controller;

import com.disconnect.server.dto.request.UpdateNicknameRequest;
import com.disconnect.server.dto.response.MemberIdResponse;
import com.disconnect.server.dto.response.MemberResponse;
import com.disconnect.server.service.MemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Member", description = "회원 정보 API (내 정보 조회, 닉네임 수정)")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @Operation(
            summary = "내 정보 조회",
            description = "JWT 토큰 기반으로 현재 로그인한 유저 정보를 반환합니다. " +
                    "소셜 회원은 username·provider·level·xp 포함, 게스트는 nickname·role만 반환됩니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "401", description = "토큰 없음 또는 만료"),
            @ApiResponse(responseCode = "404", description = "회원 정보 없음")
    })
    @GetMapping("/me")
    public ResponseEntity<MemberResponse> getMe(Authentication authentication) {
        String principal = (String) authentication.getPrincipal();
        String role = extractRole(authentication);
        return ResponseEntity.ok(memberService.getMember(principal, role));
    }

    @Operation(
            summary = "닉네임 수정",
            description = "현재 로그인한 소셜 회원의 닉네임을 변경합니다. 최대 20자. 게스트는 수정 불가(403)."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "수정 성공 — 변경된 유저 정보 반환"),
            @ApiResponse(responseCode = "400", description = "닉네임 유효성 실패 (빈 값 또는 20자 초과)"),
            @ApiResponse(responseCode = "401", description = "토큰 없음 또는 만료"),
            @ApiResponse(responseCode = "403", description = "게스트는 닉네임 수정 불가"),
            @ApiResponse(responseCode = "404", description = "회원 정보 없음")
    })
    @PatchMapping("/me/nickname")
    public ResponseEntity<MemberResponse> updateNickname(
            Authentication authentication,
            @Valid @RequestBody UpdateNicknameRequest request
    ) {
        String principal = (String) authentication.getPrincipal();
        String role = extractRole(authentication);
        return ResponseEntity.ok(memberService.updateNickname(principal, role, request.nickname()));
    }

    @Operation(
            summary = "닉네임으로 회원 ID 조회",
            description = "닉네임으로 회원의 DB ID를 반환합니다. 신고 기능에서 reportedId 조회 시 사용됩니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "404", description = "해당 닉네임의 회원 없음")
    })
    @GetMapping("/nickname/{nickname}")
    public ResponseEntity<MemberIdResponse> getMemberIdByNickname(@PathVariable String nickname) {
        return ResponseEntity.ok(memberService.getMemberIdByNickname(nickname));
    }

    private String extractRole(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .orElse("GUEST");
    }
}
