package com.surveyflow.model;

import java.math.BigDecimal;
import java.time.Instant;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.surveyflow.common.enums.PaymentProvider;
import com.surveyflow.common.enums.PaymentStatus;
import com.surveyflow.common.enums.PaymentType;

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
        name = "payments",
        indexes = {
                @Index(name = "idx_payments_user_id", columnList = "user_id"),
                @Index(name = "idx_payments_type", columnList = "type"),
                @Index(name = "idx_payments_provider", columnList = "provider"),
                @Index(name = "idx_payments_status", columnList = "status"),
                @Index(name = "idx_payments_provider_payment_id", columnList = "provider_payment_id"),
                @Index(name = "idx_payments_transaction_code", columnList = "transaction_code"),
                @Index(name = "idx_payments_created_at", columnList = "created_at")
        }
)
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PaymentType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PaymentProvider provider;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(nullable = false, precision = 23, scale = 2)
    private BigDecimal amount;

    @Column(name = "credit_amount")
    private Long creditAmount;

    @Column(nullable = false, length = 10)
    private String currency = "VND";

    @Column(length = 255, name = "provider_payment_id")
    private String providerPaymentId;

    @Column(length = 255, name = "transaction_code")
    private String transactionCode;

    @Column(length = 500)
    private String description;

    @Column(name = "paid_at")
    private Instant paidAt;

    @Column(name = "failed_at")
    private Instant failedAt;

    @Column(name = "cancelled_at")
    private Instant cancelledAt;

    @Column(name = "refunded_at")
    private Instant refundedAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false, name = "created_at")
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false, name = "updated_at")
    private Instant updatedAt;
}
