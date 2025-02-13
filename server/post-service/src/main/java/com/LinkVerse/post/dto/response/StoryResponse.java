package com.LinkVerse.post.dto.response;

import com.LinkVerse.post.entity.StoryVisibility;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class StoryResponse {
    String id;
    String userId;
    String content; // Added content field
    List<String> imageUrl;
    LocalDateTime postedAt;
    LocalDateTime expiryTime;
    StoryVisibility visibility;
}