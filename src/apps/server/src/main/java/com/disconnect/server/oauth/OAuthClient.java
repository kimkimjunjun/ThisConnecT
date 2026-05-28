package com.disconnect.server.oauth;

public interface OAuthClient {
    OAuthUserInfo getUserInfo(String code);
}
