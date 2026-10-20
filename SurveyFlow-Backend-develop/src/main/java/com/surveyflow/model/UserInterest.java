package com.surveyflow.model;

import java.time.Instant;

import org.hibernate.annotations.CreationTimestamp;

import com.surveyflow.model.id.UserInterestId;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@IdClass(UserInterestId.class)
@Table(
        name = "user_interests",
        indexes = @Index(name = "idx_user_interests_interest_id", columnList = "interest_id")
)
public class UserInterest {

    @Id
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Id
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "interest_id", nullable = false)
    private Interest interest;

    @CreationTimestamp
    @Column(nullable = false, updatable = false, name = "created_at")
    private Instant createdAt;
}
