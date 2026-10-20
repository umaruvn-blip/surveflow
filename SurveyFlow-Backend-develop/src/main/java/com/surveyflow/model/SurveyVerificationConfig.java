package com.surveyflow.model;

import java.time.Instant;

import org.hibernate.annotations.CreationTimestamp;

import com.surveyflow.common.enums.SurveyVerificationMethod;

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
        name = "survey_verification_configs",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_survey_verification_configs_survey_id_version",
                columnNames = {"survey_id", "version"}
        ),
        indexes = @Index(
                name = "idx_survey_verification_configs_survey_id_valid_from",
                columnList = "survey_id, valid_from"
        )
)
public class SurveyVerificationConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "survey_id", nullable = false)
    private Survey survey;

    @Column(nullable = false)
    private Integer version;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SurveyVerificationMethod method;

    @Column(name = "min_completion_seconds")
    private Integer minCompletionSeconds;

    @Column(name = "max_completion_seconds")
    private Integer maxCompletionSeconds;

    @Column(nullable = false, name = "max_attempts")
    private Integer maxAttempts = 3;

    @Column(nullable = false, name = "valid_from")
    private Instant validFrom;

    @Column(name = "valid_until")
    private Instant validUntil;

    @Column(length = 255, name = "webhook_secret_ref")
    private String webhookSecretRef;

    @Column(length = 64, name = "webhook_token_hash")
    private String webhookTokenHash;

    @Column(name = "webhook_verified_at")
    private Instant webhookVerifiedAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false, name = "created_at")
    private Instant createdAt;
}
