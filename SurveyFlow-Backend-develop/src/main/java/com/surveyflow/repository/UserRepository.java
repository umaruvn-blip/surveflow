package com.surveyflow.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import jakarta.persistence.LockModeType;

import com.surveyflow.model.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByReferralCodeIgnoreCase(String referralCode);

    boolean existsByEmail(String email);

    boolean existsByEmailIgnoreCase(String email);

    /** Khóa user để tuần tự hóa các lần cập nhật hồ sơ và sở thích. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select user from User user where user.id = :id")
    Optional<User> findByIdForUpdate(Long id);

    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :after")
    long countCreatedAfter(java.time.Instant after);
}
