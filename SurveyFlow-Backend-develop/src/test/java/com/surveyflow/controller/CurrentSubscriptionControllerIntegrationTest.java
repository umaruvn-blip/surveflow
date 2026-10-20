package com.surveyflow.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.surveyflow.common.enums.EntitlementResetPeriod;
import com.surveyflow.common.enums.EntitlementValueType;
import com.surveyflow.common.enums.PlusEntitlementCode;
import com.surveyflow.common.enums.SubscriptionPlanCode;
import com.surveyflow.common.enums.SubscriptionStatus;
import com.surveyflow.model.PlanEntitlement;
import com.surveyflow.model.SubscriptionPlan;
import com.surveyflow.model.User;
import com.surveyflow.model.UserSubscription;
import com.surveyflow.repository.PlanEntitlementRepository;
import com.surveyflow.repository.SubscriptionPlanRepository;
import com.surveyflow.repository.UserRepository;
import com.surveyflow.repository.UserSubscriptionRepository;
import com.surveyflow.security.service.JwtService;
import com.surveyflow.service.SubscriptionAccessService;

@SpringBootTest(properties = {
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class CurrentSubscriptionControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JwtService jwtService;
    @Autowired private Clock clock;
    @Autowired private UserRepository userRepository;
    @Autowired private SubscriptionPlanRepository planRepository;
    @Autowired private PlanEntitlementRepository entitlementRepository;
    @Autowired private UserSubscriptionRepository subscriptionRepository;
    @Autowired private SubscriptionAccessService accessService;

    @Test
    void returnsInactiveWhenUserHasNoEffectivePlus() throws Exception {
        User user = createUser();
        Instant now = Instant.now(clock);
        saveSubscription(user, "PLUS", SubscriptionStatus.ACTIVE,
                now.minus(10, ChronoUnit.DAYS), now.minus(1, ChronoUnit.SECONDS));
        saveSubscription(user, "PLUS", SubscriptionStatus.ACTIVE,
                now.plus(1, ChronoUnit.DAYS), now.plus(31, ChronoUnit.DAYS));
        saveSubscription(user, "PLUS", SubscriptionStatus.CANCELLED,
                now.minus(1, ChronoUnit.DAYS), now.plus(29, ChronoUnit.DAYS));
        saveSubscription(user, "FREE", SubscriptionStatus.ACTIVE,
                now.minus(1, ChronoUnit.DAYS), now.plus(29, ChronoUnit.DAYS));
        saveSubscription(user, "PLUS", SubscriptionStatus.ACTIVE,
                now.minus(1, ChronoUnit.DAYS), null);

        assertThat(accessService.hasActivePlus(user.getId())).isFalse();
        assertThat(accessService.hasEntitlement(user.getId(), PlusEntitlementCode.AI_QUALITY_CHECK)).isFalse();
        assertThat(accessService.getEntitlement(user.getId(), PlusEntitlementCode.PRIORITY_BOOST)).isEmpty();

        mockMvc.perform(get("/api/v1/users/me/subscription")
                        .header("Authorization", bearer(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.active").value(false))
                .andExpect(jsonPath("$.data.subscriptionId").isEmpty())
                .andExpect(jsonPath("$.data.entitlements").isEmpty());
    }

    @Test
    void returnsCurrentPlusAndItsEntitlements() throws Exception {
        User user = createUser();
        Instant now = Instant.now(clock);
        UserSubscription subscription = saveSubscription(user, "PLUS", SubscriptionStatus.ACTIVE,
                now.minus(1, ChronoUnit.DAYS), now.plus(29, ChronoUnit.DAYS));
        subscription.getPlan().setActive(false);
        planRepository.saveAndFlush(subscription.getPlan());
        saveEntitlement(subscription.getPlan(), PlusEntitlementCode.AI_QUALITY_CHECK,
                EntitlementValueType.UNLIMITED, null, EntitlementResetPeriod.NONE);
        saveEntitlement(subscription.getPlan(), PlusEntitlementCode.MONTHLY_CREDITS,
                EntitlementValueType.QUOTA, 500L, EntitlementResetPeriod.MONTH);
        saveEntitlement(subscription.getPlan(), PlusEntitlementCode.PRIORITY_BOOST,
                EntitlementValueType.QUOTA, 2L, EntitlementResetPeriod.MONTH);

        assertThat(accessService.hasActivePlus(user.getId())).isTrue();
        assertThat(accessService.hasEntitlement(user.getId(), PlusEntitlementCode.AI_QUALITY_CHECK)).isTrue();
        assertThat(accessService.hasEntitlement(user.getId(), PlusEntitlementCode.AI_INSIGHT_EXPORT)).isFalse();
        assertThat(accessService.getEntitlement(user.getId(), PlusEntitlementCode.PRIORITY_BOOST))
                .get()
                .satisfies(entitlement -> {
                    assertThat(entitlement.valueAmount()).isEqualTo(2L);
                    assertThat(entitlement.resetPeriod().name()).isEqualTo("MONTH");
                });

        mockMvc.perform(get("/api/v1/users/me/subscription")
                        .header("Authorization", bearer(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.active").value(true))
                .andExpect(jsonPath("$.data.subscriptionId").value(subscription.getId()))
                .andExpect(jsonPath("$.data.planCode").value(SubscriptionPlanCode.PLUS.name()))
                .andExpect(jsonPath("$.data.entitlements.length()").value(3))
                .andExpect(jsonPath("$.data.entitlements[1].code").value("MONTHLY_CREDITS"))
                .andExpect(jsonPath("$.data.entitlements[1].valueAmount").value(500));
    }

    @Test
    void requiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/v1/users/me/subscription"))
                .andExpect(status().isUnauthorized());
    }

    private User createUser() {
        User user = new User();
        user.setEmail("subscription-" + UUID.randomUUID() + "@example.test");
        return userRepository.saveAndFlush(user);
    }

    private UserSubscription saveSubscription(User user, String planCode, SubscriptionStatus status,
                                              Instant startedAt, Instant expiredAt) {
        SubscriptionPlan plan = planRepository.findByCode(planCode).orElseGet(() -> {
            SubscriptionPlan created = new SubscriptionPlan();
            created.setCode(planCode);
            created.setName(planCode);
            created.setPrice(BigDecimal.ZERO);
            return planRepository.saveAndFlush(created);
        });
        UserSubscription subscription = new UserSubscription();
        subscription.setUser(user);
        subscription.setPlan(plan);
        subscription.setStatus(status);
        subscription.setStartedAt(startedAt);
        subscription.setExpiredAt(expiredAt);
        return subscriptionRepository.saveAndFlush(subscription);
    }

    private void saveEntitlement(SubscriptionPlan plan, PlusEntitlementCode code,
                                 EntitlementValueType valueType, Long valueAmount,
                                 EntitlementResetPeriod resetPeriod) {
        PlanEntitlement entitlement = new PlanEntitlement();
        entitlement.setPlan(plan);
        entitlement.setCode(code.name());
        entitlement.setValueType(valueType);
        entitlement.setValueAmount(valueAmount);
        entitlement.setResetPeriod(resetPeriod);
        entitlementRepository.saveAndFlush(entitlement);
    }

    private String bearer(User user) {
        return "Bearer " + jwtService.generateAccessToken(user.getEmail(), Map.of());
    }
}
