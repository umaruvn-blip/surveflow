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
        name = "user_profiles",
        uniqueConstraints = @UniqueConstraint(name = "uk_user_profiles_user_id", columnNames = "user_id"),
        indexes = {
                @Index(name = "idx_user_profiles_user_id", columnList = "user_id", unique = true),
                @Index(name = "idx_user_profiles_birth_year", columnList = "birth_year"),
                @Index(name = "idx_user_profiles_gender", columnList = "gender")
        }
)
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(length = 100, name = "display_name")
    private String displayName;

    @Column(length = 500, name = "avatar_url")
    private String avatarUrl;

    @Column(name = "birth_year")
    private Integer birthYear;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private UserGender gender;

    @Column(length = 255)
    private String school;

    @Column(length = 255)
    private String occupation;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @CreationTimestamp
    @Column(nullable = false, updatable = false, name = "created_at")
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false, name = "updated_at")
    private Instant updatedAt;
}
