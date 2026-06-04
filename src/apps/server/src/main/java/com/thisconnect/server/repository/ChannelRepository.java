package com.thisconnect.server.repository;

import com.thisconnect.server.domain.channel.Channel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChannelRepository extends JpaRepository<Channel, Long> {
}
