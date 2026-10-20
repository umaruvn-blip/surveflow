package com.surveyflow.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.surveyflow.common.enums.CreditTransactionDirection;
import com.surveyflow.common.enums.CreditTransactionType;
import com.surveyflow.model.CreditTransaction;

public interface CreditTransactionRepository extends JpaRepository<CreditTransaction, Long> {

    List<CreditTransaction> findByWalletIdOrderByCreatedAtDesc(Long walletId);

    List<CreditTransaction> findByReferenceTypeAndReferenceId(String referenceType, Long referenceId);

    @Query("select coalesce(sum(t.amount), 0L) from CreditTransaction t where t.type = :type and t.direction = :direction")
    Long sumAmountByTypeAndDirection(@Param("type") CreditTransactionType type,
                                     @Param("direction") CreditTransactionDirection direction);

    @Query("select coalesce(sum(t.amount), 0L) from CreditTransaction t " +
           "where t.type = :type and t.direction = :direction and " +
           "t.referenceType = 'SURVEY_PARTICIPATION' and " +
           "t.referenceId in (select p.id from SurveyParticipation p where p.survey.creator.id = :creatorId)")
    Long sumAmountByTypeAndDirectionAndCreatorId(@Param("type") CreditTransactionType type,
                                                 @Param("direction") CreditTransactionDirection direction,
                                                 @Param("creatorId") Long creatorId);
}
