package com.surveyflow.service.impl;

import java.time.Clock;
import java.time.Instant;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.surveyflow.common.enums.ParticipationStatus;
import com.surveyflow.common.enums.SurveyStatus;
import com.surveyflow.common.enums.SurveyVerificationMethod;
import com.surveyflow.common.enums.WebhookReceiptStatus;
import com.surveyflow.dto.request.survey.GoogleFormWebhookRequest;
import com.surveyflow.dto.request.survey.WebhookConnectionRequest;
import com.surveyflow.dto.response.survey.WebhookAcknowledgementResponse;
import com.surveyflow.exception.BusinessException;
import com.surveyflow.exception.ConflictException;
import com.surveyflow.exception.ResourceNotFoundException;
import com.surveyflow.exception.UnauthorizedException;
import com.surveyflow.model.Survey;
import com.surveyflow.model.SurveyFormWebhookReceipt;
import com.surveyflow.model.SurveyParticipation;
import com.surveyflow.model.SurveyVerificationConfig;
import com.surveyflow.repository.CreditTransactionRepository;
import com.surveyflow.repository.SurveyFormWebhookReceiptRepository;
import com.surveyflow.repository.SurveyParticipationRepository;
import com.surveyflow.repository.SurveyRepository;
import com.surveyflow.repository.SurveyVerificationConfigRepository;
import com.surveyflow.service.SurveyWebhookService;
import com.surveyflow.service.CreditWalletBalanceService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j(topic = "SURVEY-WEBHOOK-SERVICE")
@Service
@RequiredArgsConstructor
public class SurveyWebhookServiceImpl implements SurveyWebhookService {

    private static final long SURVEY_COMPLETION_REWARD = 10L;

    private final SurveyRepository surveyRepository;
    private final SurveyVerificationConfigRepository verificationConfigRepository;
    private final SurveyParticipationRepository participationRepository;
    private final SurveyFormWebhookReceiptRepository receiptRepository;
    private final CreditTransactionRepository creditTransactionRepository;
    private final CreditWalletBalanceService creditWalletBalanceService;
    private final SurveySecuritySupport securitySupport;
    private final Clock clock;

    @Override
    @Transactional
    public void verifyConnection(Long surveyId, String webhookToken, WebhookConnectionRequest request) {
        Survey survey = surveyRepository.findByIdForUpdate(surveyId)
                .orElseThrow(() -> new ResourceNotFoundException("Survey not found"));
        SurveyVerificationConfig config = latestConfig(surveyId);
        authenticate(webhookToken, config);
        requireExpectedForm(survey, request.formId());
        config.setWebhookVerifiedAt(Instant.now(clock));
        log.info("Webhook connection verified: surveyId={}, configVersion={}", surveyId, config.getVersion());
    }

