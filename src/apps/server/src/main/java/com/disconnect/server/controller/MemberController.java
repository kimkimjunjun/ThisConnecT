package com.disconnect.server.controller;

import com.disconnect.server.dto.request.UpdateNicknameRequest;
import com.disconnect.server.dto.response.MemberResponse;
import com.disconnect.server.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @GetMapping("/me")
    public ResponseEntity<MemberResponse> getMe(Authentication authentication) {
        String principal = (String) authentication.getPrincipal();
        String role = extractRole(authentication);
        return ResponseEntity.ok(memberService.getMember(principal, role));
    }

    @PatchMapping("/me/nickname")
    public ResponseEntity<MemberResponse> updateNickname(
            Authentication authentication,
            @Valid @RequestBody UpdateNicknameRequest request
    ) {
        String principal = (String) authentication.getPrincipal();
        String role = extractRole(authentication);
        return ResponseEntity.ok(memberService.updateNickname(principal, role, request.nickname()));
    }

    private String extractRole(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .orElse("GUEST");
    }
}
