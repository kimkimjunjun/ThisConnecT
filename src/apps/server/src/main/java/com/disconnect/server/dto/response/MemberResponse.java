package com.disconnect.server.dto.response;

public record MemberResponse(
        String username,
        String provider,
        String nickname,
        String role,
        Integer level,
        Integer xp,
        Integer requiredXp
) {}
