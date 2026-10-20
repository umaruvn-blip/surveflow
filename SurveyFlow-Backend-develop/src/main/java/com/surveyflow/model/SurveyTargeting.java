package com.surveyflow.model;

import java.time.Instant;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.surveyflow.common.enums.UserGender;

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
import jakarta.persistence.OneToOne;
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
        name = "survey_targeting",
        uniqueConstraints = @UniqueConstraint(name = "uk_survey_targeting_survey_id", columnNames = "survey_id"),
        indexes = {
                @Index(name = "idx_survey_targeting_survey_id", columnList = "survey_id", unique = true),
                @Index(name = "idx_survey_targeting_gender", columnList = "gender")
        }
)
public class SurveyTargeting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "survey_id", nullable = false, unique = true)
    private Survey survey;

    @Column(name = "min_birth_year")
    private Integer minBirthYear;

    @Column(name = "max_birth_year")
    private Integer maxBirthYear;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private UserGender gender;

    @Column(length = 255)
    private String school;

    @Column(length = 255)
    private String occupation;

    @CreationTimestamp
    @Column(nullable = false, updatable = false, name = "created_at")
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false, name = "updated_at")
    private Instant updatedAt;
}
