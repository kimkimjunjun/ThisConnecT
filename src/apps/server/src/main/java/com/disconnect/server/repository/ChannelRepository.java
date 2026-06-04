package com.disconnect.server.repository;

import com.disconnect.server.domain.channel.Channel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChannelRepository extends JpaRepository<Channel, Long> {
}
