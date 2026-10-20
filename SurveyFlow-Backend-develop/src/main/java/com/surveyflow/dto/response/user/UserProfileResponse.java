package com.surveyflow.dto.response.user;

import java.util.List;

import com.surveyflow.common.enums.UserGender;

public record UserProfileResponse(
        Long userId,
        String email,
        String referralCode,
        String displayName,
        String avatarUrl,
        Integer birthYear,
        UserGender gender,
        String school,
        String occupation,
        String bio,
        List<InterestResponse> interests
) {
}
