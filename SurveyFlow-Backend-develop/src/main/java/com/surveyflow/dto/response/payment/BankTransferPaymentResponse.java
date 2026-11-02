package com.surveyflow.dto.response.payment;

import java.math.BigDecimal;
import java.time.Instant;

import com.surveyflow.common.enums.PaymentStatus;
import com.surveyflow.common.enums.PaymentType;

public record BankTransferPaymentResponse(
        Long id,
        PaymentType type,
        PaymentStatus status,
        BigDecimal amount,
        String currency,
        Long creditAmount,
        String planName,
        String planCode,
        Integer durationDays,
        String transactionCode,
        String description,
        String bankId,
        String bankName,
        String accountNo,
        String accountName,
        String qrCodeUrl,
        Instant createdAt,
        Instant paidAt
) {
}
