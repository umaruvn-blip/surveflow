package com.surveyflow.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.surveyflow.model.UserBadge;

public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {

    Optional<UserBadge> findByUserIdAndBadgeId(Long userId, Long badgeId);

    List<UserBadge> findByUserIdOrderByEarnedAtDesc(Long userId);

    boolean existsByUserIdAndBadgeId(Long userId, Long badgeId);
}
