package com.surveyflow.repository;

import java.util.List;
import java.util.Optional;
import java.time.Instant;
import java.util.Collection;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.surveyflow.common.enums.ParticipationStatus;
import com.surveyflow.model.SurveyParticipation;

import jakarta.persistence.LockModeType;

public interface SurveyParticipationRepository extends JpaRepository<SurveyParticipation, Long> {

    Optional<SurveyParticipation> findFirstBySurveyIdAndUserIdOrderByCreatedAtDesc(Long surveyId, Long userId);

    List<SurveyParticipation> findBySurveyId(Long surveyId);

    List<SurveyParticipation> findByUserIdOrderByCreatedAtDesc(Long userId);

    boolean existsBySurveyIdAndUserId(Long surveyId, Long userId);

    Optional<SurveyParticipation> findByPublicId(String publicId);

    Optional<SurveyParticipation> findByVerificationCodeHash(String verificationCodeHash);

    boolean existsBySurveyIdAndUserIdAndStatusIn(
            Long surveyId, Long userId, Collection<ParticipationStatus> statuses);

    long countByStatusIn(Collection<ParticipationStatus> statuses);

    long countByStatus(ParticipationStatus status);

    long countBySurveyCreatorId(Long creatorId);

    long countBySurveyCreatorIdAndStatusIn(Long creatorId, Collection<ParticipationStatus> statuses);

    long countBySurveyCreatorIdAndStatus(Long creatorId, ParticipationStatus status);

    long countBySurveyIdAndStatus(Long surveyId, ParticipationStatus status);

    long countBySurveyIdAndStatusAndSlotExpiresAtAfter(
            Long surveyId, ParticipationStatus status, Instant now);

    List<SurveyParticipation> findByStatusAndSlotExpiresAtLessThanEqual(
            ParticipationStatus status, Instant now);

    /** Khóa lượt tham gia theo public ID để cập nhật trạng thái an toàn. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from SurveyParticipation p where p.publicId = :publicId")
    Optional<SurveyParticipation> findByPublicIdForUpdate(@Param("publicId") String publicId);

    /** Khóa lượt tham gia theo completion code để chống trả thưởng trùng. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from SurveyParticipation p where p.verificationCodeHash = :codeHash")
    Optional<SurveyParticipation> findByVerificationCodeHashForUpdate(@Param("codeHash") String codeHash);

    Optional<SurveyParticipation> findBySurveyIdAndUserId(Long surveyId, Long userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<SurveyParticipation> findWithLockById(Long id);

    @Query("SELECT p.user.id, COUNT(p.id) FROM SurveyParticipation p WHERE p.status IN ('VERIFIED', 'VALID') GROUP BY p.user.id ORDER BY COUNT(p.id) DESC")
    List<Object[]> findTopRespondentsAllTime(org.springframework.data.domain.Pageable pageable);

    @Query("SELECT p.user.id, COUNT(p.id) FROM SurveyParticipation p WHERE p.status IN ('VERIFIED', 'VALID') AND p.createdAt >= :since GROUP BY p.user.id ORDER BY COUNT(p.id) DESC")
    List<Object[]> findTopRespondentsSince(@Param("since") Instant since, org.springframework.data.domain.Pageable pageable);

    @Query("SELECT COUNT(p.id) FROM SurveyParticipation p WHERE p.user.id = :userId AND p.status IN ('VERIFIED', 'VALID')")
    long countCompletedSurveysByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(p.id) FROM SurveyParticipation p WHERE p.user.id = :userId AND p.status IN ('VERIFIED', 'VALID') AND p.createdAt >= :since")
    long countCompletedSurveysByUserIdSince(@Param("userId") Long userId, @Param("since") Instant since);
}

