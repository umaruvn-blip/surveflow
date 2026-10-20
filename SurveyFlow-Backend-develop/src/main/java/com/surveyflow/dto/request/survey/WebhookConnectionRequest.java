package com.surveyflow.dto.request.survey;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record WebhookConnectionRequest(
        @NotBlank(message = "is required")
        @Size(max = 255, message = "must not exceed {max} characters")
        String formId
) {
}
