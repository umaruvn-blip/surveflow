package com.surveyflow.dto.response.pricing;

import com.surveyflow.common.enums.RewardType;
import com.surveyflow.common.enums.RewardUnit;

public record RewardCatalogItemResponse(
        Long id,
        String code,
        String name,
        RewardType rewardType,
        Long creditCost,
        Long rewardAmount,
        RewardUnit rewardUnit
) {
}
