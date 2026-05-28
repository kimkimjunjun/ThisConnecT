package com.disconnect.server.oauth;

public record OAuthUserInfo(
        String providerId,
        String email,
        String nickname
) {}
