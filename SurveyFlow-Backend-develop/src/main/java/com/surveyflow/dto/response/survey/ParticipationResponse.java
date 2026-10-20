package com.surveyflow.dto.response.survey;

import java.time.Instant;

import com.surveyflow.common.enums.ParticipationStatus;

public record ParticipationResponse(
        String publicId,
        Long surveyId,
        Long userId,
        ParticipationStatus status,
        Long rewardCredit,
        String externalFormUrl,
        Instant slotReservedAt,
        Instant codeAvailableAt,
        Instant slotExpiresAt,
        Instant submittedAt,
        Instant verifiedAt,
        Instant rejectedAt,
        Integer verificationAttemptCount,
        String failureReason
) {
}
