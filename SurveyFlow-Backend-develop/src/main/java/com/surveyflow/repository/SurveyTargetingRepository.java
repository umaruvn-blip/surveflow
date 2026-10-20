package com.surveyflow.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.surveyflow.model.SurveyTargeting;

public interface SurveyTargetingRepository extends JpaRepository<SurveyTargeting, Long> {

    Optional<SurveyTargeting> findBySurveyId(Long surveyId);

    boolean existsBySurveyId(Long surveyId);
}
