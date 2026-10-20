package com.surveyflow.dto.response.pricing;

import com.surveyflow.common.enums.EntitlementResetPeriod;
import com.surveyflow.common.enums.EntitlementValueType;

public record PlanEntitlementResponse(
        String code,
        EntitlementValueType valueType,
        Long valueAmount,
        EntitlementResetPeriod resetPeriod
) {
}
