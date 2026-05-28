package com.disconnect.server.controller;

import com.disconnect.server.domain.member.AuthProvider;
import com.disconnect.server.dto.request.GuestLoginRequest;
import com.disconnect.server.dto.request.SocialCallbackRequest;
import com.disconnect.server.dto.response.AuthResponse;
import com.disconnect.server.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final String REFRESH_COOKIE = "refresh_token";
    private static final int REFRESH_MAX_AGE = 7 * 24 * 60 * 60; // 7d

    private final AuthService authService;

    @PostMapping("/guest")
    public ResponseEntity<AuthResponse> guest(@RequestBody @Valid GuestLoginRequest request) {
        return ResponseEntity.ok(authService.guestLogin(request.nickname()));
    }

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

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @CookieValue(name = REFRESH_COOKIE, required = false) String refreshToken
    ) {
        return ResponseEntity.ok(authService.refresh(refreshToken));
    }

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
                .secure(false) // prod: true
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
