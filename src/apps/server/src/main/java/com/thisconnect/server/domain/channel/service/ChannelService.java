package com.thisconnect.server.domain.channel.service;

import com.thisconnect.server.domain.channel.entity.Channel;
import com.thisconnect.server.domain.channel.entity.ChatRoom;
import com.thisconnect.server.domain.channel.dto.request.CreateChannelRequest;
import com.thisconnect.server.domain.channel.dto.request.CreateChatRoomRequest;
import com.thisconnect.server.domain.channel.dto.request.UpdateChatRoomRequest;
import com.thisconnect.server.domain.channel.dto.response.ChannelResponse;
import com.thisconnect.server.domain.channel.dto.response.ChatRoomPageResponse;
import com.thisconnect.server.domain.channel.dto.response.ChatRoomResponse;
import com.thisconnect.server.domain.channel.repository.ChannelRepository;
import com.thisconnect.server.domain.channel.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ChannelService {

    private final ChannelRepository channelRepository;
    private final ChatRoomRepository chatRoomRepository;

    @Transactional(readOnly = true)
    public List<ChannelResponse> getChannels() {
        return channelRepository.findAll().stream()
                .map(ChannelResponse::from)
                .toList();
    }

    public ChannelResponse createChannel(CreateChannelRequest request) {
        Channel channel = Channel.builder()
                .name(request.name())
                .build();
        return ChannelResponse.from(channelRepository.save(channel));
    }

    public void deleteChannel(Long channelId) {
        if (!channelRepository.existsById(channelId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "채널을 찾을 수 없습니다");
        }
        chatRoomRepository.deleteByChannelId(channelId);
        channelRepository.deleteById(channelId);
    }

    @Transactional(readOnly = true)
    public ChatRoomPageResponse getRooms(Long channelId, Long cursor, String keyword, int size) {
        if (!channelRepository.existsById(channelId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "채널을 찾을 수 없습니다");
        }
        String kw = (keyword == null || keyword.isBlank()) ? null : keyword.trim();
        List<ChatRoom> rows = chatRoomRepository.findByChannelIdWithCursor(
                channelId, cursor, kw, PageRequest.of(0, size + 1)
        );
        boolean hasNext = rows.size() > size;
        List<ChatRoom> content = hasNext ? rows.subList(0, size) : rows;
        Long nextCursor = content.isEmpty() ? null : content.get(content.size() - 1).getId();
        return new ChatRoomPageResponse(
                content.stream().map(ChatRoomResponse::from).toList(),
                nextCursor,
                hasNext
        );
    }

    public ChatRoomResponse createRoom(Long channelId, CreateChatRoomRequest request) {
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "채널을 찾을 수 없습니다"));
        ChatRoom room = ChatRoom.builder()
                .channel(channel)
                .title(request.title())
                .maxCount(request.maxCount())
                .build();
        return ChatRoomResponse.from(chatRoomRepository.save(room));
    }

    public ChatRoomResponse updateRoom(Long channelId, Long roomId, UpdateChatRoomRequest request) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "채팅방을 찾을 수 없습니다"));
        if (!room.getChannel().getId().equals(channelId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "해당 채널에 속하지 않는 채팅방입니다");
        }
        room.update(request.title(), request.maxCount());
        return ChatRoomResponse.from(room);
    }

    public void deleteRoom(Long channelId, Long roomId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "채팅방을 찾을 수 없습니다"));
        if (!room.getChannel().getId().equals(channelId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "해당 채널에 속하지 않는 채팅방입니다");
        }
        chatRoomRepository.delete(room);
    }
}
