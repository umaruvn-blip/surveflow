package com.surveyflow.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.surveyflow.model.PlanEntitlement;

public interface PlanEntitlementRepository extends JpaRepository<PlanEntitlement, Long> {

    List<PlanEntitlement> findByPlanIdOrderByCodeAsc(Long planId);

    Optional<PlanEntitlement> findByPlanIdAndCode(Long planId, String code);

    /**
     * Lấy quyền lợi của các gói đang được trả về trong bảng giá.
     */
    @Query("""
            SELECT entitlement FROM PlanEntitlement entitlement
            JOIN FETCH entitlement.plan plan
            WHERE plan.id IN :planIds
            ORDER BY entitlement.id ASC
            """)
    List<PlanEntitlement> findByPlanIds(@Param("planIds") Collection<Long> planIds);
}
