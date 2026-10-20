package com.surveyflow.dto.request.survey;

import java.time.Instant;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record GoogleFormWebhookRequest(
        @NotBlank(message = "is required")
        @Size(max = 255, message = "must not exceed {max} characters")
        String formId,

        @NotBlank(message = "is required")
        @Size(max = 255, message = "must not exceed {max} characters")
        String responseId,

        @NotNull(message = "is required")
        Instant submittedAt,

        @NotBlank(message = "is required")
        @Size(max = 128, message = "must not exceed {max} characters")
        String completionCode
) {
}
