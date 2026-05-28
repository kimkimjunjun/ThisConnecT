package com.disconnect.server.repository;

import com.disconnect.server.domain.member.AuthProvider;
import com.disconnect.server.domain.member.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByProviderAndProviderId(AuthProvider provider, String providerId);
}
