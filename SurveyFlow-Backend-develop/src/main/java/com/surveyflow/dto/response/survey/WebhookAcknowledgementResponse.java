package com.surveyflow.dto.response.survey;

public record WebhookAcknowledgementResponse(
        String responseId,
        String status,
        String participationPublicId
) {
}
