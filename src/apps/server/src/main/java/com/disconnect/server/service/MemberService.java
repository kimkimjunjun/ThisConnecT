package com.disconnect.server.service;

import com.disconnect.server.domain.member.Member;
import com.disconnect.server.dto.response.MemberResponse;
import com.disconnect.server.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;

    @Transactional(readOnly = true)
    public MemberResponse getMember(String principal, String role) {
        if ("GUEST".equals(role)) {
            return new MemberResponse(null, "GUEST", principal, "GUEST", null, null, null);
        }
        Member member = findById(principal);
        return toResponse(member);
    }

    @Transactional
    public MemberResponse updateNickname(String principal, String role, String nickname) {
        if ("GUEST".equals(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Guest cannot update nickname");
        }
        Member member = findById(principal);
        member.updateNickname(nickname);
        return toResponse(member);
    }

    private MemberResponse toResponse(Member member) {
        return new MemberResponse(
                member.getEmail(),
                member.getProvider().name(),
                member.getNickname(),
                member.getRole().name(),
                member.getLevel(),
                member.getXp(),
                member.requiredXp()
        );
    }

    private Member findById(String principal) {
        try {
            Long id = Long.parseLong(principal);
            return memberRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found"));
        } catch (NumberFormatException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token subject");
        }
    }
}
