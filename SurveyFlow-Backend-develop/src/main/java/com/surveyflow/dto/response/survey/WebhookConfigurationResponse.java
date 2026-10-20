package com.surveyflow.dto.response.survey;

public record WebhookConfigurationResponse(
        Long surveyId,
        String webhookPath,
        String verificationPath,
        String webhookToken
) {
}
