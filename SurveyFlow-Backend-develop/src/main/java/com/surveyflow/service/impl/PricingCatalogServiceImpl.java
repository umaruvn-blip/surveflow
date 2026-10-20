package com.surveyflow.service.impl;

import java.time.Clock;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.surveyflow.dto.response.pricing.CreditPackageResponse;
import com.surveyflow.dto.response.pricing.PlanEntitlementResponse;
import com.surveyflow.dto.response.pricing.RewardCatalogItemResponse;
import com.surveyflow.dto.response.pricing.SubscriptionPlanResponse;
import com.surveyflow.dto.response.pricing.SubscriptionPriceResponse;
import com.surveyflow.model.SubscriptionPlan;
import com.surveyflow.repository.CreditPackageRepository;
import com.surveyflow.repository.PlanEntitlementRepository;
import com.surveyflow.repository.RewardCatalogRepository;
import com.surveyflow.repository.SubscriptionPriceRepository;
import com.surveyflow.service.PricingCatalogService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PricingCatalogServiceImpl implements PricingCatalogService {

    private final CreditPackageRepository creditPackageRepository;
    private final SubscriptionPriceRepository subscriptionPriceRepository;
    private final PlanEntitlementRepository entitlementRepository;
    private final RewardCatalogRepository rewardCatalogRepository;
    private final Clock clock;

    @Override
    public List<CreditPackageResponse> getCreditPackages() {
        return creditPackageRepository.findAllByActiveTrueOrderByDisplayOrderAscIdAsc().stream()
                .map(item -> new CreditPackageResponse(
                        item.getId(), item.getCode(), item.getName(), item.getCreditAmount(),
                        item.getPrice(), item.getCurrency()))
                .toList();
    }

    @Override
    public List<SubscriptionPlanResponse> getSubscriptionPlans() {
        var currentPrices = subscriptionPriceRepository.findCurrentActivePrices(clock.instant());
        if (currentPrices.isEmpty()) {
            return List.of();
        }

        Map<Long, SubscriptionPlan> plans = new LinkedHashMap<>();
        Map<Long, List<SubscriptionPriceResponse>> pricesByPlan = new LinkedHashMap<>();
        for (var price : currentPrices) {
            Long planId = price.getPlan().getId();
            plans.putIfAbsent(planId, price.getPlan());
            pricesByPlan.computeIfAbsent(planId, ignored -> new ArrayList<>())
                    .add(new SubscriptionPriceResponse(
                            price.getId(), price.getBillingPeriod(), price.getPrice(),
                            price.getCurrency(), price.getValidFrom(), price.getValidUntil()));
        }

        Map<Long, List<PlanEntitlementResponse>> entitlementsByPlan = new LinkedHashMap<>();
        for (var entitlement : entitlementRepository.findByPlanIds(plans.keySet())) {
            entitlementsByPlan.computeIfAbsent(entitlement.getPlan().getId(), ignored -> new ArrayList<>())
                    .add(new PlanEntitlementResponse(
                            entitlement.getCode(), entitlement.getValueType(),
                            entitlement.getValueAmount(), entitlement.getResetPeriod()));
        }

        return plans.values().stream()
                .map(plan -> new SubscriptionPlanResponse(
                        plan.getId(), plan.getCode(), plan.getName(), plan.getDescription(),
                        List.copyOf(pricesByPlan.get(plan.getId())),
                        List.copyOf(entitlementsByPlan.getOrDefault(plan.getId(), List.of()))))
                .toList();
    }

    @Override
    public List<RewardCatalogItemResponse> getRewards() {
        return rewardCatalogRepository.findAllByActiveTrueOrderByDisplayOrderAscIdAsc().stream()
                .map(item -> new RewardCatalogItemResponse(
                        item.getId(), item.getCode(), item.getName(), item.getRewardType(),
                        item.getCreditCost(), item.getRewardAmount(), item.getRewardUnit()))
                .toList();
    }
}
