package com.thisconnect.server.domain.channel.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateChatRoomRequest(
        @NotBlank(message = "채팅방 제목은 필수입니다")
        @Size(max = 50, message = "채팅방 제목은 50자 이하여야 합니다")
        String title,

        @Min(value = 2, message = "최소 인원은 2명입니다")
        @Max(value = 50, message = "최대 인원은 50명입니다")
        int maxCount
) {}
