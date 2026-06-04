package com.thisconnect.server.dto.request;

import java.util.Map;

public record VoiceSignalRequest(
        String type,            // OFFER | ANSWER | ICE_CANDIDATE
        String targetSessionId,
        Map<String, Object> data
) {}
