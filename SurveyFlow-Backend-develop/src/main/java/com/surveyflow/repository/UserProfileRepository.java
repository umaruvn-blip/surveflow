package com.surveyflow.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.surveyflow.model.UserProfile;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {

    Optional<UserProfile> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    @Query("SELECT p.school, COUNT(p) FROM UserProfile p WHERE p.school IS NOT NULL AND TRIM(p.school) <> '' GROUP BY p.school ORDER BY COUNT(p) DESC")
    List<Object[]> findTopUniversities(Pageable pageable);

    @Query("SELECT p.occupation, COUNT(p) FROM UserProfile p WHERE p.occupation IS NOT NULL AND TRIM(p.occupation) <> '' GROUP BY p.occupation ORDER BY COUNT(p) DESC")
    List<Object[]> findTopOccupations(Pageable pageable);

    @Query("SELECT COUNT(p) FROM UserProfile p WHERE p.school IS NOT NULL AND TRIM(p.school) <> ''")
    long countStudents();

    @Query("SELECT COUNT(p) FROM UserProfile p WHERE p.occupation IS NOT NULL AND TRIM(p.occupation) <> ''")
    long countWorkers();
}
