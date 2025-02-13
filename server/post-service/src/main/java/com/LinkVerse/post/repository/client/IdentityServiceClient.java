package com.LinkVerse.post.repository.client;

import com.LinkVerse.identity.dto.request.ApiResponse;
import com.LinkVerse.post.configuration.AuthenticationRequestInterceptor;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "identity", url = "http://localhost:8080/identity", configuration = {AuthenticationRequestInterceptor.class})
public interface IdentityServiceClient {

    @PutMapping("/users/{userId}")
    void updateImage(@PathVariable("userId") String userId, @RequestParam("imageFile") String imageFile);

    @GetMapping("/groups/{groupId}/isPublic")
    boolean isPublic(@PathVariable String groupId);

    @GetMapping("/identity/users/{userId}")
    void getUser(@PathVariable("userId") String userId);

    @GetMapping("/groups/{groupId}/isUserInGroup")
    boolean isUserInGroup(@PathVariable String groupId);

    @GetMapping("/groups/{groupId}/isOwnerOrLeader")
    boolean isOwnerOrLeader(@PathVariable String groupId);
}