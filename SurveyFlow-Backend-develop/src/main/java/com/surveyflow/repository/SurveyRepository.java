package com.surveyflow.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;

import com.surveyflow.common.enums.SurveyStatus;
import com.surveyflow.model.Survey;

import jakarta.persistence.LockModeType;

public interface SurveyRepository extends JpaRepository<Survey, Long>, JpaSpecificationExecutor<Survey> {

    Page<Survey> findByCreatorIdOrderByCreatedAtDesc(Long creatorId, Pageable pageable);

    List<Survey> findByCategoryIdAndStatus(Long categoryId, SurveyStatus status);

    List<Survey> findByStatus(SurveyStatus status);

    long countByStatusIn(java.util.Collection<SurveyStatus> statuses);

    long countByCreatorIdAndStatusIn(Long creatorId, java.util.Collection<SurveyStatus> statuses);

    long countByCreatorId(Long creatorId);

    long countByStatus(SurveyStatus status);

    @Query("SELECT s.category.name, COUNT(s) FROM Survey s WHERE s.category IS NOT NULL GROUP BY s.category.name ORDER BY COUNT(s) DESC")
    List<Object[]> findTopCategories(Pageable pageable);

    @Query("SELECT DISTINCT s FROM Survey s " +
           "LEFT JOIN FETCH s.category " +
           "LEFT JOIN FETCH s.creator " +
           "WHERE s.status = com.surveyflow.common.enums.SurveyStatus.PUBLISHED " +
           "AND (s.deadline IS NULL OR s.deadline > :now) " +
           "AND s.currentResponseCount < s.targetResponseCount " +
           "AND (:userId IS NULL OR s.creator.id != :userId)")
    List<Survey> findAvailableForRecommendation(@Param("userId") Long userId, @Param("now") java.time.Instant now);

    /** Khóa survey để cập nhật trạng thái và capacity an toàn. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from Survey s where s.id = :id")
    Optional<Survey> findByIdForUpdate(@Param("id") Long id);

    @Query("SELECT s.creator.id, COUNT(s.id), COALESCE(SUM(s.currentResponseCount), 0L) FROM Survey s WHERE s.status IN (com.surveyflow.common.enums.SurveyStatus.PUBLISHED, com.surveyflow.common.enums.SurveyStatus.CLOSED) GROUP BY s.creator.id ORDER BY COALESCE(SUM(s.currentResponseCount), 0L) DESC, COUNT(s.id) DESC")
    List<Object[]> findTopCreatorsAllTime(Pageable pageable);

    @Query("SELECT s.creator.id, COUNT(s.id), COALESCE(SUM(s.currentResponseCount), 0L) FROM Survey s WHERE s.status IN (com.surveyflow.common.enums.SurveyStatus.PUBLISHED, com.surveyflow.common.enums.SurveyStatus.CLOSED) AND s.createdAt >= :since GROUP BY s.creator.id ORDER BY COALESCE(SUM(s.currentResponseCount), 0L) DESC, COUNT(s.id) DESC")
    List<Object[]> findTopCreatorsSince(@Param("since") java.time.Instant since, Pageable pageable);
}

