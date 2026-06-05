package com.thisconnect.server.domain.auth.oauth;

public record OAuthUserInfo(
        String providerId,
        String email,
        String nickname
) {}
