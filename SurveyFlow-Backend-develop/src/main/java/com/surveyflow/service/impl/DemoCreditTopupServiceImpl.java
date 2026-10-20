package com.surveyflow.service.impl;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.context.annotation.Profile;
import org.springframework.transaction.annotation.Transactional;

import com.surveyflow.common.enums.CreditTransactionDirection;
import com.surveyflow.common.enums.CreditTransactionType;
import com.surveyflow.common.enums.DemoPaymentOutcome;
import com.surveyflow.common.enums.PaymentProvider;
import com.surveyflow.common.enums.PaymentStatus;
import com.surveyflow.common.enums.PaymentType;
import com.surveyflow.dto.response.payment.TopupPaymentResponse;
import com.surveyflow.exception.ConflictException;
import com.surveyflow.exception.InvalidRequestException;
import com.surveyflow.exception.ResourceNotFoundException;
import com.surveyflow.model.CreditTransaction;
import com.surveyflow.model.CreditWallet;
import com.surveyflow.model.Payment;
import com.surveyflow.model.User;
import com.surveyflow.repository.CreditTransactionRepository;
import com.surveyflow.repository.CreditWalletRepository;
import com.surveyflow.repository.PaymentRepository;
import com.surveyflow.repository.UserRepository;
import com.surveyflow.service.DemoCreditTopupService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Profile("(staging | dev) & !prod")
@Service
@RequiredArgsConstructor
@Slf4j(topic = "DEMO-CREDIT-TOPUP-SERVICE")
public class DemoCreditTopupServiceImpl implements DemoCreditTopupService {

    private static final long VND_PER_CREDIT = 100;

    private final PaymentRepository paymentRepository;
    private final CreditWalletRepository walletRepository;
    private final CreditTransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final Clock clock;

    @Override
    @Transactional
    public TopupPaymentResponse create(Long userId, long credits) {
        if (credits < 10) {
            throw new InvalidRequestException("credits must be at least 10");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Payment payment = new Payment();
        payment.setUser(user);
        payment.setType(PaymentType.CREDIT_TOPUP);
        payment.setProvider(PaymentProvider.DEMO);
        payment.setStatus(PaymentStatus.PENDING);
        payment.setAmount(BigDecimal.valueOf(credits).multiply(BigDecimal.valueOf(VND_PER_CREDIT)));
        payment.setCreditAmount(credits);
        payment.setCurrency("VND");
        payment.setTransactionCode("DEMO-" + UUID.randomUUID());
        payment.setDescription("Demo credit top-up");
        payment = paymentRepository.saveAndFlush(payment);

        log.info("Demo top-up created: paymentId={}, userId={}, credits={}, amountVnd={}",
                payment.getId(), userId, credits, payment.getAmount());
        return toResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public TopupPaymentResponse get(Long userId, Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        verifyOwnerAndType(payment, userId);
        return toResponse(payment);
    }

    @Override
    @Transactional
    public TopupPaymentResponse complete(Long userId, Long paymentId, DemoPaymentOutcome outcome) {
        Payment payment = paymentRepository.findByIdForUpdate(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        verifyOwnerAndType(payment, userId);

        PaymentStatus requestedStatus = PaymentStatus.valueOf(outcome.name());

        if (payment.getStatus() == requestedStatus) {
            return toResponse(payment);
        }

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new ConflictException("Payment has already reached a different final status");
        }

        Instant now = clock.instant();

        switch (outcome) {
            case DemoPaymentOutcome.SUCCESS -> {
                creditWallet(payment);
                payment.setPaidAt(now);
            }
            case DemoPaymentOutcome.FAILED -> payment.setFailedAt(now);
            default -> payment.setCancelledAt(now);
        }
        payment.setStatus(requestedStatus);
        paymentRepository.save(payment);

        log.info("Demo top-up completed: paymentId={}, userId={}, outcome={}", paymentId, userId, outcome);
        return toResponse(payment);
    }

    /**
     * Khóa ví và ghi sổ trong cùng transaction với chuyển trạng thái payment.
     */
    private void creditWallet(Payment payment) {
        CreditWallet wallet = walletRepository.findWithLockByUserId(payment.getUser().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Credit wallet not found"));
        long before = wallet.getBalance();
        long credits = payment.getCreditAmount();
        long after = Math.addExact(before, credits);
        wallet.setBalance(after);
        walletRepository.save(wallet);

        CreditTransaction transaction = new CreditTransaction();
        transaction.setWallet(wallet);
        transaction.setType(CreditTransactionType.CREDIT_TOPUP);
        transaction.setDirection(CreditTransactionDirection.CREDIT);
        transaction.setAmount(credits);
        transaction.setBalanceBefore(before);
        transaction.setBalanceAfter(after);
        transaction.setReferenceType("PAYMENT");
        transaction.setReferenceId(payment.getId());
        transaction.setPaymentId(payment.getId());
        transaction.setDescription("Nạp Credits qua thanh toán giả lập");
        transactionRepository.save(transaction);
        log.info("Demo top-up credited: paymentId={}, walletId={}, credits={}, balanceBefore={}, balanceAfter={}",
                payment.getId(), wallet.getId(), credits, before, after);
    }

    private void verifyOwnerAndType(Payment payment, Long userId) {
        if (!payment.getUser().getId().equals(userId)
                || payment.getProvider() != PaymentProvider.DEMO
                || payment.getType() != PaymentType.CREDIT_TOPUP) {
            throw new ResourceNotFoundException("Payment not found");
        }
    }

    private TopupPaymentResponse toResponse(Payment payment) {
        return new TopupPaymentResponse(payment.getId(), payment.getCreditAmount(), payment.getAmount(),
                payment.getStatus(), payment.getCreatedAt(), payment.getPaidAt());
    }
}
