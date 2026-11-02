package com.surveyflow.repository;

import java.time.Instant;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.surveyflow.model.SubscriptionPrice;

public interface SubscriptionPriceRepository extends JpaRepository<SubscriptionPrice, Long> {

    /** Lấy giá hiệu lực mới nhất cho từng chu kỳ của các gói đang bán. */
    @Query("""
            SELECT price FROM SubscriptionPrice price
            JOIN FETCH price.plan plan
            WHERE plan.active = TRUE AND price.active = TRUE
              AND price.validFrom <= :at
              AND (price.validUntil IS NULL OR price.validUntil > :at)
              AND NOT EXISTS (
                  SELECT newer.id FROM SubscriptionPrice newer
                  WHERE newer.plan = price.plan
                    AND newer.billingPeriod = price.billingPeriod
                    AND newer.active = TRUE
                    AND newer.validFrom <= :at
                    AND (newer.validUntil IS NULL OR newer.validUntil > :at)
                    AND newer.validFrom > price.validFrom
              )
            ORDER BY plan.name ASC, price.billingPeriod ASC
            """)
    List<SubscriptionPrice> findCurrentActivePrices(@Param("at") Instant at);

    Optional<SubscriptionPrice> findFirstByPlan_CodeAndActiveTrueOrderByValidFromDesc(String code);

    Optional<SubscriptionPrice> findFirstByPlan_IdAndActiveTrueOrderByValidFromDesc(Long planId);
}
