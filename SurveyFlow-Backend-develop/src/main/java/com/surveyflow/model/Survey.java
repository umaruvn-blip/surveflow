package com.surveyflow.model;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.surveyflow.common.enums.SurveyProvider;
import com.surveyflow.common.enums.SurveyStatus;

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
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
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
        name = "surveys",
        indexes = {
                @Index(name = "idx_surveys_creator_id", columnList = "creator_id"),
                @Index(name = "idx_surveys_category_id", columnList = "category_id"),
                @Index(name = "idx_surveys_status", columnList = "status"),
                @Index(name = "idx_surveys_deadline", columnList = "deadline"),
                @Index(name = "idx_surveys_status_deadline", columnList = "status, deadline")
        }
)
public class Survey {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private SurveyCategory category;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT", name = "research_purpose")
    private String researchPurpose;

    @Column(columnDefinition = "TEXT", name = "participant_instructions")
    private String participantInstructions;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SurveyProvider provider;

    @Column(length = 1000, name = "external_form_url")
    private String externalFormUrl;

    @Column(name = "estimated_duration_seconds")
    private Integer estimatedDurationSeconds;

    @Column(name = "question_count")
    private Integer questionCount;

    @Column(length = 16)
    private String language;

    @Column(nullable = false, name = "contains_sensitive_questions")
    private Boolean containsSensitiveQuestions = false;

    @Column(columnDefinition = "TEXT", name = "data_usage_notice")
    private String dataUsageNotice;

    @Column(nullable = false, name = "target_response_count")
    private Integer targetResponseCount;

    @Column(nullable = false, name = "reward_credit")
    private Long rewardCredit = 10L;

    @Column(nullable = false, name = "current_response_count")
    private Integer currentResponseCount = 0;

    @Column(name = "slot_ttl_seconds")
    private Integer slotTtlSeconds;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SurveyStatus status = SurveyStatus.DRAFT;

    @Column(name = "published_at")
    private Instant publishedAt;

    private Instant deadline;

    @Version
    @Column(nullable = false, name = "lock_version")
    private Long lockVersion = 0L;

    @OneToOne(mappedBy = "survey", fetch = FetchType.LAZY)
    private SurveyTargeting targeting;

    @OneToMany(mappedBy = "survey")
    private Set<SurveyTagMapping> tagMappings = new HashSet<>();

    @OneToMany(mappedBy = "survey")
    private Set<SurveyTargetInterest> targetInterests = new HashSet<>();

    @CreationTimestamp
    @Column(nullable = false, updatable = false, name = "created_at")
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false, name = "updated_at")
    private Instant updatedAt;
}
