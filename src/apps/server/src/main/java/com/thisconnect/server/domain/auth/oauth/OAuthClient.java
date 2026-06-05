package com.thisconnect.server.domain.auth.oauth;

public interface OAuthClient {
    OAuthUserInfo getUserInfo(String code);
}
