package com.surveyflow.dto.response.pricing;

import java.math.BigDecimal;
import java.time.Instant;

import com.surveyflow.common.enums.SubscriptionBillingPeriod;

public record SubscriptionPriceResponse(
        Long id,
        SubscriptionBillingPeriod billingPeriod,
        BigDecimal price,
        String currency,
        Instant validFrom,
        Instant validUntil
) {
}
