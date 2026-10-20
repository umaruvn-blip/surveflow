package com.surveyflow.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.Clock;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.surveyflow.common.enums.EntitlementResetPeriod;
import com.surveyflow.common.enums.EntitlementValueType;
import com.surveyflow.common.enums.RewardType;
import com.surveyflow.common.enums.RewardUnit;
import com.surveyflow.common.enums.SubscriptionBillingPeriod;
import com.surveyflow.model.CreditPackage;
import com.surveyflow.model.PlanEntitlement;
import com.surveyflow.model.RewardCatalogItem;
import com.surveyflow.model.SubscriptionPlan;
import com.surveyflow.model.SubscriptionPrice;
import com.surveyflow.repository.CreditPackageRepository;
import com.surveyflow.repository.PlanEntitlementRepository;
import com.surveyflow.repository.RewardCatalogRepository;
import com.surveyflow.repository.SubscriptionPlanRepository;
import com.surveyflow.repository.SubscriptionPriceRepository;

@SpringBootTest(properties = {
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class PricingCatalogControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private Clock clock;
    @Autowired private CreditPackageRepository packageRepository;
    @Autowired private SubscriptionPlanRepository planRepository;
    @Autowired private SubscriptionPriceRepository priceRepository;
    @Autowired private PlanEntitlementRepository entitlementRepository;
    @Autowired private RewardCatalogRepository rewardRepository;

    @Test
    void publicCreditPackagesExcludeInactiveRows() throws Exception {
        packageRepository.saveAndFlush(creditPackage("STARTER", 200L, 19000, 1, true));
        packageRepository.saveAndFlush(creditPackage("HIDDEN", 100L, 10000, 2, false));

        mockMvc.perform(get("/api/v1/pricing/credit-packages"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].code").value("STARTER"))
                .andExpect(jsonPath("$.data[0].creditAmount").value(200))
                .andExpect(jsonPath("$.data[0].price").value(19000));
    }

    @Test
    void publicSubscriptionPlansReturnCurrentPriceAndBenefits() throws Exception {
        SubscriptionPlan plus = subscriptionPlan("PLUS", true);
        planRepository.saveAndFlush(plus);
        SubscriptionPlan legacy = subscriptionPlan("STUDENT", false);
        planRepository.saveAndFlush(legacy);

        priceRepository.saveAndFlush(subscriptionPrice(plus, 39000, -1, true));
        priceRepository.saveAndFlush(subscriptionPrice(plus, 49000, -2, true));
        priceRepository.saveAndFlush(subscriptionPrice(plus, 59000, 1, true));
        priceRepository.saveAndFlush(subscriptionPrice(legacy, 39000, -1, true));

        PlanEntitlement benefit = new PlanEntitlement();
        benefit.setPlan(plus);
        benefit.setCode("MONTHLY_CREDITS");
        benefit.setValueType(EntitlementValueType.QUOTA);
        benefit.setValueAmount(500L);
        benefit.setResetPeriod(EntitlementResetPeriod.MONTH);
        entitlementRepository.saveAndFlush(benefit);

        mockMvc.perform(get("/api/v1/pricing/subscription-plans"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].code").value("PLUS"))
                .andExpect(jsonPath("$.data[0].prices.length()").value(1))
                .andExpect(jsonPath("$.data[0].prices[0].price").value(39000))
                .andExpect(jsonPath("$.data[0].entitlements[0].code").value("MONTHLY_CREDITS"))
                .andExpect(jsonPath("$.data[0].entitlements[0].valueAmount").value(500));
    }

    @Test
    void publicRewardsExcludeInactiveGift() throws Exception {
        rewardRepository.saveAndFlush(reward("VOUCHER_10000", true, 1));
        rewardRepository.saveAndFlush(reward("GIFT_10000", false, 2));

        mockMvc.perform(get("/api/v1/pricing/rewards"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].code").value("VOUCHER_10000"))
                .andExpect(jsonPath("$.data[0].creditCost").value(1000));
    }

    private CreditPackage creditPackage(String code, long credits, long price, int order, boolean active) {
        CreditPackage item = new CreditPackage();
        item.setCode(code);
        item.setName(code);
        item.setCreditAmount(credits);
        item.setPrice(BigDecimal.valueOf(price));
        item.setDisplayOrder(order);
        item.setActive(active);
        return item;
    }

    private SubscriptionPlan subscriptionPlan(String code, boolean active) {
        SubscriptionPlan plan = new SubscriptionPlan();
        plan.setCode(code);
        plan.setName(code);
        plan.setActive(active);
        return plan;
    }

    private SubscriptionPrice subscriptionPrice(SubscriptionPlan plan, long price, long dayOffset, boolean active) {
        SubscriptionPrice item = new SubscriptionPrice();
        item.setPlan(plan);
        item.setBillingPeriod(SubscriptionBillingPeriod.MONTH);
        item.setPrice(BigDecimal.valueOf(price));
        item.setValidFrom(clock.instant().plusSeconds(dayOffset * 86400));
        item.setActive(active);
        return item;
    }

    private RewardCatalogItem reward(String code, boolean active, int order) {
        RewardCatalogItem item = new RewardCatalogItem();
        item.setCode(code);
        item.setName(code);
        item.setRewardType(RewardType.VOUCHER);
        item.setCreditCost(1000L);
        item.setRewardAmount(10000L);
        item.setRewardUnit(RewardUnit.VND);
        item.setActive(active);
        item.setDisplayOrder(order);
        return item;
    }
}
