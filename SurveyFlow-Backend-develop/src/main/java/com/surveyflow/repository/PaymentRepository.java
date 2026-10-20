package com.surveyflow.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import jakarta.persistence.LockModeType;

import com.surveyflow.model.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Payment> findByProviderPaymentId(String providerPaymentId);

    Optional<Payment> findByTransactionCode(String transactionCode);

    /** Khóa đơn thanh toán để chỉ xác nhận và cộng Credits một lần. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Payment p where p.id = :id")
    Optional<Payment> findByIdForUpdate(Long id);
}
