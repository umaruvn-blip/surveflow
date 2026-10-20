package com.surveyflow.dto.response.survey;

public record SurveyTrackingSummaryResponse(
        long publishedCount,
        long formOpenCount,
        long completedCount,
        double completionRate,
        long creditsAwarded,
        long invalidCodeCount,
        long xpAwarded
) {
}
