package com.surveyflow.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Instant;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.surveyflow.common.enums.AuthProvider;
import com.surveyflow.common.enums.CreditTransactionDirection;
import com.surveyflow.common.enums.CreditTransactionType;
import com.surveyflow.common.enums.ParticipationStatus;
import com.surveyflow.common.enums.SurveyStatus;
import com.surveyflow.common.enums.UserStatus;
import com.surveyflow.dto.request.survey.GoogleFormWebhookRequest;
import com.surveyflow.dto.request.survey.SurveyUpsertRequest;
import com.surveyflow.dto.request.survey.WebhookConnectionRequest;
import com.surveyflow.dto.response.PageResponse;
import com.surveyflow.dto.response.survey.CompletionCodeResponse;
import com.surveyflow.dto.response.survey.ParticipationResponse;
import com.surveyflow.dto.response.survey.SurveyResponse;
import com.surveyflow.dto.response.survey.SurveyTrackingSummaryResponse;
import com.surveyflow.dto.response.survey.WebhookAcknowledgementResponse;
import com.surveyflow.dto.response.survey.WebhookConfigurationResponse;
import com.surveyflow.exception.BusinessException;
import com.surveyflow.exception.ConflictException;
import com.surveyflow.exception.UnauthorizedException;
import com.surveyflow.model.CreditWallet;
import com.surveyflow.model.User;
import com.surveyflow.repository.CreditWalletRepository;
import com.surveyflow.repository.CreditTransactionRepository;
import com.surveyflow.repository.SurveyParticipationRepository;
import com.surveyflow.repository.SurveyFormWebhookReceiptRepository;
import com.surveyflow.repository.SurveyRepository;
import com.surveyflow.repository.UserRepository;
import com.surveyflow.service.SurveyParticipationService;
import com.surveyflow.service.SurveyService;
import com.surveyflow.service.SurveyWebhookService;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class SurveyApiFlowIntegrationTest {

    private static final String FORM_ID = "1FAIpQLScodexSurveyFlowTest";

    @Autowired
    private SurveyService surveyService;

    @Autowired
    private SurveyParticipationService participationService;

    @Autowired
    private SurveyWebhookService webhookService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CreditWalletRepository walletRepository;

    @Autowired
    private CreditTransactionRepository transactionRepository;

    @Autowired
    private SurveyParticipationRepository participationRepository;

    @Autowired
    private SurveyRepository surveyRepository;

    @Autowired
    private SurveyFormWebhookReceiptRepository receiptRepository;

    @Test
    void googleFormWebhookVerifiesParticipationAndRewardsExactlyOnce() {
        User creator = createUser("creator");
        User participant = createUser("participant");
        CreditWallet creatorWallet = createWallet(creator, 1_000L);
        CreditWallet participantWallet = createWallet(participant, 0L);

        SurveyResponse draft = surveyService.create(creator.getId(), request());
        assertThat(creatorWallet.getBalance()).isEqualTo(1_000L);

        WebhookConfigurationResponse webhook = surveyService.configureWebhook(creator.getId(), draft.id());
        webhookService.verifyConnection(
                draft.id(), webhook.webhookToken(), new WebhookConnectionRequest(FORM_ID));

        SurveyResponse published = surveyService.publish(creator.getId(), draft.id());
        assertThat(published.status()).isEqualTo(SurveyStatus.PUBLISHED);
        assertThat(creatorWallet.getBalance()).isEqualTo(978L);
        assertThat(creatorWallet.getReservedBalance()).isZero();
        assertThat(transactionRepository.findByReferenceTypeAndReferenceId("SURVEY", draft.id()))
                .singleElement()
                .satisfies(transaction -> {
                    assertThat(transaction.getType()).isEqualTo(CreditTransactionType.SURVEY_PUBLISH);
                    assertThat(transaction.getDirection()).isEqualTo(CreditTransactionDirection.DEBIT);
                    assertThat(transaction.getAmount()).isEqualTo(22L);
                    assertThat(transaction.getBalanceBefore()).isEqualTo(1_000L);
                    assertThat(transaction.getBalanceAfter()).isEqualTo(978L);
                });

        ParticipationResponse reserved = participationService.reserve(participant.getId(), draft.id());
        CompletionCodeResponse code = participationService.issueCompletionCode(
                participant.getId(), reserved.publicId());

        GoogleFormWebhookRequest callback = new GoogleFormWebhookRequest(
                FORM_ID,
                "response-" + UUID.randomUUID(),
                Instant.now(),
                code.completionCode());
        WebhookAcknowledgementResponse first = webhookService.process(
                draft.id(), webhook.webhookToken(), callback);
        WebhookAcknowledgementResponse duplicate = webhookService.process(
                draft.id(), webhook.webhookToken(), callback);

        assertThat(first.status()).isEqualTo("PROCESSED");
        assertThat(duplicate.status()).isEqualTo("PROCESSED");
        assertThat(participationService.get(participant.getId(), reserved.publicId()).status())
                .isEqualTo(ParticipationStatus.VERIFIED);
        assertThat(walletRepository.findById(participantWallet.getId()).orElseThrow().getBalance())
                .isEqualTo(10L);
        Long participationId = participationRepository.findByPublicId(reserved.publicId()).orElseThrow().getId();
        assertThat(transactionRepository.findByReferenceTypeAndReferenceId(
                "SURVEY_PARTICIPATION", participationId)).hasSize(1);
        assertThat(walletRepository.findById(creatorWallet.getId()).orElseThrow().getBalance())
                .isEqualTo(978L);
        assertThat(surveyRepository.findById(draft.id()).orElseThrow().getCurrentResponseCount())
                .isEqualTo(1);
        assertThat(receiptRepository.count()).isEqualTo(1L);
    }

    @Test
    void publishRequiresVerifiedWebhookConnection() {
        User creator = createUser("unverified-creator");
        createWallet(creator, 1_000L);
        SurveyResponse draft = surveyService.create(creator.getId(), request());
        surveyService.configureWebhook(creator.getId(), draft.id());

        assertThatThrownBy(() -> surveyService.publish(creator.getId(), draft.id()))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Vui lòng liên kết tài khoản Google Forms hoặc xác minh webhook");
    }

    @Test
    void publishWithInsufficientCreditsThrowsException() {
        User creator = createUser("insufficient-creator");
        CreditWallet wallet = createWallet(creator, 10L); // Cần 22 credits cho 2 responses
        SurveyResponse draft = surveyService.create(creator.getId(), request());

        WebhookConfigurationResponse webhook = surveyService.configureWebhook(creator.getId(), draft.id());
        webhookService.verifyConnection(
                draft.id(), webhook.webhookToken(), new WebhookConnectionRequest(FORM_ID));

        assertThatThrownBy(() -> surveyService.publish(creator.getId(), draft.id()))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Số dư ví không đủ để xuất bản khảo sát");

        assertThat(walletRepository.findById(wallet.getId()).orElseThrow().getBalance()).isEqualTo(10L);
    }

    @Test
    void updateDraftAllowsChangingTargetResponseCount() {
        User creator = createUser("flexible-target-creator");
        createWallet(creator, 100L);
        SurveyResponse draft = surveyService.create(creator.getId(), request());

        SurveyResponse updated = surveyService.update(
                creator.getId(), draft.id(), requestWithTargetResponseCount(5));

        assertThat(updated.targetResponseCount()).isEqualTo(5);
        assertThat(surveyRepository.findById(draft.id()).orElseThrow().getTargetResponseCount()).isEqualTo(5);
    }

    @Test
    void webhookRejectsInvalidToken() {
        User creator = createUser("invalid-token-creator");
        createWallet(creator, 1_000L);
        SurveyResponse draft = surveyService.create(creator.getId(), request());
        surveyService.configureWebhook(creator.getId(), draft.id());

        assertThatThrownBy(() -> webhookService.verifyConnection(
                draft.id(), "wrong-token", new WebhookConnectionRequest(FORM_ID)))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Invalid webhook token");
    }

    @Test
    void findMineUsesDatabasePagination() {
        User creator = createUser("paged-creator");
        createWallet(creator, 100L);
        surveyService.create(creator.getId(), request());
        surveyService.create(creator.getId(), request());
        surveyService.create(creator.getId(), request());

        PageResponse<?> firstPage = surveyService.findMine(creator.getId(), 1, 2, null, null);
        PageResponse<?> secondPage = surveyService.findMine(creator.getId(), 2, 2, null, null);

        assertThat(firstPage.items()).hasSize(2);
        assertThat(firstPage.page()).isEqualTo(1);
        assertThat(firstPage.totalElements()).isEqualTo(3);
        assertThat(firstPage.totalPages()).isEqualTo(2);
        assertThat(secondPage.items()).hasSize(1);
        assertThat(secondPage.page()).isEqualTo(2);
    }

    @Test
    void discoverFiltersTargetingBeforeDatabasePagination() {
        User creator = createUser("discovery-creator");
        User participant = createUser("discovery-participant");
        createWallet(creator, 1_000L);
        createPublishedSurvey(creator, request());
        createPublishedSurvey(creator, request());
        createPublishedSurvey(creator, targetedRequest());

        PageResponse<?> firstPage = surveyService.discover(participant.getId(), 1, 1, null, null);
        PageResponse<?> secondPage = surveyService.discover(participant.getId(), 2, 1, null, null);

        assertThat(firstPage.totalElements()).isEqualTo(2);
        assertThat(firstPage.totalPages()).isEqualTo(2);
        assertThat(firstPage.items()).hasSize(1);
        assertThat(firstPage.page()).isEqualTo(1);
        assertThat(secondPage.items()).hasSize(1);
        assertThat(secondPage.page()).isEqualTo(2);
    }

    private User createUser(String prefix) {
        User user = new User();
        user.setEmail(prefix + "-" + UUID.randomUUID() + "@example.test");
        user.setPasswordHash("not-used-in-service-test");
        user.setAuthProvider(AuthProvider.LOCAL);
        user.setStatus(UserStatus.ACTIVE);
        return userRepository.save(user);
    }

    @Test
    void getTrackingSummaryReturnsAccurateMetrics() {
        User creator = createUser("tracker_creator");
        User participant = createUser("tracker_participant");
        createWallet(creator, 1_000L);
        createWallet(participant, 0L);

        SurveyResponse published = createPublishedSurvey(creator, request());
        ParticipationResponse participation = participationService.reserve(participant.getId(), published.id());
        CompletionCodeResponse code = participationService.issueCompletionCode(participant.getId(), participation.publicId());

        WebhookConfigurationResponse webhook = surveyService.configureWebhook(creator.getId(), published.id());
        webhookService.process(
                published.id(),
                webhook.webhookToken(),
                new GoogleFormWebhookRequest(
                        FORM_ID,
                        "resp_tracking_001",
                        Instant.now(),
                        code.completionCode()));

        SurveyTrackingSummaryResponse mineSummary = surveyService.getTrackingSummary(creator.getId(), "mine");
        assertThat(mineSummary.publishedCount()).isGreaterThanOrEqualTo(1L);
        assertThat(mineSummary.formOpenCount()).isGreaterThanOrEqualTo(1L);
        assertThat(mineSummary.completedCount()).isGreaterThanOrEqualTo(1L);
        assertThat(mineSummary.completionRate()).isGreaterThan(0.0);
        assertThat(mineSummary.creditsAwarded()).isGreaterThanOrEqualTo(10L);

        SurveyTrackingSummaryResponse globalSummary = surveyService.getTrackingSummary(creator.getId(), "global");
        assertThat(globalSummary.publishedCount()).isGreaterThanOrEqualTo(1L);
        assertThat(globalSummary.formOpenCount()).isGreaterThanOrEqualTo(1L);
    }

    private CreditWallet createWallet(User user, long balance) {
        CreditWallet wallet = new CreditWallet();
        wallet.setUser(user);
        wallet.setBalance(balance);
        wallet.setReservedBalance(0L);
        return walletRepository.save(wallet);
    }

    private SurveyResponse createPublishedSurvey(User creator, SurveyUpsertRequest request) {
        SurveyResponse draft = surveyService.create(creator.getId(), request);
        WebhookConfigurationResponse webhook = surveyService.configureWebhook(creator.getId(), draft.id());
        webhookService.verifyConnection(draft.id(), webhook.webhookToken(), new WebhookConnectionRequest(FORM_ID));
        return surveyService.publish(creator.getId(), draft.id());
    }

    private SurveyUpsertRequest request() {
        return new SurveyUpsertRequest(
                null,
                "Google Forms integration test",
                "Description",
                "Research purpose",
                "Enter the completion code before submitting",
                "GOOGLE_FORMS",
                "https://docs.google.com/forms/d/e/" + FORM_ID + "/viewform",
                300,
                10,
                "vi",
                false,
                null,
                2,
                1_800,
                Instant.now().plusSeconds(86_400),
                new SurveyUpsertRequest.VerificationRequest(
                        "EXTERNAL_CODE", 0, 900, 3),
                null);
    }

    private SurveyUpsertRequest targetedRequest() {
        SurveyUpsertRequest request = request();
        return new SurveyUpsertRequest(
                request.categoryId(),
                request.title(),
                request.description(),
                request.researchPurpose(),
                request.participantInstructions(),
                request.provider(),
                request.externalFormUrl(),
                request.estimatedDurationSeconds(),
                request.questionCount(),
                request.language(),
                request.containsSensitiveQuestions(),
                request.dataUsageNotice(),
                request.targetResponseCount(),
                request.slotTtlSeconds(),
                request.deadline(),
                request.verification(),
                new SurveyUpsertRequest.TargetingRequest(2000, 2005, "FEMALE", null, null, null));
    }

    private SurveyUpsertRequest requestWithTargetResponseCount(int targetResponseCount) {
        SurveyUpsertRequest request = request();
        return new SurveyUpsertRequest(
                request.categoryId(),
                request.title(),
                request.description(),
                request.researchPurpose(),
                request.participantInstructions(),
                request.provider(),
                request.externalFormUrl(),
                request.estimatedDurationSeconds(),
                request.questionCount(),
                request.language(),
                request.containsSensitiveQuestions(),
                request.dataUsageNotice(),
                targetResponseCount,
                request.slotTtlSeconds(),
                request.deadline(),
                request.verification(),
                request.targeting());
    }
}
