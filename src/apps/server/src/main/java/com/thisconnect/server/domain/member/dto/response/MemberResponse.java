package com.thisconnect.server.domain.member.dto.response;

public record MemberResponse(
        String username,
        String provider,
        String nickname,
        String role,
        Integer level,
        Integer xp,
        Integer requiredXp
) {}
