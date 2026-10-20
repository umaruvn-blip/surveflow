package com.surveyflow.model;

import java.time.Instant;

import org.hibernate.annotations.CreationTimestamp;

import com.surveyflow.common.enums.WebhookReceiptStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(
        name = "survey_form_webhook_receipts",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_survey_form_webhook_receipts_form_response",
                columnNames = {"external_form_id", "external_response_id"}
        ),
        indexes = {
                @Index(name = "idx_survey_form_webhook_receipts_survey_id", columnList = "survey_id"),
                @Index(name = "idx_survey_form_webhook_receipts_participation_id", columnList = "participation_id")
        }
)
public class SurveyFormWebhookReceipt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "survey_id", nullable = false)
    private Survey survey;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participation_id")
    private SurveyParticipation participation;

    @Column(nullable = false, length = 255, name = "external_form_id")
    private String externalFormId;

    @Column(nullable = false, length = 255, name = "external_response_id")
    private String externalResponseId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private WebhookReceiptStatus status = WebhookReceiptStatus.RECEIVED;

    @Column(name = "processed_at")
    private Instant processedAt;

    @Column(length = 100, name = "failure_reason")
    private String failureReason;

    @CreationTimestamp
    @Column(nullable = false, updatable = false, name = "received_at")
    private Instant receivedAt;
}
