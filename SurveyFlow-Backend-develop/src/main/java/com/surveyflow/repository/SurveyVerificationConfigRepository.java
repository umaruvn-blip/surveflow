package com.surveyflow.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.surveyflow.model.SurveyVerificationConfig;

public interface SurveyVerificationConfigRepository extends JpaRepository<SurveyVerificationConfig, Long> {

    Optional<SurveyVerificationConfig> findBySurveyIdAndVersion(Long surveyId, Integer version);

    List<SurveyVerificationConfig> findBySurveyIdOrderByVersionDesc(Long surveyId);

    Optional<SurveyVerificationConfig> findFirstBySurveyIdOrderByVersionDesc(Long surveyId);

    /** Lấy các cấu hình verification đang có hiệu lực tại thời điểm chỉ định. */
    @Query("""
            select c from SurveyVerificationConfig c
            where c.survey.id = :surveyId
              and c.validFrom <= :now
              and (c.validUntil is null or c.validUntil > :now)
            order by c.version desc
            """)
    List<SurveyVerificationConfig> findActive(
            @Param("surveyId") Long surveyId, @Param("now") Instant now);
}