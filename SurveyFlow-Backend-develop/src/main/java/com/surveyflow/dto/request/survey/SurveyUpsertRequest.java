package com.surveyflow.dto.request.survey;

import java.time.Instant;
import java.util.Set;

import com.surveyflow.common.enums.SurveyProvider;
import com.surveyflow.common.enums.SurveyVerificationMethod;
import com.surveyflow.common.enums.UserGender;
import com.surveyflow.validation.EnumValue;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record SurveyUpsertRequest(
        Long categoryId,
        @NotBlank(message = "is required")
        @Size(max = 255, message = "must not exceed {max} characters")
        String title,
        String description,
        String researchPurpose,
        String participantInstructions,

        @NotBlank(message = "is required")
        @EnumValue(enumClass = SurveyProvider.class)
        String provider,

        @Size(max = 1000, message = "must not exceed {max} characters")
        String externalFormUrl,

        @Positive(message = "must be greater than 0")
        Integer estimatedDurationSeconds,

        @Positive(message = "must be greater than 0")
        Integer questionCount,

        @Size(max = 16, message = "must not exceed {max} characters")
        String language,

        @NotNull(message = "is required")
        Boolean containsSensitiveQuestions,
        String dataUsageNotice,

        @NotNull(message = "is required")
        @Positive(message = "must be greater than 0")
        Integer targetResponseCount,

        @Positive(message = "must be greater than 0")
        Long rewardCredit,

        @NotNull(message = "is required")
        @Positive(message = "must be greater than 0")
        Integer slotTtlSeconds,

        @Future(message = "must be in the future")
        Instant deadline,

        @NotNull(message = "is required")
        @Valid
        VerificationRequest verification,

        @Valid TargetingRequest targeting
) {

    public SurveyUpsertRequest(
            Long categoryId,
            String title,
            String description,
            String researchPurpose,
            String participantInstructions,
            String provider,
            String externalFormUrl,
            Integer estimatedDurationSeconds,
            Integer questionCount,
            String language,
            Boolean containsSensitiveQuestions,
            String dataUsageNotice,
            Integer targetResponseCount,
            Integer slotTtlSeconds,
            Instant deadline,
            VerificationRequest verification,
            TargetingRequest targeting
    ) {
        this(categoryId, title, description, researchPurpose, participantInstructions, provider,
                externalFormUrl, estimatedDurationSeconds, questionCount, language,
                containsSensitiveQuestions, dataUsageNotice, targetResponseCount, 10L,
                slotTtlSeconds, deadline, verification, targeting);
    }

    public record VerificationRequest(
            @NotBlank(message = "is required")
            @EnumValue(enumClass = SurveyVerificationMethod.class)
            String method,

            @NotNull(message = "is required")
            @PositiveOrZero(message = "must be greater than or equal to 0")
            Integer minCompletionSeconds,

            @NotNull(message = "is required")
            @Positive(message = "must be greater than 0")
            Integer maxCompletionSeconds,

            @NotNull(message = "is required")
            @Min(value = 1, message = "must be greater than or equal to {value}")
            @Max(value = 10, message = "must be less than or equal to {value}")
            Integer maxAttempts
    ) {
    }

    public record TargetingRequest(
            @Min(value = 1900, message = "must be greater than or equal to {value}")
            Integer minBirthYear,

            @Min(value = 1900, message = "must be greater than or equal to {value}")
            Integer maxBirthYear,

            @EnumValue(enumClass = UserGender.class)
            String gender,

            @Size(max = 255, message = "must not exceed {max} characters")
            String school,

            @Size(max = 255, message = "must not exceed {max} characters")
            String occupation,

            Set<@Positive(message = "must be greater than 0") Long> interestIds
    ) {

        public UserGender genderValue() {
            return gender == null || gender.isBlank() ? null : UserGender.valueOf(gender.strip());
        }
    }

}
