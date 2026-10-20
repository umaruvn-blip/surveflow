package com.surveyflow.model;

import java.time.Instant;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "user_auth_identities", uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_auth_identity_provider_issuer_subject", columnNames = {"provider", "issuer", "subject"})
})
public class UserAuthIdentity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 30)
    private String provider; // Nhà cung cấp đăng nhập, ví dụ GOOGLE

    @Column(nullable = false, length = 255)
    private String issuer; // Đơn vị phát hành identity

    @Column(nullable = false, length = 255)
    private String subject; // ID ổn định của user tại provider

    @Column(name = "email_at_link", nullable = false, length = 255)
    private String emailAtLink; // Email tại thời điểm liên kết

    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified; // Provider xác nhận email đã kiểm chứng

    @CreationTimestamp
    @Column(nullable = false, updatable = false, name = "created_at")
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false, name = "updated_at")
    private Instant updatedAt;
}
