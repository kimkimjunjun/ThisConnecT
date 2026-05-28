package com.disconnect.server.service;

import com.disconnect.server.domain.member.AuthProvider;
import com.disconnect.server.domain.member.Member;
import com.disconnect.server.domain.member.Role;
import com.disconnect.server.dto.response.AuthResponse;
import com.disconnect.server.oauth.OAuthClient;
import com.disconnect.server.oauth.OAuthUserInfo;
import com.disconnect.server.oauth.KakaoOAuthClient;
import com.disconnect.server.oauth.GoogleOAuthClient;
import com.disconnect.server.repository.MemberRepository;
import com.disconnect.server.security.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final MemberRepository memberRepository;
    private final JwtProvider jwtProvider;
    private final KakaoOAuthClient kakaoOAuthClient;
    private final GoogleOAuthClient googleOAuthClient;

    // 비회원 — DB 저장 없이 JWT만 발급
    public AuthResponse guestLogin(String nickname) {
        String accessToken = jwtProvider.generateAccessToken(nickname, Role.GUEST.name());
        return new AuthResponse(accessToken, nickname, Role.GUEST.name());
    }

    @Transactional
    public SocialTokens socialLogin(AuthProvider provider, String code) {
        OAuthUserInfo userInfo = resolveClient(provider).getUserInfo(code);

        Member member = memberRepository
                .findByProviderAndProviderId(provider, userInfo.providerId())
                .orElseGet(() -> memberRepository.save(
                        Member.builder()
                                .email(userInfo.email())
                                .nickname(userInfo.nickname())
                                .provider(provider)
                                .providerId(userInfo.providerId())
                                .role(Role.USER)
                                .build()
                ));

        String accessToken = jwtProvider.generateAccessToken(member.getId().toString(), member.getRole().name());
        String refreshToken = jwtProvider.generateRefreshToken(member.getId().toString());
        member.updateRefreshToken(refreshToken);

        return new SocialTokens(accessToken, refreshToken, member.getNickname(), member.getRole().name());
    }

    @Transactional(readOnly = true)
    public AuthResponse refresh(String refreshToken) {
        if (refreshToken == null || !jwtProvider.isValid(refreshToken)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }

        String memberId = jwtProvider.parseClaims(refreshToken).getSubject();
        Member member = memberRepository.findById(Long.parseLong(memberId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Member not found"));

        if (!refreshToken.equals(member.getRefreshToken())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token mismatch");
        }

        String newAccessToken = jwtProvider.generateAccessToken(memberId, member.getRole().name());
        return new AuthResponse(newAccessToken, member.getNickname(), member.getRole().name());
    }

    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken == null || !jwtProvider.isValid(refreshToken)) return;

        String memberId = jwtProvider.parseClaims(refreshToken).getSubject();
        memberRepository.findById(Long.parseLong(memberId))
                .ifPresent(m -> m.updateRefreshToken(null));
    }

    private OAuthClient resolveClient(AuthProvider provider) {
        return switch (provider) {
            case KAKAO -> kakaoOAuthClient;
            case GOOGLE -> googleOAuthClient;
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported provider: " + provider);
        };
    }

    public record SocialTokens(String accessToken, String refreshToken, String nickname, String role) {}
}
