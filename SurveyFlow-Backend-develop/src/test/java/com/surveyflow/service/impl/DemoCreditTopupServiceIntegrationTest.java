package com.surveyflow.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.surveyflow.common.enums.DemoPaymentOutcome;
import com.surveyflow.common.enums.PaymentStatus;
import com.surveyflow.exception.ConflictException;
import com.surveyflow.exception.InvalidRequestException;
import com.surveyflow.exception.ResourceNotFoundException;
import com.surveyflow.model.CreditWallet;
import com.surveyflow.model.User;
import com.surveyflow.repository.CreditTransactionRepository;
import com.surveyflow.repository.CreditWalletRepository;
import com.surveyflow.repository.PaymentRepository;
import com.surveyflow.repository.UserRepository;
import com.surveyflow.service.DemoCreditTopupService;

@SpringBootTest
@ActiveProfiles({"staging", "test"})
@Transactional
class DemoCreditTopupServiceIntegrationTest {

    @Autowired private DemoCreditTopupService service;
    @Autowired private UserRepository userRepository;
    @Autowired private CreditWalletRepository walletRepository;
    @Autowired private CreditTransactionRepository transactionRepository;
    @Autowired private PaymentRepository paymentRepository;

    @Test
    void successfulDemoPaymentCreditsWalletExactlyOnce() {
        User user = createUser();
        var created = service.create(user.getId(), 100);

        assertThat(created.amountVnd()).isEqualByComparingTo("10000");
        assertThat(created.status()).isEqualTo(PaymentStatus.PENDING);

        var completed = service.complete(user.getId(), created.id(), DemoPaymentOutcome.SUCCESS);
        var repeated = service.complete(user.getId(), created.id(), DemoPaymentOutcome.SUCCESS);

        assertThat(completed.status()).isEqualTo(PaymentStatus.SUCCESS);
        assertThat(repeated.status()).isEqualTo(PaymentStatus.SUCCESS);
        assertThat(walletRepository.findByUserId(user.getId()).orElseThrow().getBalance()).isEqualTo(100);
        assertThat(transactionRepository.findByReferenceTypeAndReferenceId("PAYMENT", created.id()))
                .hasSize(1)
                .first()
                .satisfies(transaction -> {
                    assertThat(transaction.getPaymentId()).isEqualTo(created.id());
                    assertThat(transaction.getAmount()).isEqualTo(100);
                });
        assertThat(paymentRepository.findById(created.id()).orElseThrow().getPaidAt()).isNotNull();
    }

    @Test
    void failedPaymentNeverCreditsWalletAndCannotBecomeSuccess() {
        User user = createUser();
        var created = service.create(user.getId(), 20);

        service.complete(user.getId(), created.id(), DemoPaymentOutcome.FAILED);

        assertThatThrownBy(() -> service.complete(user.getId(), created.id(), DemoPaymentOutcome.SUCCESS))
                .isInstanceOf(ConflictException.class);
        assertThat(walletRepository.findByUserId(user.getId()).orElseThrow().getBalance()).isZero();
        assertThat(transactionRepository.findByReferenceTypeAndReferenceId("PAYMENT", created.id())).isEmpty();
    }

    @Test
    void rejectsInvalidAmountAndOtherUsersPayment() {
        User owner = createUser();
        User other = createUser();
        assertThatThrownBy(() -> service.create(owner.getId(), 9)).isInstanceOf(InvalidRequestException.class);

        var created = service.create(owner.getId(), 11);
        assertThat(created.amountVnd()).isEqualByComparingTo("1100");
        assertThat(service.create(owner.getId(), 100_001).amountVnd()).isEqualByComparingTo("10000100");
        assertThat(service.create(owner.getId(), 100_000_000).amountVnd()).isEqualByComparingTo("10000000000");
        assertThatThrownBy(() -> service.get(other.getId(), created.id()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    private User createUser() {
        User user = new User();
        user.setEmail("topup-" + UUID.randomUUID() + "@example.test");
        user.setPasswordHash("not-used-in-test");
        user = userRepository.saveAndFlush(user);

        CreditWallet wallet = new CreditWallet();
        wallet.setUser(user);
        walletRepository.saveAndFlush(wallet);
        return user;
    }
}
