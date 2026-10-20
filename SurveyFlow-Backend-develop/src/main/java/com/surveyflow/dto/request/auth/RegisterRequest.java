package com.surveyflow.dto.request.auth;

import com.surveyflow.common.enums.UserGender;
import com.surveyflow.validation.EnumValue;
import java.util.Locale;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "is required")
        @Email(message = "must be a valid email address")
        @Size(max = 255, message = "must not exceed {max} characters")
        String email,

        @NotBlank(message = "is required")
        @Size(min = 8, max = 100, message = "must be between {min} and {max} characters")
        String password,

        @Size(max = 100, message = "must not exceed {max} characters")
        String displayName,

        @EnumValue(enumClass = UserGender.class)
        String gender,

        @Size(max = 12, message = "must not exceed {max} characters")
        String referralCode
) {
    public RegisterRequest(String email, String password, String displayName, String gender) {
        this(email, password, displayName, gender, null);
    }

    //Compact Canonical Constructor
    public RegisterRequest {
        email = email == null ? null : email.strip();
        displayName = displayName == null ? null : displayName.strip();
        gender = gender == null ? null : gender.strip();
        referralCode = referralCode == null ? null : referralCode.strip().toUpperCase(Locale.ROOT);
    }

    public UserGender genderValue() {
        return gender == null || gender.isBlank() ? null : UserGender.valueOf(gender);
    }
}
