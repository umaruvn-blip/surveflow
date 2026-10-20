package com.surveyflow.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.surveyflow.model.Badge;

public interface BadgeRepository extends JpaRepository<Badge, Long> {

    List<Badge> findAllByActiveTrueOrderByNameAsc();

    Optional<Badge> findByCode(String code);

    boolean existsByCode(String code);
}
