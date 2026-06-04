package com.thisconnect.server.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SendMessageRequest(
        @NotBlank String receiverNickname,
        @NotBlank @Size(max = 100) String title,
        @NotBlank @Size(max = 2000) String content
) {}
