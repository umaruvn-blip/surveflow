package com.surveyflow.dto.response.subscription;

import com.surveyflow.common.enums.EntitlementResetPeriod;
import com.surveyflow.common.enums.EntitlementValueType;

public record SubscriptionEntitlementResponse(
        String code,
        EntitlementValueType valueType,
        Long valueAmount,
        EntitlementResetPeriod resetPeriod
) {
}
