package com.thisconnect.server.domain.chat.dto.request;

import java.util.Map;

public record VoiceSignalRequest(
        String type,            // OFFER | ANSWER | ICE_CANDIDATE
        String targetSessionId,
        Map<String, Object> data
) {}
