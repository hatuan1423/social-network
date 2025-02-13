package com.LinkVerse.profile.controller;

import com.LinkVerse.profile.dto.ApiResponse;
import com.LinkVerse.profile.dto.response.UserProfileResponse;
import com.LinkVerse.profile.exception.AppException;
import com.LinkVerse.profile.repository.UserProfileRepository;
import com.LinkVerse.profile.service.UserProfileService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserProfileController {
    UserProfileService userProfileService;
    UserProfileRepository userProfileRepository;

    @PutMapping("/{userId}")
    public ResponseEntity<Void> updateImage(@PathVariable("userId") String userId, @RequestParam String imageFile) {
        if (userId == null || userId.isEmpty() || imageFile == null || imageFile.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        try {
            userProfileService.updateImage(userId, imageFile);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            log.error("User not found for ID: {}", userId, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            log.error("Failed to update user image for ID: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/users/{profileId}")
    ApiResponse<UserProfileResponse> getProfile(@PathVariable String profileId) {
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.getProfile(profileId))
                .build();
    }

    @GetMapping("/users")
    ApiResponse<List<UserProfileResponse>> getAllProfiles() {
        //Bỏ xác thực ng dùng

        return ApiResponse.<List<UserProfileResponse>>builder()
                .result(userProfileService.getAllProfiles())
                .build();
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUserProfile(@PathVariable String userId) {
        try {
            userProfileService.deleteUserProfile(userId);
            log.info("Successfully deleted user profile for ID: {}", userId);
            return ResponseEntity.noContent().build();
        } catch (AppException e) {
            log.error("Error deleting user profile for ID: {}", userId, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            log.error("Failed to delete user profile for ID: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @GetMapping("/users/my-profile")
    ApiResponse<UserProfileResponse> getMyProfile() {
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.getMyProfile())
                .build();
    }


}