package com.thisconnect.server.domain.channel.entity;

import com.thisconnect.server.domain.channel.entity.Channel;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_rooms")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class ChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "channel_id", nullable = false)
    private Channel channel;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private int maxCount;

    @Column(nullable = false)
    private int currentCount = 0;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Builder
    private ChatRoom(Channel channel, String title, int maxCount) {
        this.channel = channel;
        this.title = title;
        this.maxCount = maxCount;
        this.currentCount = 0;
    }

    public void update(String title, int maxCount) {
        this.title = title;
        this.maxCount = maxCount;
    }

    public void updateCurrentCount(int delta) {
        this.currentCount = Math.max(0, this.currentCount + delta);
    }
}
