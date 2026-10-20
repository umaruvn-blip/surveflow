package com.surveyflow.dto.response.payment;

import java.math.BigDecimal;
import java.time.Instant;

import com.surveyflow.common.enums.PaymentStatus;

public record TopupPaymentResponse(
        Long id,
        Long credits,
        BigDecimal amountVnd,
        PaymentStatus status,
        Instant createdAt,
        Instant paidAt
) {
}
