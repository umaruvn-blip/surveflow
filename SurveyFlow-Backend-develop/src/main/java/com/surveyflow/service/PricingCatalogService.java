package com.surveyflow.service;

import java.util.List;

import com.surveyflow.dto.response.pricing.CreditPackageResponse;
import com.surveyflow.dto.response.pricing.RewardCatalogItemResponse;
import com.surveyflow.dto.response.pricing.SubscriptionPlanResponse;

public interface PricingCatalogService {

    /** Liệt kê các gói Credits đang bán. */
    List<CreditPackageResponse> getCreditPackages();

    /** Liệt kê các gói subscription có giá đang hiệu lực cùng quyền lợi. */
    List<SubscriptionPlanResponse> getSubscriptionPlans();

    /** Liệt kê các phần thưởng đang có trong danh mục đổi Credits. */
    List<RewardCatalogItemResponse> getRewards();
}
