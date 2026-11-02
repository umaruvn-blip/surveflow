package com.surveyflow.dto.response.admin;

import java.math.BigDecimal;
import java.time.Instant;

import com.surveyflow.common.enums.PaymentProvider;
import com.surveyflow.common.enums.PaymentStatus;
import com.surveyflow.common.enums.PaymentType;

public record AdminPaymentItemResponse(
        Long id,
        Long userId,
        String userEmail,
        String userName,
        PaymentType type,
        PaymentProvider provider,
        PaymentStatus status,
        BigDecimal amount,
        String currency,
        Long creditAmount,
        String planName,
        String planCode,
        String transactionCode,
        String description,
        Instant createdAt,
        Instant paidAt,
        Instant cancelledAt
) {
}
