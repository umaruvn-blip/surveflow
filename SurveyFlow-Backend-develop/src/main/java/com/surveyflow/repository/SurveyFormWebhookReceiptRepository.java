package com.surveyflow.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.surveyflow.model.SurveyFormWebhookReceipt;

public interface SurveyFormWebhookReceiptRepository extends JpaRepository<SurveyFormWebhookReceipt, Long> {

    /** Tìm callback đã nhận để ngăn xử lý trùng một Google Form response. */
    Optional<SurveyFormWebhookReceipt> findByExternalFormIdAndExternalResponseId(
            String externalFormId, String externalResponseId);
}
