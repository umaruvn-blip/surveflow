package com.surveyflow.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.surveyflow.model.UserInterest;
import com.surveyflow.model.id.UserInterestId;

public interface UserInterestRepository extends JpaRepository<UserInterest, UserInterestId> {

    List<UserInterest> findByUserId(Long userId);

    List<UserInterest> findByInterestId(Long interestId);

    /** Nạp sở thích cùng danh mục để tạo response mà không phát sinh truy vấn từng dòng. */
    @Query("select userInterest from UserInterest userInterest join fetch userInterest.interest where userInterest.user.id = :userId")
    List<UserInterest> findByUserIdWithInterest(Long userId);
}
