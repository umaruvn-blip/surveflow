package com.surveyflow.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.surveyflow.model.UserFeedback;

@Repository
public interface UserFeedbackRepository extends JpaRepository<UserFeedback, Long> {

    @Query("SELECT f FROM UserFeedback f LEFT JOIN FETCH f.user ORDER BY f.createdAt DESC")
    List<UserFeedback> findRecentFeedbacks(Pageable pageable);

    @Query("SELECT AVG(f.rating) FROM UserFeedback f WHERE f.rating IS NOT NULL")
    Double calculateAverageRating();
}
