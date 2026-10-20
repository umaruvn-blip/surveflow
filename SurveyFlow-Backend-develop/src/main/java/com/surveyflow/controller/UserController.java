package com.surveyflow.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.surveyflow.dto.request.user.ProfileUpdateRequest;
import com.surveyflow.dto.request.user.ReplaceInterestsRequest;
import com.surveyflow.dto.response.ApiResponse;
import com.surveyflow.dto.response.user.InterestsResponse;
import com.surveyflow.dto.response.user.UserProfileResponse;
import com.surveyflow.factory.ApiResponseFactory;
import com.surveyflow.security.model.UserPrincipal;
import com.surveyflow.service.UserService;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j(topic = "USER-CONTROLLER")
@RestController
@RequestMapping("/api/v1/users/me")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Current user profile and interests")
public class UserController {

    private final UserService userService;
    private final ApiResponseFactory responseFactory;

    /** Lấy hồ sơ và sở thích của user đang đăng nhập. */
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(responseFactory.success(userService.getProfile(principal.getId())));
    }

    /** Lưu thông tin hồ sơ của user đang đăng nhập. */
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ProfileUpdateRequest request) {
        log.info("Update profile requested: userId={}", principal.getId());
        return ResponseEntity.ok(responseFactory.success(userService.updateProfile(principal.getId(), request)));
    }

    /** Thay thế danh sách sở thích của user đang đăng nhập. */
    @PutMapping("/interests")
    public ResponseEntity<ApiResponse<InterestsResponse>> replaceInterests(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ReplaceInterestsRequest request) {
        log.info("Replace interests requested: userId={}", principal.getId());
        return ResponseEntity.ok(responseFactory.success(userService.replaceInterests(principal.getId(), request)));
    }
}
