package com.disconnect.server.dto.request;

import jakarta.validation.constraints.NotBlank;

public record SocialCallbackRequest(
        @NotBlank String code
) {}
