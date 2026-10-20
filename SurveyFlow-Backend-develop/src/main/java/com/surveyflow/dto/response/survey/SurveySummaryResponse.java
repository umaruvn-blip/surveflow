package com.surveyflow.dto.response.survey;

import java.time.Instant;

import com.surveyflow.common.enums.SurveyProvider;
import com.surveyflow.common.enums.SurveyStatus;

public record SurveySummaryResponse(
        Long id,
        Long creatorId,
        Long categoryId,
        String title,
        SurveyProvider provider,
        Integer estimatedDurationSeconds,
        Long rewardCredit,
        Integer targetResponseCount,
        Integer currentResponseCount,
        long availableSlots,
        SurveyStatus status,
        Instant deadline,
        Instant createdAt
) {
}
