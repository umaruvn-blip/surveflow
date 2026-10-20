package com.surveyflow.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.surveyflow.model.Level;

public interface LevelRepository extends JpaRepository<Level, Long> {

    List<Level> findAllByOrderByLevelNumberAsc();

    Optional<Level> findByLevelNumber(Integer levelNumber);

    boolean existsByLevelNumber(Integer levelNumber);
}
