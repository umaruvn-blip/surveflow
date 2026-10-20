package com.surveyflow.dto.request.user;

import java.util.List;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ReplaceInterestsRequest(
        @NotNull(message = "is required")
        List<@NotNull(message = "must not contain null") @Positive(message = "must be greater than 0") Long> interestIds
) {
}
