package com.thisconnect.server.domain.auth.dto.request;

import jakarta.validation.constraints.NotBlank;

public record SocialCallbackRequest(
        @NotBlank String code
) {}
