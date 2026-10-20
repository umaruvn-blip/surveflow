package com.surveyflow.dto.request.aimatching;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AiMatchRequest(
        @JsonProperty("user_text")
        String userText,

        @JsonProperty("surveys")
        List<SurveyItemDto> surveys,

        @JsonProperty("top_k")
        Integer topK
) {
}
