package com.disconnect.server.service;

import com.disconnect.server.domain.channel.Channel;
import com.disconnect.server.domain.chatroom.ChatRoom;
import com.disconnect.server.dto.request.CreateChannelRequest;
import com.disconnect.server.dto.request.CreateChatRoomRequest;
import com.disconnect.server.dto.response.ChannelResponse;
import com.disconnect.server.dto.response.ChatRoomResponse;
import com.disconnect.server.repository.ChannelRepository;
import com.disconnect.server.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
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
    public List<ChatRoomResponse> getRooms(Long channelId) {
        if (!channelRepository.existsById(channelId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "채널을 찾을 수 없습니다");
        }
        return chatRoomRepository.findByChannelId(channelId).stream()
                .map(ChatRoomResponse::from)
                .toList();
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

    public void deleteRoom(Long channelId, Long roomId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "채팅방을 찾을 수 없습니다"));
        if (!room.getChannel().getId().equals(channelId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "해당 채널에 속하지 않는 채팅방입니다");
        }
        chatRoomRepository.delete(room);
    }
}
