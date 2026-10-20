package com.surveyflow.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.surveyflow.model.CreditWallet;

import jakarta.persistence.LockModeType;

public interface CreditWalletRepository extends JpaRepository<CreditWallet, Long> {

    Optional<CreditWallet> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    /** Khóa ví credit của user để cập nhật số dư an toàn. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select w from CreditWallet w where w.user.id = :userId")
    Optional<CreditWallet> findByUserIdForUpdate(@Param("userId") Long userId);
    /**
     * Compatibility method used by the credit exchange flow. The explicit query
     * ensures the row selected by user id is locked before its balances change.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select w from CreditWallet w where w.user.id = :userId")
    Optional<CreditWallet> findWithLockByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(w.balance), 0) FROM CreditWallet w")
    Long sumTotalSpendableBalance();

    @Query("SELECT COALESCE(SUM(w.reservedBalance), 0) FROM CreditWallet w")
    Long sumTotalHeldBalance();
}
