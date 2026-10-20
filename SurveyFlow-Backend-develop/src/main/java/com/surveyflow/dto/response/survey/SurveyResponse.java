package com.surveyflow.dto.response.survey;

import java.time.Instant;
import java.util.Set;

import com.surveyflow.common.enums.SurveyProvider;
import com.surveyflow.common.enums.SurveyStatus;
import com.surveyflow.common.enums.SurveyVerificationMethod;
import com.surveyflow.common.enums.UserGender;

public record SurveyResponse(
        Long id,
        Long creatorId,
        Long categoryId,
        String title,
        String description,
        String researchPurpose,
        String participantInstructions,
        SurveyProvider provider,
        String externalFormUrl,
        Integer estimatedDurationSeconds,
        Integer questionCount,
        String language,
        Boolean containsSensitiveQuestions,
        String dataUsageNotice,
        Long rewardCredit,
        Integer targetResponseCount,
        Integer currentResponseCount,
        long availableSlots,
        Integer slotTtlSeconds,
        SurveyStatus status,
        Instant publishedAt,
        Instant deadline,
        Verification verification,
        Targeting targeting,
        Instant createdAt,
        Instant updatedAt
) {

    public record Verification(
            Integer version,
            SurveyVerificationMethod method,
            Integer minCompletionSeconds,
            Integer maxCompletionSeconds,
            Integer maxAttempts,
            boolean webhookVerified
    ) {
    }

    public record Targeting(
            Integer minBirthYear,
            Integer maxBirthYear,
            UserGender gender,
            String school,
            String occupation,
            Set<Long> interestIds
    ) {
    }
}
