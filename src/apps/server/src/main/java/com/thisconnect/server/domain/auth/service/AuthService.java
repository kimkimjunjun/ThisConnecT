package com.thisconnect.server.domain.auth.service;

import com.thisconnect.server.domain.member.entity.AuthProvider;
import com.thisconnect.server.domain.member.entity.Member;
import com.thisconnect.server.domain.member.entity.Role;
import com.thisconnect.server.domain.auth.dto.response.AuthResponse;
import com.thisconnect.server.domain.auth.oauth.OAuthClient;
import com.thisconnect.server.domain.auth.oauth.OAuthUserInfo;
import com.thisconnect.server.domain.auth.oauth.KakaoOAuthClient;
import com.thisconnect.server.domain.auth.oauth.GoogleOAuthClient;
import com.thisconnect.server.domain.member.repository.MemberRepository;
import com.thisconnect.server.global.security.JwtProvider;
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

        member.gainDailyLoginXp(10);
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
