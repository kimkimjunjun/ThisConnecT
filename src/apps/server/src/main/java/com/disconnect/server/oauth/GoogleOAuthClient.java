package com.disconnect.server.oauth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Component
public class GoogleOAuthClient implements OAuthClient {

    @Value("${oauth.google.client-id}")
    private String clientId;

    @Value("${oauth.google.client-secret}")
    private String clientSecret;

    @Value("${oauth.google.redirect-uri}")
    private String redirectUri;

    private final RestClient restClient = RestClient.create();

    @Override
    public OAuthUserInfo getUserInfo(String code) {
        String accessToken = fetchAccessToken(code);
        return fetchUserInfo(accessToken);
    }

    private String fetchAccessToken(String code) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "authorization_code");
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);
        form.add("redirect_uri", redirectUri);
        form.add("code", code);

        Map<?, ?> response = restClient.post()
                .uri("https://oauth2.googleapis.com/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .body(Map.class);

        return (String) response.get("access_token");
    }

    private OAuthUserInfo fetchUserInfo(String accessToken) {
        Map<?, ?> response = restClient.get()
                .uri("https://www.googleapis.com/oauth2/v3/userinfo")
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .body(Map.class);

        String providerId = (String) response.get("sub");
        String email = (String) response.get("email");
        String nickname = (String) response.get("name");

        return new OAuthUserInfo(providerId, email, nickname);
    }
}
