package com.surveyflow.model;

import java.time.Instant;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import com.surveyflow.common.enums.ParticipationStatus;

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
import jakarta.persistence.Version;
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
        name = "survey_participations",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_survey_participations_public_id",
                columnNames = "public_id"
        ),
        indexes = {
                @Index(name = "idx_survey_participations_survey_id_verification_config_version", columnList = "survey_id, verification_config_version"),
                @Index(name = "idx_survey_participations_survey_id_status", columnList = "survey_id, status"),
                @Index(name = "idx_survey_participations_user_id_created_at", columnList = "user_id, created_at"),
                @Index(name = "idx_survey_participations_status_slot_expires_at", columnList = "status, slot_expires_at")
        }
)
public class SurveyParticipation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 36, name = "public_id")
    private String publicId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "survey_id", nullable = false)
    private Survey survey;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, name = "verification_config_version")
    private Integer verificationConfigVersion;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON", name = "eligibility_snapshot")
    private String eligibilitySnapshot;

    @Column(length = 255, name = "verification_code_hash")
    private String verificationCodeHash;

    @Column(name = "verification_code_issued_at")
    private Instant verificationCodeIssuedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ParticipationStatus status = ParticipationStatus.RESERVED;

    @Column(nullable = false, name = "slot_reserved_at")
    private Instant slotReservedAt;

    @Column(nullable = false, name = "slot_expires_at")
    private Instant slotExpiresAt;

    @Column(name = "submitted_at")
    private Instant submittedAt;

    @Column(name = "verified_at")
    private Instant verifiedAt;

    @Column(name = "rejected_at")
    private Instant rejectedAt;

    @Column(nullable = false, name = "verification_attempt_count")
    private Integer verificationAttemptCount = 0;

    @Column(length = 100, name = "failure_reason")
    private String failureReason;

    @Version
    @Column(nullable = false, name = "lock_version")
    private Long lockVersion = 0L;

    @CreationTimestamp
    @Column(nullable = false, updatable = false, name = "created_at")
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false, name = "updated_at")
    private Instant updatedAt;
}
