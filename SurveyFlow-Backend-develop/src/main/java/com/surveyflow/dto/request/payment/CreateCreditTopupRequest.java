package com.surveyflow.dto.request.payment;

import jakarta.validation.constraints.NotNull;

public record CreateCreditTopupRequest(
        @NotNull(message = "is required")
        Long credits
) {
}
