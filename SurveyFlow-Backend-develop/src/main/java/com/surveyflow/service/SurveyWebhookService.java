package com.surveyflow.service;

import com.surveyflow.dto.request.survey.GoogleFormWebhookRequest;
import com.surveyflow.dto.request.survey.WebhookConnectionRequest;
import com.surveyflow.dto.response.survey.WebhookAcknowledgementResponse;

public interface SurveyWebhookService {

    /** Xác minh kết nối webhook với Google Form đã cấu hình. */
    void verifyConnection(Long surveyId, String webhookToken, WebhookConnectionRequest request);

    /** Xác minh callback Google Forms và hoàn tất lượt tham gia. */
    WebhookAcknowledgementResponse process(Long surveyId, String webhookToken, GoogleFormWebhookRequest request);
}
