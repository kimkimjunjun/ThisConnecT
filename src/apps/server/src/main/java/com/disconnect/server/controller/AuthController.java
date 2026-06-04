package com.disconnect.server.controller;

import com.disconnect.server.domain.member.AuthProvider;
import com.disconnect.server.dto.request.GuestLoginRequest;
import com.disconnect.server.dto.request.SocialCallbackRequest;
import com.disconnect.server.dto.response.AuthResponse;
import com.disconnect.server.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@Tag(name = "Auth", description = "인증 API (게스트 로그인, 소셜 로그인, 토큰 갱신, 로그아웃)")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final String REFRESH_COOKIE = "refresh_token";
    private static final int REFRESH_MAX_AGE = 7 * 24 * 60 * 60; // 7d

    private final AuthService authService;

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    @Operation(summary = "게스트 로그인", description = "닉네임만 입력해 비회원으로 로그인합니다. DB에 저장되지 않으며 role은 GUEST로 발급됩니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "로그인 성공 — accessToken 반환"),
            @ApiResponse(responseCode = "400", description = "닉네임 누락 또는 유효성 실패")
    })
    @PostMapping("/guest")
    public ResponseEntity<AuthResponse> guest(@RequestBody @Valid GuestLoginRequest request) {
        return ResponseEntity.ok(authService.guestLogin(request.nickname()));
    }

    @Operation(
            summary = "소셜 로그인 콜백",
            description = "OAuth 인가 코드를 받아 소셜 로그인을 처리합니다. provider는 kakao 또는 google. " +
                    "accessToken은 응답 바디로, refreshToken은 HttpOnly 쿠키(refresh_token)로 전달됩니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "로그인 성공 — accessToken 반환, refresh_token 쿠키 설정"),
            @ApiResponse(responseCode = "400", description = "지원하지 않는 provider 또는 인가 코드 누락"),
            @ApiResponse(responseCode = "401", description = "OAuth 인가 코드 교환 실패")
    })
    @PostMapping("/{provider}/callback")
    public ResponseEntity<AuthResponse> socialCallback(
            @PathVariable String provider,
            @RequestBody @Valid SocialCallbackRequest request,
            HttpServletResponse response
    ) {
        AuthProvider authProvider;
        try {
            authProvider = AuthProvider.valueOf(provider.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown provider: " + provider);
        }

        AuthService.SocialTokens tokens = authService.socialLogin(authProvider, request.code());
        setRefreshCookie(response, tokens.refreshToken());

        return ResponseEntity.ok(new AuthResponse(tokens.accessToken(), tokens.nickname(), tokens.role()));
    }

    @Operation(summary = "액세스 토큰 갱신", description = "refresh_token 쿠키를 이용해 새 accessToken을 발급합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "토큰 갱신 성공"),
            @ApiResponse(responseCode = "401", description = "refresh_token 없음, 만료, 또는 불일치")
    })
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @CookieValue(name = REFRESH_COOKIE, required = false) String refreshToken
    ) {
        return ResponseEntity.ok(authService.refresh(refreshToken));
    }

    @Operation(summary = "로그아웃", description = "refresh_token 쿠키를 무효화하고 DB의 refreshToken을 삭제합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "로그아웃 성공"),
    })
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(name = REFRESH_COOKIE, required = false) String refreshToken,
            HttpServletResponse response
    ) {
        authService.logout(refreshToken);
        clearRefreshCookie(response);
        return ResponseEntity.noContent().build();
    }

    private void setRefreshCookie(HttpServletResponse response, String value) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE, value)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/api/auth")
                .maxAge(REFRESH_MAX_AGE)
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE, "")
                .httpOnly(true)
                .path("/api/auth")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
