package com.thisconnect.server.oauth;

public record OAuthUserInfo(
        String providerId,
        String email,
        String nickname
) {}
