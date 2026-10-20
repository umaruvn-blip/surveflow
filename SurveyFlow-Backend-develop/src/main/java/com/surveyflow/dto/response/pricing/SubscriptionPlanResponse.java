package com.surveyflow.dto.response.pricing;

import java.util.List;

public record SubscriptionPlanResponse(
        Long id,
        String code,
        String name,
        String description,
        List<SubscriptionPriceResponse> prices,
        List<PlanEntitlementResponse> entitlements
) {
}
