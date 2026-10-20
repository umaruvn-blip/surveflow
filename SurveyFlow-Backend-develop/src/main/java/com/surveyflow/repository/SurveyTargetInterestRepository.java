package com.surveyflow.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.surveyflow.model.SurveyTargetInterest;
import com.surveyflow.model.id.SurveyTargetInterestId;

public interface SurveyTargetInterestRepository extends JpaRepository<SurveyTargetInterest, SurveyTargetInterestId> {

    List<SurveyTargetInterest> findBySurveyId(Long surveyId);

    List<SurveyTargetInterest> findByInterestId(Long interestId);

    @Query("SELECT sti FROM SurveyTargetInterest sti " +
           "JOIN FETCH sti.interest " +
           "WHERE sti.survey.id IN :surveyIds")
    List<SurveyTargetInterest> findBySurveyIdInWithInterest(@Param("surveyIds") Collection<Long> surveyIds);

    /** Xóa toàn bộ interest targeting trước khi thay thế cấu hình survey. */
    void deleteBySurveyId(Long surveyId);
}

