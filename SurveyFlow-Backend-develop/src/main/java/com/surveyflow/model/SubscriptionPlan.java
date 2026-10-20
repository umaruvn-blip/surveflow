package com.surveyflow.model;

import java.math.BigDecimal;
import java.time.Instant;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
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
        name = "subscription_plans",
        uniqueConstraints = @UniqueConstraint(name = "uk_subscription_plans_code", columnNames = "code"),
        indexes = {
                @Index(name = "idx_subscription_plans_code", columnList = "code", unique = true),
                @Index(name = "idx_subscription_plans_is_active", columnList = "is_active")
        }
)
public class SubscriptionPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price = BigDecimal.ZERO;

    @Column(name = "duration_days")
    private Integer durationDays;

    @Column(name = "survey_limit")
    private Integer surveyLimit;

    @Column(name = "ai_usage_limit")
    private Integer aiUsageLimit;

    @Column(nullable = false, name = "priority_boost_enabled")
    private boolean priorityBoostEnabled = false;

    @Column(nullable = false, name = "advanced_analytics_enabled")
    private boolean advancedAnalyticsEnabled = false;

    @Column(nullable = false, name = "is_active")
    private boolean active = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false, name = "created_at")
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false, name = "updated_at")
    private Instant updatedAt;
}
