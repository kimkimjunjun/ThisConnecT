package com.thisconnect.server.domain.auth.dto.response;

public record AuthResponse(
        String accessToken,
        String nickname,
        String role
) {}
