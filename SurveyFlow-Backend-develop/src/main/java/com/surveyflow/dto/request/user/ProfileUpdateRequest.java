package com.surveyflow.dto.request.user;

import com.surveyflow.common.enums.UserGender;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record ProfileUpdateRequest(
        @Size(max = 100, message = "must not exceed {max} characters")
        String displayName,
        @Min(value = 1900, message = "must be greater than or equal to {value}")
        Integer birthYear,
        UserGender gender,
        @Size(max = 255, message = "must not exceed {max} characters")
        String school,
        @Size(max = 255, message = "must not exceed {max} characters")
        String occupation,
        @Size(max = 2000, message = "must not exceed {max} characters")
        String bio
) {
    public ProfileUpdateRequest {
        displayName = normalize(displayName);
        school = normalize(school);
        occupation = normalize(occupation);
        bio = normalize(bio);
    }

    private static String normalize(String value) {
        return value == null || value.isBlank() ? null : value.strip();
    }
}
