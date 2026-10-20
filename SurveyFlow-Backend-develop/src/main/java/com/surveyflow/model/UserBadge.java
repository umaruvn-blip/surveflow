package com.surveyflow.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
        name = "user_badges",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_user_badges_user_id_badge_id",
                columnNames = {"user_id", "badge_id"}
        ),
        indexes = {
                @Index(name = "idx_user_badges_user_id", columnList = "user_id"),
                @Index(name = "idx_user_badges_badge_id", columnList = "badge_id"),
                @Index(name = "idx_user_badges_earned_at", columnList = "earned_at")
        }
)
public class UserBadge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "badge_id", nullable = false)
    private Badge badge;

    @Column(nullable = false, name = "earned_at")
    private Instant earnedAt;

    @Column(length = 50, name = "source_type")
    private String sourceType;

    @Column(name = "source_id")
    private Long sourceId;
}
