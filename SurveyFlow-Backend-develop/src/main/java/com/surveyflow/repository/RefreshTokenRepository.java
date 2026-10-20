package com.surveyflow.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

import com.surveyflow.model.RefreshToken;
import com.surveyflow.common.enums.RefreshTokenRevocationReason;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    /** Khóa refresh token và tải user để xoay vòng token an toàn. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select token from RefreshToken token join fetch token.user where token.tokenHash = :tokenHash")
    Optional<RefreshToken> findByTokenHashForUpdate(@Param("tokenHash") String tokenHash);

    /** Thu hồi toàn bộ refresh token còn hiệu lực của user. */
    @Modifying
    @Query("""
            update RefreshToken token
               set token.revokedAt = :revokedAt,
                   token.revocationReason = :reason
             where token.user.id = :userId
               and token.revokedAt is null
            """)
    int revokeAllActiveByUserId(@Param("userId") Long userId,
                                @Param("revokedAt") java.time.Instant revokedAt,
                                @Param("reason") RefreshTokenRevocationReason reason);
}
