package com.surveyflow.service.impl;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.surveyflow.common.enums.PlusEntitlementCode;
import com.surveyflow.common.enums.SubscriptionPlanCode;
import com.surveyflow.common.enums.SubscriptionStatus;
import com.surveyflow.dto.response.subscription.CurrentSubscriptionResponse;
import com.surveyflow.dto.response.subscription.SubscriptionEntitlementResponse;
import com.surveyflow.model.PlanEntitlement;
import com.surveyflow.model.UserSubscription;
import com.surveyflow.repository.PlanEntitlementRepository;
import com.surveyflow.repository.UserSubscriptionRepository;
import com.surveyflow.service.SubscriptionAccessService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SubscriptionAccessServiceImpl implements SubscriptionAccessService {

    private final UserSubscriptionRepository subscriptionRepository;
    private final PlanEntitlementRepository entitlementRepository;
    private final Clock clock;

    @Override
    @Transactional(readOnly = true)
    public CurrentSubscriptionResponse getCurrentSubscription(Long userId) {
        Optional<UserSubscription> current = findCurrentPlus(userId);
        if (current.isEmpty()) {
            return new CurrentSubscriptionResponse(false, null, null, null, null, List.of());
        }

        UserSubscription subscription = current.orElseThrow();
        List<SubscriptionEntitlementResponse> entitlements = entitlementRepository
                .findByPlanIdOrderByCodeAsc(subscription.getPlan().getId())
                .stream()
                .map(this::toResponse)
                .toList();

        return new CurrentSubscriptionResponse(
                true,
                subscription.getId(),
                subscription.getPlan().getCode(),
                subscription.getStartedAt(),
                subscription.getExpiredAt(),
                entitlements);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasActivePlus(Long userId) {
        return findCurrentPlus(userId).isPresent();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<SubscriptionEntitlementResponse> getEntitlement(Long userId, PlusEntitlementCode code) {
        return findCurrentPlus(userId)
                .flatMap(subscription -> entitlementRepository.findByPlanIdAndCode(
                        subscription.getPlan().getId(), code.name()))
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasEntitlement(Long userId, PlusEntitlementCode code) {
        return getEntitlement(userId, code).isPresent();
    }

    /** Chỉ cấp quyền cho kỳ ACTIVE đã bắt đầu và chưa hết hạn; Plus phải có ngày hết hạn. */
    private Optional<UserSubscription> findCurrentPlus(Long userId) {
        Instant now = Instant.now(clock);
        return subscriptionRepository
                .findFirstByUser_IdAndPlan_CodeAndStatusAndStartedAtLessThanEqualAndExpiredAtGreaterThanOrderByStartedAtDescIdDesc(
                        userId, SubscriptionPlanCode.PLUS.name(), SubscriptionStatus.ACTIVE, now, now);
    }

    private SubscriptionEntitlementResponse toResponse(PlanEntitlement entitlement) {
        return new SubscriptionEntitlementResponse(
                entitlement.getCode(),
                entitlement.getValueType(),
                entitlement.getValueAmount(),
                entitlement.getResetPeriod());
    }
}
