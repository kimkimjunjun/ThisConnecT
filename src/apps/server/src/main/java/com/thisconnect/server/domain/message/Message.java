package com.thisconnect.server.domain.message;

import com.thisconnect.server.domain.member.Member;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private Member sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private Member receiver;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime sentAt;

    private LocalDateTime readAt;

    @Column(nullable = false)
    private boolean deletedBySender = false;

    @Column(nullable = false)
    private boolean deletedByReceiver = false;

    @Builder
    private Message(Member sender, Member receiver, String title, String content) {
        this.sender = sender;
        this.receiver = receiver;
        this.title = title;
        this.content = content;
    }

    public void markAsRead() {
        if (this.readAt == null) {
            this.readAt = LocalDateTime.now();
        }
    }

    public void deleteByReceiver() {
        this.deletedByReceiver = true;
    }

    public void deleteBySender() {
        this.deletedBySender = true;
    }
}
