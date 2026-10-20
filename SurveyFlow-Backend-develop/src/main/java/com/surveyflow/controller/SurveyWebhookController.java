package com.surveyflow.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.surveyflow.dto.request.survey.GoogleFormWebhookRequest;
import com.surveyflow.dto.request.survey.WebhookConnectionRequest;
import com.surveyflow.dto.response.ApiResponse;
import com.surveyflow.dto.response.survey.WebhookAcknowledgementResponse;
import com.surveyflow.factory.ApiResponseFactory;
import com.surveyflow.service.SurveyWebhookService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j(topic = "SURVEY-WEBHOOK-CONTROLLER")
@RestController
@RequestMapping("/api/v1/webhooks/google-forms")
@RequiredArgsConstructor
public class SurveyWebhookController {

    private static final String WEBHOOK_TOKEN_HEADER = "X-Webhook-Token";

    private final SurveyWebhookService webhookService;
    private final ApiResponseFactory responseFactory;

    /** Xác minh kết nối Apps Script với Google Form đã cấu hình. */
    @PostMapping("/{surveyId}/verify")
    public ResponseEntity<ApiResponse<Void>> verifyConnection(
            @PathVariable Long surveyId,
            @RequestHeader(WEBHOOK_TOKEN_HEADER) String webhookToken,
            @Valid @RequestBody WebhookConnectionRequest request) {
        log.info("Verify webhook connection requested: surveyId={}", surveyId);
        webhookService.verifyConnection(surveyId, webhookToken, request);
        return ResponseEntity.ok(responseFactory.success(null, "Webhook connection verified"));
    }

    /** Xử lý callback submit từ Google Forms. */
    @PostMapping("/{surveyId}")
    public ResponseEntity<ApiResponse<WebhookAcknowledgementResponse>> process(
            @PathVariable Long surveyId,
            @RequestHeader(WEBHOOK_TOKEN_HEADER) String webhookToken,
            @Valid @RequestBody GoogleFormWebhookRequest request) {
        log.info("Process Google Forms webhook requested: surveyId={}", surveyId);
        return ResponseEntity.ok(responseFactory.success(
                webhookService.process(surveyId, webhookToken, request),
                "Webhook processed"));
    }
}
