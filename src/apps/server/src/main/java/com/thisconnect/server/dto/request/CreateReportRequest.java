package com.thisconnect.server.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateReportRequest(
        @NotNull Long reportedId,
        @NotBlank @Size(max = 1000) String reason
) {}
