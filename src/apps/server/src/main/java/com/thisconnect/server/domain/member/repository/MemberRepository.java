package com.thisconnect.server.domain.member.repository;

import com.thisconnect.server.domain.member.entity.AuthProvider;
import com.thisconnect.server.domain.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByProviderAndProviderId(AuthProvider provider, String providerId);

    Optional<Member> findByNickname(String nickname);
}
