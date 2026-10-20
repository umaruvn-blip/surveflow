package com.surveyflow.dto.request.payment;

import com.surveyflow.common.enums.DemoPaymentOutcome;
import jakarta.validation.constraints.NotNull;

public record CompleteDemoPaymentRequest(
        @NotNull(message = "is required") DemoPaymentOutcome outcome
) {
}
