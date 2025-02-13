package com.LinkVerse.identity.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    String userId;
    String profileId;
    @Column(name = "username", unique = true, columnDefinition = "VARCHAR(255) COLLATE utf8mb4_unicode_ci")
    String username;
    String firstName;
    String lastName;
    String password;

    @Column(name = "email", unique = true, columnDefinition = "VARCHAR(255) COLLATE utf8mb4_unicode_ci")
    String email;
    String otpSecretKey;
    @Column(name = "email_verified", nullable = false, columnDefinition = "boolean default false")
    boolean emailVerified;

    String phoneNumber = "";

    @ManyToMany
    Set<Role> roles;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "VARCHAR(10) DEFAULT 'ONLINE'")
    UserStatus status = UserStatus.ONLINE;

    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

   
    Date dateOfBirth;
    String City;
    Gender gender;
    String bio;

    String imageUrl;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    String fcmToken;


}