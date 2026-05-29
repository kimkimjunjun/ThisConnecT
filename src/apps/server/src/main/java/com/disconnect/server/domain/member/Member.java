package com.disconnect.server.domain.member;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "members")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String email;

    @Column(nullable = false)
    private String nickname;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuthProvider provider;

    private String providerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String refreshToken;

    @Column(nullable = false)
    private int level = 0;

    @Column(nullable = false)
    private int xp = 0;

    private LocalDate lastLoginDate;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Builder
    private Member(String email, String nickname, AuthProvider provider, String providerId, Role role) {
        this.email = email;
        this.nickname = nickname;
        this.provider = provider;
        this.providerId = providerId;
        this.role = role;
    }

    public void updateRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public void updateNickname(String nickname) {
        this.nickname = nickname;
    }

    // 하루 한 번 로그인 시 XP 부여, 레벨업 처리
    public void gainDailyLoginXp(int xpGain) {
        LocalDate today = LocalDate.now();
        if (today.equals(lastLoginDate)) return;
        lastLoginDate = today;
        xp += xpGain;
        // 레벨업: 요구 XP = 100 * 2^level (100, 200, 400, 800...)
        while (xp >= requiredXp()) {
            xp -= requiredXp();
            level++;
        }
    }

    public int requiredXp() {
        return 100 * (1 << level);
    }
}
