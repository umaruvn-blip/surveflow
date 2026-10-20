package com.surveyflow.dto.response.subscription;

import java.time.Instant;
import java.util.List;

public record CurrentSubscriptionResponse(
        boolean active,
        Long subscriptionId,
        String planCode,
        Instant startedAt,
        Instant expiredAt,
        List<SubscriptionEntitlementResponse> entitlements
) {
}
