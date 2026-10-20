package com.surveyflow.model;

import java.time.Instant;

import org.hibernate.annotations.CreationTimestamp;

import com.surveyflow.common.enums.CreditTransactionDirection;
import com.surveyflow.common.enums.CreditTransactionType;

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
        name = "credit_transactions",
        indexes = {
                @Index(name = "idx_credit_transactions_wallet_id", columnList = "wallet_id"),
                @Index(name = "idx_credit_transactions_type", columnList = "type"),
                @Index(name = "idx_credit_transactions_created_at", columnList = "created_at"),
                @Index(name = "idx_credit_transactions_reference_type_reference_id", columnList = "reference_type, reference_id")
        }
)
public class CreditTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "wallet_id", nullable = false)
    private CreditWallet wallet;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private CreditTransactionType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CreditTransactionDirection direction;

    @Column(nullable = false)
    private Long amount;

    @Column(nullable = false, name = "balance_before")
    private Long balanceBefore;

    @Column(nullable = false, name = "balance_after")
    private Long balanceAfter;

    @Column(length = 50, name = "reference_type")
    private String referenceType;

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "payment_id", unique = true)
    private Long paymentId;

    @Column(length = 500)
    private String description;

    @CreationTimestamp
    @Column(nullable = false, updatable = false, name = "created_at")
    private Instant createdAt;
}
