package com.surveyflow.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.surveyflow.model.Interest;

public interface InterestRepository extends JpaRepository<Interest, Long> {

    List<Interest> findAllByActiveTrueOrderByNameAsc();

    Optional<Interest> findByName(String name);

    Optional<Interest> findBySlug(String slug);

    boolean existsByName(String name);

    boolean existsBySlug(String slug);
}
