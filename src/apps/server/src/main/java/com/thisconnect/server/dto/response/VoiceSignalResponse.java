package com.thisconnect.server.dto.response;

import java.util.Map;

public record VoiceSignalResponse(
        String type,
        String senderSessionId,
        String targetSessionId,
        Map<String, Object> data
) {}