    @Override
    @Transactional
    public WebhookAcknowledgementResponse process(
            Long surveyId, String webhookToken, GoogleFormWebhookRequest request) {
        Survey survey = surveyRepository.findByIdForUpdate(surveyId)
                .orElseThrow(() -> new ResourceNotFoundException("Survey not found"));
        SurveyVerificationConfig latestConfig = latestConfig(surveyId);
        authenticate(webhookToken, latestConfig);
        requireExpectedForm(survey, request.formId());

        SurveyFormWebhookReceipt existing = receiptRepository
                .findByExternalFormIdAndExternalResponseId(request.formId(), request.responseId())
                .orElse(null);
        if (existing != null) {
            log.info("Duplicate webhook ignored: surveyId={}, receiptStatus={}", surveyId, existing.getStatus());
            return new WebhookAcknowledgementResponse(
                    request.responseId(),
                    existing.getStatus().name(),
                    existing.getParticipation() == null ? null : existing.getParticipation().getPublicId());
        }

        String codeHash = securitySupport.sha256(request.completionCode().strip().toUpperCase());
        SurveyParticipation participation = participationRepository.findByVerificationCodeHashForUpdate(codeHash)
                .orElseThrow(() -> new BusinessException("Completion code is invalid"));
        if (!participation.getSurvey().getId().equals(surveyId)) {
            throw new BusinessException("Completion code does not belong to this survey");
        }
        if (participation.getStatus() != ParticipationStatus.RESERVED) {
            throw new ConflictException("Participation is not awaiting form submission");
        }
        if (participation.getVerificationCodeIssuedAt() == null) {
            throw new BusinessException("Completion code has not been issued");
        }
        if (request.submittedAt().isBefore(participation.getVerificationCodeIssuedAt())) {
            throw new BusinessException("Form was submitted before completion code was issued");
        }
        if (request.submittedAt().isAfter(participation.getSlotExpiresAt())) {
            throw new BusinessException("Form was submitted after participation slot expired");
        }

        SurveyVerificationConfig participationConfig = verificationConfigRepository
                .findBySurveyIdAndVersion(surveyId, participation.getVerificationConfigVersion())
                .orElseThrow(() -> new IllegalStateException("Participation verification config is missing"));
        if (participationConfig.getMethod() != SurveyVerificationMethod.EXTERNAL_CODE) {
            throw new BusinessException("Participation does not use external code verification");
        }
        if (participationConfig.getMaxCompletionSeconds() != null
                && request.submittedAt().isAfter(participation.getSlotReservedAt()
                        .plusSeconds(participationConfig.getMaxCompletionSeconds()))) {
            throw new BusinessException("Form completion exceeded the allowed duration");
        }

        SurveyFormWebhookReceipt receipt = new SurveyFormWebhookReceipt();
        receipt.setSurvey(survey);
        receipt.setParticipation(participation);
        receipt.setExternalFormId(request.formId());
        receipt.setExternalResponseId(request.responseId());
        receipt.setStatus(WebhookReceiptStatus.RECEIVED);
        receipt = receiptRepository.save(receipt);
        log.info("Webhook receipt saved: receiptId={}, surveyId={}, participationId={}, status={}",
                receipt.getId(), surveyId, participation.getId(), receipt.getStatus());

        Instant processedAt = Instant.now(clock);
        participation.setStatus(ParticipationStatus.SUBMITTED);
        participation.setSubmittedAt(request.submittedAt());
        participation.setVerificationAttemptCount(participation.getVerificationAttemptCount() + 1);

        participation.setStatus(ParticipationStatus.VERIFIED);
        participation.setVerifiedAt(processedAt);

        if (!creditTransactionRepository.findByReferenceTypeAndReferenceId(
                "SURVEY_PARTICIPATION", participation.getId()).isEmpty()) {
            throw new ConflictException("Survey participation reward has already been granted");
        }

        creditWalletBalanceService.rewardSurveyCompletion(
                participation.getUser().getId(), participation.getId());

        participation.setVerificationCodeHash(null);
        survey.setCurrentResponseCount(survey.getCurrentResponseCount() + 1);

        receipt.setStatus(WebhookReceiptStatus.PROCESSED);
        receipt.setProcessedAt(processedAt);
        log.info("Webhook receipt status changed: receiptId={}, surveyId={}, from={}, to={}",
                receipt.getId(), surveyId, WebhookReceiptStatus.RECEIVED, WebhookReceiptStatus.PROCESSED);

        log.info("Participation status changed: surveyId={}, participationId={}, from={}, to={}, rewardCredit={}",
                surveyId, participation.getId(), ParticipationStatus.RESERVED, ParticipationStatus.VERIFIED,
                SURVEY_COMPLETION_REWARD);
        if (survey.getCurrentResponseCount() >= survey.getTargetResponseCount()) {
            SurveyStatus previousStatus = survey.getStatus();
            survey.setStatus(SurveyStatus.CLOSED);
            log.info("Survey status changed after target reached: surveyId={}, from={}, to={}",
                    surveyId, previousStatus, SurveyStatus.CLOSED);
        }

        return new WebhookAcknowledgementResponse(
                request.responseId(), receipt.getStatus().name(), participation.getPublicId());
    }

    /** Xác thực webhook token bằng hash đã lưu. */
    private void authenticate(String rawToken, SurveyVerificationConfig config) {
        if (!securitySupport.matches(rawToken, config.getWebhookTokenHash())) {
            log.warn("Webhook authentication failed: surveyId={}, configVersion={}",
                    config.getSurvey().getId(), config.getVersion());
            throw new UnauthorizedException("Invalid webhook token");
        }
    }

    /** Đối chiếu form ID callback với survey đã cấu hình. */
    private void requireExpectedForm(Survey survey, String actualFormId) {
        String expectedFormId = securitySupport.extractGoogleFormId(survey.getExternalFormUrl());
        if (!expectedFormId.equals(actualFormId)) {
            log.warn("Webhook form mismatch: surveyId={}", survey.getId());
            throw new UnauthorizedException("Google Form ID does not match survey configuration");
        }
    }

    private SurveyVerificationConfig latestConfig(Long surveyId) {
        return verificationConfigRepository.findFirstBySurveyIdOrderByVersionDesc(surveyId)
                .orElseThrow(() -> new IllegalStateException("Survey verification config is missing"));
    }
}
