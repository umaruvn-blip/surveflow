package com.surveyflow.dto.response.aimatching;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AiMatchResponse(
        @JsonProperty("results")
        List<SurveyScoreDto> results
) {
}
