package com.LinkVerse.post.dto.response;

import com.LinkVerse.post.entity.PostVisibility;
import jakarta.persistence.ElementCollection;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostResponse {
    String id;
    String content;

    @ElementCollection
    List<String> imageUrl;
    PostVisibility visibility;
    String userId;
    Instant createdDate;
    Instant modifiedDate;
    int like;
    int unlike;
    int commentCount;


    @Builder.Default
    List<CommentResponse> comments = new ArrayList<>(); // Initialize with an empty list
    @Builder.Default
    List<PostResponse> sharedPost = new ArrayList<>();
    String language;
    private String primarySentiment;
}