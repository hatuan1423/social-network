package com.LinkVerse.profile.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class Friendship {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    UserProfile sender;

    @ManyToOne
    @JoinColumn(name = "recipient_id", nullable = false)
    UserProfile recipient;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    FriendshipStatus status;

    @Column(name = "blocked_at")
    LocalDateTime blockedAt; // Lưu thời gian block, nếu trạng thái là BLOCKED
}
