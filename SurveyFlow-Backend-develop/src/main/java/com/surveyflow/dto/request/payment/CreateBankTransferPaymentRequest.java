package com.surveyflow.dto.request.payment;

import com.surveyflow.common.enums.PaymentType;

import jakarta.validation.constraints.NotNull;

public record CreateBankTransferPaymentRequest(
        @NotNull(message = "Loại thanh toán không được để trống")
        PaymentType type,

        Long packageId,
        Long credits,
        Long planId,
        Long priceId
) {
}
