package com.surveyflow.dto.response.pricing;

import java.math.BigDecimal;

public record CreditPackageResponse(
        Long id,
        String code,
        String name,
        Long creditAmount,
        BigDecimal price,
        String currency
) {
}
