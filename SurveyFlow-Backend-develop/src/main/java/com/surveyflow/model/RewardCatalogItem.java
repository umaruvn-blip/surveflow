package com.surveyflow.model;

import java.time.Instant;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.surveyflow.common.enums.RewardType;
import com.surveyflow.common.enums.RewardUnit;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
        name = "reward_catalog",
        uniqueConstraints = @UniqueConstraint(name = "uk_reward_catalog_code", columnNames = "code"),
        indexes = @Index(name = "idx_reward_catalog_is_active", columnList = "is_active")
)
public class RewardCatalogItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30, name = "reward_type")
    private RewardType rewardType;

    @Column(nullable = false, name = "credit_cost")
    private Long creditCost;

    @Column(name = "reward_amount")
    private Long rewardAmount;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, name = "reward_unit")
    private RewardUnit rewardUnit;

    @Column(nullable = false, name = "is_active")
    private boolean active = true;

    @Column(nullable = false, name = "display_order")
    private Integer displayOrder;

    @CreationTimestamp
    @Column(nullable = false, updatable = false, name = "created_at")
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false, name = "updated_at")
    private Instant updatedAt;
}
