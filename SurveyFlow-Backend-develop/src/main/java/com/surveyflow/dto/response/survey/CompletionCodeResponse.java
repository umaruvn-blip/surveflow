package com.surveyflow.dto.response.survey;

import java.time.Instant;

public record CompletionCodeResponse(
        String participationPublicId,
        String completionCode,
        Instant issuedAt,
        Instant expiresAt
) {
}
