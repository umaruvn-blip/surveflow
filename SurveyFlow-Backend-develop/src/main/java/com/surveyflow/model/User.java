package com.surveyflow.model;

import java.time.Instant;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.surveyflow.common.enums.AuthProvider;
import com.surveyflow.common.enums.UserStatus;

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
import jakarta.persistence.PrePersist;
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
        name = "users",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_users_email", columnNames = "email"),
                @UniqueConstraint(name = "uk_users_referral_code", columnNames = "referral_code")
        },
        indexes = {
                @Index(name = "idx_users_email", columnList = "email", unique = true),
                @Index(name = "idx_users_auth_provider_provider_user_id", columnList = "auth_provider, provider_user_id"),
                @Index(name = "idx_users_referred_by_user_id", columnList = "referred_by_user_id")
        }
)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30, name = "auth_provider")
    private AuthProvider authProvider = AuthProvider.LOCAL;

    @Column(length = 255, name = "provider_user_id")
    private String providerUserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private UserStatus status = UserStatus.ACTIVE;

    @Column(nullable = false, length = 12, name = "referral_code")
    private String referralCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referred_by_user_id")
    private User referredBy;

    @OneToOne(mappedBy = "user", fetch = FetchType.LAZY)
    private UserProfile profile;

    @OneToMany(mappedBy = "user")
    private Set<UserRole> userRoles = new HashSet<>();

    @OneToMany(mappedBy = "user")
    private Set<UserInterest> userInterests = new HashSet<>();

    @CreationTimestamp
    @Column(nullable = false, updatable = false, name = "created_at")
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false, name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    private void assignReferralCode() {
        if (referralCode == null || referralCode.isBlank()) {
            referralCode = UUID.randomUUID().toString()
                    .replace("-", "")
                    .substring(0, 12)
                    .toUpperCase(Locale.ROOT);
        }
    }

    public Set<Role> getRoles() {
        return userRoles.stream()
                .map(UserRole::getRole)
                .collect(Collectors.toUnmodifiableSet());
    }
}
