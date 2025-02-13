package com.LinkVerse.post.service;

import com.LinkVerse.post.Mapper.CommentMapper;
import com.LinkVerse.post.Mapper.PostMapper;
import com.LinkVerse.post.dto.ApiResponse;
import com.LinkVerse.post.dto.request.CommentRequest;
import com.LinkVerse.post.dto.response.CommentResponse;
import com.LinkVerse.post.dto.response.PostResponse;
import com.LinkVerse.post.entity.Comment;
import com.LinkVerse.post.entity.Post;
import com.LinkVerse.post.entity.PostVisibility;
import com.LinkVerse.post.repository.CommentRepository;
import com.LinkVerse.post.repository.PostRepository;
import com.amazonaws.services.s3.model.S3Object;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CommentService {
    PostRepository postRepository;
    CommentRepository commentRepository;
    PostMapper postMapper;
    S3Service s3Service;
    RekognitionService rekognitionService;
    CommentMapper commentMapper;

    public ApiResponse<PostResponse> addComment(String postId, CommentRequest commentRequest, List<MultipartFile> imageFiles) {
        // Validate the comment content
        if (commentRequest == null || commentRequest.getContent() == null || commentRequest.getContent().trim().isEmpty()) {
            return ApiResponse.<PostResponse>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .message("Comment content cannot be empty.")
                    .build();
        }

        // Find the post by its ID
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        // Check if the post is private and the user is not the owner
        if (post.getVisibility() == PostVisibility.PRIVATE && !post.getUserId().equals(currentUserId)) {
            return ApiResponse.<PostResponse>builder()
                    .code(HttpStatus.FORBIDDEN.value())
                    .message("You are not authorized to comment on this post")
                    .build();
        }

        List<String> safeFileUrls = new ArrayList<>();

        // Upload files if provided and validate their content
        if (imageFiles != null && !imageFiles.isEmpty()) {
            for (MultipartFile file : imageFiles) {
                if (file != null && !file.isEmpty()) {
                    try {
                        // Step 1: Upload file to S3
                        String fileUrl = s3Service.uploadFile(file);

                        // Step 2: Validate the uploaded image for safety
                        String fileName = extractFileNameFromUrl(decodeUrl(fileUrl));
                        S3Object s3Object = s3Service.getObject(fileName);

                        if (rekognitionService.isImageSafe(s3Object)) {
                            // Step 3: Add only safe image URLs
                            safeFileUrls.add(fileUrl);
                            log.info("Safe image added to comment: {}", fileUrl);
                        } else {
                            // Step 4: Remove unsafe images from storage
                            log.warn("Unsafe content detected in file: {}", fileName);
                            s3Service.deleteFile(fileName);
                        }
                    } catch (Exception e) {
                        log.error("Error during file upload or validation: {}", e.getMessage(), e);
                    }
                }
            }
        }

        // Build the new comment
        Comment newComment = Comment.builder()
                .content(commentRequest.getContent())
                .userId(currentUserId)
                .imageUrl(safeFileUrls) // Attach only safe image URLs
                .like(0)
                .unlike(0)
                .likeCount(0)
                .createdDate(Instant.now())
                .commentId(UUID.randomUUID().toString())
                .id(UUID.randomUUID().toString())
                .build();

        // Save the comment to the CommentRepository
        commentRepository.save(newComment);

        // Add the commentId to the post
        post.getComments().add(newComment);
        post.setCommentCount(post.getComments().size());
        postRepository.save(post);

        // Map the updated post to the response
        PostResponse postResponse = postMapper.toPostResponse(post);

        return ApiResponse.<PostResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Comment added successfully.")
                .result(postResponse)
                .build();
    }


    public ApiResponse<CommentResponse> editComment(String postId, String commentId, CommentRequest commentRequest, List<MultipartFile> imageFiles) {
        String userId = getCurrentUserId();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Check if the post is private and the user is not the owner
        if (post.getVisibility() == PostVisibility.PRIVATE && !post.getUserId().equals(userId)) {
            return ApiResponse.<CommentResponse>builder()
                    .code(HttpStatus.FORBIDDEN.value())
                    .message("You are not authorized to edit this comment")
                    .build();
        }

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        // Check if the user is the owner of the comment
        if (!comment.getUserId().equals(userId)) {
            return ApiResponse.<CommentResponse>builder()
                    .code(HttpStatus.FORBIDDEN.value())
                    .message("You are not authorized to edit this comment")
                    .build();
        }

        List<String> safeFileUrls = new ArrayList<>();

        // Upload files if provided and validate their content
        if (imageFiles != null && !imageFiles.isEmpty()) {
            for (MultipartFile file : imageFiles) {
                if (file != null && !file.isEmpty()) {
                    try {
                        // Step 1: Upload file to S3
                        String fileUrl = s3Service.uploadFile(file);

                        // Step 2: Validate the uploaded image for safety
                        String fileName = extractFileNameFromUrl(decodeUrl(fileUrl));
                        S3Object s3Object = s3Service.getObject(fileName);

                        if (rekognitionService.isImageSafe(s3Object)) {
                            // Step 3: Add only safe image URLs
                            safeFileUrls.add(fileUrl);
                            log.info("Safe image added to comment: {}", fileUrl);
                        } else {
                            // Step 4: Remove unsafe images from storage
                            log.warn("Unsafe content detected in file: {}", fileName);
                            s3Service.deleteFile(fileName);
                        }
                    } catch (Exception e) {
                        log.error("Error during file upload or validation: {}", e.getMessage(), e);
                    }
                }
            }
        }

        // Update the comment content and image URLs
        comment.setContent(commentRequest.getContent());
        comment.setImageUrl(safeFileUrls.isEmpty() ? commentRequest.getImageUrl() : safeFileUrls);
        comment = commentRepository.save(comment);

        return ApiResponse.<CommentResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Comment edited successfully")
                .result(commentMapper.toCommentResponse(comment))
                .build();
    }

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }


    public ApiResponse<PostResponse> deleteComment(String postId, String commentId) {
        // Find the post by its ID
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Find the comment by its ID
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = authentication.getName();

        // Check if the post is private and the user is not the owner
        if (post.getVisibility() == PostVisibility.PRIVATE && !post.getUserId().equals(currentUserId)) {
            return ApiResponse.<PostResponse>builder()
                    .code(HttpStatus.FORBIDDEN.value())
                    .message("You are not authorized to delete comments on this post")
                    .build();
        }

        // Check if the user is the owner of the comment or the owner of the post
        if (!comment.getUserId().equals(currentUserId) && !post.getUserId().equals(currentUserId)) {
            return ApiResponse.<PostResponse>builder()
                    .code(HttpStatus.FORBIDDEN.value())
                    .message("You are not authorized to delete this comment")
                    .build();
        }

        // Remove the comment from the post
        post.getComments().remove(comment);
        post.setCommentCount(post.getComments().size());
        postRepository.save(post);

        // Delete the comment from the CommentRepository
        commentRepository.delete(comment);

        // Map the updated post to the response
        PostResponse postResponse = postMapper.toPostResponse(post);

        return ApiResponse.<PostResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Comment deleted successfully.")
                .result(postResponse)
                .build();
    }

    private String extractFileNameFromUrl(String fileUrl) {
        // Ví dụ URL: https://image-0.s3.ap-southeast-2.amazonaws.com/1731100957786_2553d883.jpg
        String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
        return fileName;
    }

    private String decodeUrl(String encodedUrl) {
        return URLDecoder.decode(encodedUrl, StandardCharsets.UTF_8);
    }
}