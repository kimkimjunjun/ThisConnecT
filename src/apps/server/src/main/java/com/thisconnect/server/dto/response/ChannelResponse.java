package com.thisconnect.server.dto.response;

import com.thisconnect.server.domain.channel.Channel;

public record ChannelResponse(
        Long id,
        String name
) {
    public static ChannelResponse from(Channel channel) {
        return new ChannelResponse(channel.getId(), channel.getName());
    }
}
