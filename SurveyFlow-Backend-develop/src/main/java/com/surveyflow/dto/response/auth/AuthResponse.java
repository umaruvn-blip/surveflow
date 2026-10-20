package com.surveyflow.dto.response.auth;

import java.util.Set;

import com.surveyflow.common.enums.UserStatus;

import lombok.Builder;

@Builder
public record AuthResponse(
        String accessToken,
        UserInfo user
) {

    @Builder
    public record UserInfo(
            Long id,
            String email,
            UserStatus status,
            Set<String> roles
    ) {
    }
}
