package com.surveyflow.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.surveyflow.model.SurveyTag;

public interface SurveyTagRepository extends JpaRepository<SurveyTag, Long> {

    List<SurveyTag> findAllByOrderByNameAsc();

    Optional<SurveyTag> findByName(String name);

    Optional<SurveyTag> findBySlug(String slug);

    boolean existsByName(String name);

    boolean existsBySlug(String slug);
}
