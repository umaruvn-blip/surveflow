package com.surveyflow.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

import com.surveyflow.common.enums.PaymentProvider;
import com.surveyflow.common.enums.PaymentStatus;
import com.surveyflow.model.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Payment> findByUserIdAndProviderOrderByCreatedAtDesc(Long userId, PaymentProvider provider);

    Optional<Payment> findByProviderPaymentId(String providerPaymentId);

    Optional<Payment> findByTransactionCode(String transactionCode);

    List<Payment> findByStatusOrderByCreatedAtDesc(PaymentStatus status);

    List<Payment> findByProviderAndStatusOrderByCreatedAtDesc(PaymentProvider provider, PaymentStatus status);

    @Query("SELECT p FROM Payment p WHERE (:status IS NULL OR p.status = :status) ORDER BY p.createdAt DESC")
    List<Payment> findAllWithFilter(@Param("status") PaymentStatus status);

    /** Khóa đơn thanh toán để chỉ xác nhận và cộng Credits một lần. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Payment p where p.id = :id")
    Optional<Payment> findByIdForUpdate(Long id);
}
