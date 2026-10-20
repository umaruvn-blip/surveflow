package com.surveyflow.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.surveyflow.model.SurveyCategory;

public interface SurveyCategoryRepository extends JpaRepository<SurveyCategory, Long> {

    List<SurveyCategory> findAllByActiveTrueOrderByNameAsc();

    Optional<SurveyCategory> findByName(String name);

    Optional<SurveyCategory> findBySlug(String slug);

    boolean existsByName(String name);

    boolean existsBySlug(String slug);
}
