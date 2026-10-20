package com.surveyflow.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.surveyflow.model.SurveyTagMapping;
import com.surveyflow.model.id.SurveyTagMappingId;

public interface SurveyTagMappingRepository extends JpaRepository<SurveyTagMapping, SurveyTagMappingId> {

    List<SurveyTagMapping> findBySurveyId(Long surveyId);

    List<SurveyTagMapping> findByTagId(Long tagId);
}
