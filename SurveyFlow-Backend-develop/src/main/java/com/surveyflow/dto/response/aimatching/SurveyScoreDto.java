package com.surveyflow.dto.response.aimatching;

import com.fasterxml.jackson.annotation.JsonProperty;

public record SurveyScoreDto(
        @JsonProperty("survey_id")
        Long surveyId,

        @JsonProperty("score")
        Double score
) {
}
