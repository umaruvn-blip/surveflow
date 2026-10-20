package com.surveyflow.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Instant;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.surveyflow.common.enums.CreditTransactionType;
import com.surveyflow.common.enums.CreditTransactionDirection;
import com.surveyflow.common.enums.ParticipationStatus;
import com.surveyflow.common.enums.SurveyProvider;
import com.surveyflow.common.enums.SurveyVerificationMethod;
import com.surveyflow.dto.request.auth.RegisterRequest;
import com.surveyflow.exception.BusinessException;
import com.surveyflow.exception.ResourceNotFoundException;
import com.surveyflow.model.CreditWallet;
import com.surveyflow.model.Survey;
import com.surveyflow.model.SurveyParticipation;
import com.surveyflow.model.SurveyVerificationConfig;
import com.surveyflow.model.User;
import com.surveyflow.repository.CreditTransactionRepository;
import com.surveyflow.repository.CreditWalletRepository;
import com.surveyflow.repository.SurveyParticipationRepository;
import com.surveyflow.repository.SurveyRepository;
import com.surveyflow.repository.SurveyVerificationConfigRepository;
import com.surveyflow.repository.UserRepository;
import com.surveyflow.service.CreditWalletBalanceService;
import com.surveyflow.service.AuthService;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CreditWalletBalanceServiceIntegrationTest {

    @Autowired private CreditWalletBalanceService service;
    @Autowired private AuthService authService;
    @Autowired private UserRepository userRepository;
    @Autowired private CreditWalletRepository walletRepository;
    @Autowired private CreditTransactionRepository transactionRepository;
    @Autowired private SurveyRepository surveyRepository;
    @Autowired private SurveyVerificationConfigRepository verificationConfigRepository;
    @Autowired private SurveyParticipationRepository participationRepository;

    @Test
    void localRegistrationCreatesWalletAndGrantsWelcomeCredit() {
        var result = authService.register(new RegisterRequest(
                "wallet-signup-" + UUID.randomUUID() + "@example.test", "strong-password", null, null));
        Long userId = result.response().user().id();

        assertThat(walletRepository.findByUserId(userId).orElseThrow().getBalance()).isEqualTo(200L);
        assertThat(transactionRepository.findByReferenceTypeAndReferenceId("USER_REGISTRATION", userId))
                .singleElement()
                .satisfies(transaction -> {
                    assertThat(transaction.getType()).isEqualTo(CreditTransactionType.REGISTRATION_BONUS);
                    assertThat(transaction.getAmount()).isEqualTo(200L);
                });
    }

    @Test
    void registrationGrantsBonusToExistingWalletOnlyOnce() {
        User user = createUser();
        CreditWallet wallet = new CreditWallet();
        wallet.setUser(user);
        walletRepository.saveAndFlush(wallet);

        var first = service.initializeForRegistration(user.getId());
        var repeated = service.initializeForRegistration(user.getId());

        assertThat(first.balance()).isEqualTo(200L);
        assertThat(repeated.walletId()).isEqualTo(first.walletId());
        assertThat(repeated.balance()).isEqualTo(200L);
        assertThat(walletRepository.findByUserId(user.getId()).orElseThrow().getBalance()).isEqualTo(200L);
        assertThat(transactionRepository.findByReferenceTypeAndReferenceId("USER_REGISTRATION", user.getId()))
                .singleElement()
                .satisfies(transaction -> {
                    assertThat(transaction.getType()).isEqualTo(CreditTransactionType.REGISTRATION_BONUS);
                    assertThat(transaction.getAmount()).isEqualTo(200L);
                    assertThat(transaction.getBalanceBefore()).isZero();
                    assertThat(transaction.getBalanceAfter()).isEqualTo(200L);
                });
    }

    @Test
    void registrationRequiresAnExistingWallet() {
        User user = createUser();

        assertThatThrownBy(() -> service.initializeForRegistration(user.getId()))
                .isInstanceOf(ResourceNotFoundException.class);
        assertThat(walletRepository.findByUserId(user.getId())).isEmpty();
        assertThat(transactionRepository.findByReferenceTypeAndReferenceId("USER_REGISTRATION", user.getId()))
                .isEmpty();
    }

    @Test
    void registrationPreservesAnExistingWalletBalanceAndReservation() {
        User user = createUser();
        CreditWallet wallet = new CreditWallet();
        wallet.setUser(user);
        wallet.setBalance(25L);
        wallet.setReservedBalance(7L);
        walletRepository.saveAndFlush(wallet);

        var response = service.initializeForRegistration(user.getId());

        assertThat(response.balance()).isEqualTo(225L);
        assertThat(response.reservedBalance()).isEqualTo(7L);
        assertThat(transactionRepository.findByReferenceTypeAndReferenceId("USER_REGISTRATION", user.getId()))
                .singleElement()
                .satisfies(transaction -> {
                    assertThat(transaction.getBalanceBefore()).isEqualTo(25L);
                    assertThat(transaction.getBalanceAfter()).isEqualTo(225L);
                });
    }

    @Test
    void verifiedSurveyCompletionGrantsTenCreditsOnlyOnce() {
        User user = createUser();
        CreditWallet wallet = new CreditWallet();
        wallet.setUser(user);
        walletRepository.saveAndFlush(wallet);
        SurveyParticipation participation = createParticipation(user, ParticipationStatus.VERIFIED);

        var first = service.rewardSurveyCompletion(user.getId(), participation.getId());
        var repeated = service.rewardSurveyCompletion(user.getId(), participation.getId());

        assertThat(first.balance()).isEqualTo(10L);
        assertThat(repeated.balance()).isEqualTo(10L);
        assertThat(transactionRepository.findByReferenceTypeAndReferenceId(
                "SURVEY_PARTICIPATION", participation.getId()))
                .singleElement()
                .satisfies(transaction -> {
                    assertThat(transaction.getType()).isEqualTo(CreditTransactionType.SURVEY_COMPLETION);
                    assertThat(transaction.getAmount()).isEqualTo(10L);
                    assertThat(transaction.getBalanceBefore()).isZero();
                    assertThat(transaction.getBalanceAfter()).isEqualTo(10L);
                });
    }

    @Test
    void unfinishedParticipationCannotReceiveCredits() {
        User user = createUser();
        SurveyParticipation participation = createParticipation(user, ParticipationStatus.RESERVED);

        assertThatThrownBy(() -> service.rewardSurveyCompletion(user.getId(), participation.getId()))
                .isInstanceOf(BusinessException.class);
        assertThat(walletRepository.findByUserId(user.getId())).isEmpty();
        assertThat(transactionRepository.findByReferenceTypeAndReferenceId(
                "SURVEY_PARTICIPATION", participation.getId())).isEmpty();
    }

    @Test
    void qualifiedReferralRewardsInviterOnceAndRejectsAnotherInviter() {
        User referrer = createUser();
        User anotherReferrer = createUser();
        User referred = createUser();
        referred.setReferredBy(referrer);
        userRepository.saveAndFlush(referred);
        CreditWallet wallet = new CreditWallet();
        wallet.setUser(referrer);
        walletRepository.saveAndFlush(wallet);
        CreditWallet anotherWallet = new CreditWallet();
        anotherWallet.setUser(anotherReferrer);
        walletRepository.saveAndFlush(anotherWallet);

        var first = service.rewardQualifiedReferral(referrer.getId(), referred.getId());
        var repeated = service.rewardQualifiedReferral(referrer.getId(), referred.getId());

        assertThat(first.balance()).isEqualTo(50L);
        assertThat(repeated.balance()).isEqualTo(50L);
        assertThatThrownBy(() -> service.rewardQualifiedReferral(anotherReferrer.getId(), referred.getId()))
                .isInstanceOf(BusinessException.class);
        assertThat(anotherWallet.getBalance()).isZero();
        assertThat(transactionRepository.findByReferenceTypeAndReferenceId("USER_REFERRAL", referred.getId()))
                .singleElement()
                .satisfies(transaction -> {
                    assertThat(transaction.getWallet().getId()).isEqualTo(wallet.getId());
                    assertThat(transaction.getType()).isEqualTo(CreditTransactionType.REFERRAL_BONUS);
                    assertThat(transaction.getAmount()).isEqualTo(50L);
                });
    }

    @Test
    void referralCannotRewardTheSameUser() {
        User user = createUser();

        assertThatThrownBy(() -> service.rewardQualifiedReferral(user.getId(), user.getId()))
                .isInstanceOf(BusinessException.class);
        assertThat(transactionRepository.findByReferenceTypeAndReferenceId("USER_REFERRAL", user.getId()))
                .isEmpty();
    }

    @Test
    void surveyCreationChargesElevenCreditsPerTargetResponseOnce() {
        User creator = createUser();
        CreditWallet wallet = new CreditWallet();
        wallet.setUser(creator);
        wallet.setBalance(100L);
        wallet.setReservedBalance(5L);
        walletRepository.saveAndFlush(wallet);
        Survey survey = createSurvey(creator, 3);

        var first = service.chargeSurveyPublish(creator.getId(), survey.getId());
        var repeated = service.chargeSurveyPublish(creator.getId(), survey.getId());

        assertThat(first.balance()).isEqualTo(67L);
        assertThat(repeated.balance()).isEqualTo(67L);
        assertThat(repeated.reservedBalance()).isEqualTo(5L);
        assertThat(transactionRepository.findByReferenceTypeAndReferenceId("SURVEY", survey.getId()))
                .singleElement()
                .satisfies(transaction -> {
                    assertThat(transaction.getType()).isEqualTo(CreditTransactionType.SURVEY_PUBLISH);
                    assertThat(transaction.getDirection()).isEqualTo(CreditTransactionDirection.DEBIT);
                    assertThat(transaction.getAmount()).isEqualTo(33L);
                    assertThat(transaction.getBalanceBefore()).isEqualTo(100L);
                    assertThat(transaction.getBalanceAfter()).isEqualTo(67L);
                });
    }

    @Test
    void surveyPublishRejectsInsufficientBalanceWithoutTransaction() {
        User creator = createUser();
        CreditWallet wallet = new CreditWallet();
        wallet.setUser(creator);
        wallet.setBalance(32L);
        walletRepository.saveAndFlush(wallet);
        Survey survey = createSurvey(creator, 3);

        assertThatThrownBy(() -> service.chargeSurveyPublish(creator.getId(), survey.getId()))
                .isInstanceOf(BusinessException.class);
        assertThat(wallet.getBalance()).isEqualTo(32L);
        assertThat(transactionRepository.findByReferenceTypeAndReferenceId("SURVEY", survey.getId()))
                .isEmpty();
    }

    @Test
    void refundSurveyCloseCreditsUnusedResponses() {
        User creator = createUser();
        CreditWallet wallet = new CreditWallet();
        wallet.setUser(creator);
        wallet.setBalance(100L);
        walletRepository.saveAndFlush(wallet);

        Survey survey = createSurvey(creator, 5);
        survey.setCurrentResponseCount(2); // 2 responses done, 3 unused
        surveyRepository.saveAndFlush(survey);

        var response = service.refundSurveyClose(creator.getId(), survey.getId());
        assertThat(response.balance()).isEqualTo(133L); // 100 + 3 * 11 = 133
        assertThat(transactionRepository.findByReferenceTypeAndReferenceId("SURVEY_CLOSE_REFUND", survey.getId()))
                .singleElement()
                .satisfies(transaction -> {
                    assertThat(transaction.getType()).isEqualTo(CreditTransactionType.SURVEY_BUDGET_RELEASE);
                    assertThat(transaction.getDirection()).isEqualTo(CreditTransactionDirection.CREDIT);
                    assertThat(transaction.getAmount()).isEqualTo(33L);
                    assertThat(transaction.getBalanceBefore()).isEqualTo(100L);
                    assertThat(transaction.getBalanceAfter()).isEqualTo(133L);
                });
    }

    private User createUser() {
        User user = new User();
        user.setEmail("wallet-balance-" + UUID.randomUUID() + "@example.test");
        user.setPasswordHash("not-used-in-test");
        return userRepository.saveAndFlush(user);
    }

    private Survey createSurvey(User creator, int targetResponseCount) {
        Survey survey = new Survey();
        survey.setCreator(creator);
        survey.setTitle("Wallet balance survey cost test");
        survey.setProvider(SurveyProvider.INTERNAL);
        survey.setTargetResponseCount(targetResponseCount);
        return surveyRepository.saveAndFlush(survey);
    }

    private SurveyParticipation createParticipation(User user, ParticipationStatus status) {
        Instant now = Instant.now();
        Survey survey = new Survey();
        survey.setCreator(user);
        survey.setTitle("Wallet balance reward test");
        survey.setProvider(SurveyProvider.INTERNAL);
        survey.setTargetResponseCount(1);
        survey = surveyRepository.saveAndFlush(survey);

        SurveyVerificationConfig config = new SurveyVerificationConfig();
        config.setSurvey(survey);
        config.setVersion(1);
        config.setMethod(SurveyVerificationMethod.INTERNAL_SUBMISSION);
        config.setValidFrom(now);
        verificationConfigRepository.saveAndFlush(config);

        SurveyParticipation participation = new SurveyParticipation();
        participation.setPublicId(UUID.randomUUID().toString());
        participation.setSurvey(survey);
        participation.setUser(user);
        participation.setVerificationConfigVersion(1);
        participation.setSlotReservedAt(now.minusSeconds(60));
        participation.setSlotExpiresAt(now.plusSeconds(60));
        participation.setStatus(status);
        if (status == ParticipationStatus.VERIFIED) {
            participation.setVerifiedAt(now);
        }
        return participationRepository.saveAndFlush(participation);
    }
}
