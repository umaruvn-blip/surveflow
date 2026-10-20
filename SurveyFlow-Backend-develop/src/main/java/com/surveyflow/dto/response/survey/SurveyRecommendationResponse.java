package com.surveyflow.dto.response.survey;

import java.time.Instant;
import java.util.List;

import com.surveyflow.common.enums.SurveyStatus;

public record SurveyRecommendationResponse(
        Long id,
        String title,
        String description,
        String categoryName,
        SurveyStatus status,
        Long rewardCredit,
        Integer targetResponseCount,
        Integer currentResponseCount,
        Instant deadline,
        List<String> targetInterests,
        Double matchScore
) {
}
