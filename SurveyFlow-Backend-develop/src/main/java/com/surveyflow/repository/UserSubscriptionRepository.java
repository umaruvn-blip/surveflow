package com.surveyflow.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.surveyflow.common.enums.SubscriptionStatus;
import com.surveyflow.model.UserSubscription;

public interface UserSubscriptionRepository extends JpaRepository<UserSubscription, Long> {

    List<UserSubscription> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<UserSubscription> findByUserIdAndStatus(Long userId, SubscriptionStatus status);

    Optional<UserSubscription> findFirstByUser_IdAndPlan_CodeAndStatusAndStartedAtLessThanEqualAndExpiredAtGreaterThanOrderByStartedAtDescIdDesc(
            Long userId,
            String planCode,
            SubscriptionStatus status,
            Instant startedAtLimit,
            Instant expiredAtLimit);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT s.user.id) FROM UserSubscription s WHERE s.plan.code != 'FREE'")
    long countDistinctSubscribedUsers();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT s.user.id) FROM UserSubscription s WHERE s.plan.code != 'FREE' AND s.status = :status AND (s.expiredAt IS NULL OR s.expiredAt > :now)")
    long countDistinctActiveSubscribers(@org.springframework.data.repository.query.Param("status") SubscriptionStatus status, @org.springframework.data.repository.query.Param("now") Instant now);

    @org.springframework.data.jpa.repository.Query("SELECT s.status, COUNT(s) FROM UserSubscription s WHERE s.plan.code != 'FREE' GROUP BY s.status")
    List<Object[]> countGroupByStatus();

    @org.springframework.data.jpa.repository.Query("SELECT s.plan.code, s.plan.name, COUNT(s), SUM(CASE WHEN s.status = 'ACTIVE' AND (s.expiredAt IS NULL OR s.expiredAt > :now) THEN 1L ELSE 0L END) FROM UserSubscription s WHERE s.plan.code != 'FREE' GROUP BY s.plan.code, s.plan.name ORDER BY COUNT(s) DESC")
    List<Object[]> countGroupByPlan(@org.springframework.data.repository.query.Param("now") Instant now);
}
