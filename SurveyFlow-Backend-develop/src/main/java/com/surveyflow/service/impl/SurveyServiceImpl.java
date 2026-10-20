package com.surveyflow.service.impl;

import java.time.Clock;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.surveyflow.common.enums.CreditTransactionDirection;
import com.surveyflow.common.enums.CreditTransactionType;
import com.surveyflow.common.enums.ParticipationStatus;
import com.surveyflow.common.enums.SurveyProvider;
import com.surveyflow.common.enums.SurveyStatus;
import com.surveyflow.common.enums.SurveyVerificationMethod;
import com.surveyflow.common.util.PageableUtils;
import com.surveyflow.dto.request.survey.SurveyUpsertRequest;
import com.surveyflow.dto.response.PageResponse;
import com.surveyflow.dto.response.survey.SurveyResponse;
import com.surveyflow.dto.response.survey.SurveySummaryResponse;
import com.surveyflow.dto.response.survey.SurveyTrackingSummaryResponse;
import com.surveyflow.dto.response.survey.WebhookConfigurationResponse;
import com.surveyflow.exception.BusinessException;
import com.surveyflow.exception.ConflictException;
import com.surveyflow.exception.InvalidRequestException;
import com.surveyflow.exception.ResourceNotFoundException;
import com.surveyflow.model.Interest;
import com.surveyflow.model.Survey;
import com.surveyflow.model.SurveyCategory;
import com.surveyflow.model.SurveyTargetInterest;
import com.surveyflow.model.SurveyTargeting;
import com.surveyflow.model.SurveyVerificationConfig;
import com.surveyflow.model.User;
import com.surveyflow.model.UserInterest;
import com.surveyflow.model.UserProfile;
import com.surveyflow.repository.CreditTransactionRepository;
import com.surveyflow.repository.InterestRepository;
import com.surveyflow.repository.SurveyCategoryRepository;
import com.surveyflow.repository.SurveyParticipationRepository;
import com.surveyflow.repository.SurveyRepository;
import com.surveyflow.repository.SurveyTargetInterestRepository;
import com.surveyflow.repository.SurveyTargetingRepository;
import com.surveyflow.repository.SurveyVerificationConfigRepository;
import com.surveyflow.repository.UserGoogleFormsConnectionRepository;
import com.surveyflow.repository.UserInterestRepository;
import com.surveyflow.repository.UserProfileRepository;
import com.surveyflow.repository.UserRepository;
import com.surveyflow.repository.specification.SurveySpecifications;
import com.surveyflow.service.SurveyService;
import com.surveyflow.service.CreditWalletBalanceService;
import com.surveyflow.service.GoogleFormsClientService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j(topic = "SURVEY-SERVICE")
@Service
@RequiredArgsConstructor
public class SurveyServiceImpl implements SurveyService {

    private static final long SURVEY_COMPLETION_REWARD = 10L;
    private static final Set<String> MINE_SORTABLE_FIELDS = Set.of("createdAt", "updatedAt", "title");
    private static final Set<String> DISCOVERY_SORTABLE_FIELDS = Set.of("publishedAt", "createdAt");

    private final SurveyRepository surveyRepository;
    private final SurveyCategoryRepository categoryRepository;
    private final SurveyTargetingRepository targetingRepository;
    private final SurveyTargetInterestRepository targetInterestRepository;
    private final SurveyVerificationConfigRepository verificationConfigRepository;
    private final SurveyParticipationRepository participationRepository;
    private final CreditTransactionRepository creditTransactionRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserInterestRepository userInterestRepository;
    private final InterestRepository interestRepository;
    private final UserGoogleFormsConnectionRepository googleFormsConnectionRepository;
    private final GoogleFormsClientService googleFormsClientService;
    private final SurveySecuritySupport securitySupport;
    private final CreditWalletBalanceService creditWalletBalanceService;
    private final Clock clock;

    @Override
    @Transactional
    public SurveyResponse create(Long creatorId, SurveyUpsertRequest request) {
        User creator = requireUser(creatorId);

        validateRequest(request);

        Survey survey = new Survey();
        survey.setCreator(creator);
        survey.setStatus(SurveyStatus.DRAFT);
        survey.setCurrentResponseCount(0);
        applySurveyFields(survey, request);
        survey = surveyRepository.saveAndFlush(survey);

        applyTargeting(survey, request.targeting());

        SurveyVerificationConfig config = new SurveyVerificationConfig();
        config.setSurvey(survey);
        config.setVersion(1);
        config.setValidFrom(Instant.now(clock));
        applyVerification(config, request.verification());
        verificationConfigRepository.save(config);

        // Bản nháp survey tạo miễn phí; credit sẽ được kiểm tra và trừ khi xuất bản (publish).
        log.info("Survey draft created: surveyId={}, creatorId={}, status={}",
                survey.getId(), creatorId, survey.getStatus());
        return toResponse(survey);
    }

    @Override
    @Transactional
    public SurveyResponse update(Long creatorId, Long surveyId, SurveyUpsertRequest request) {
        Survey survey = requireOwnedSurveyForUpdate(creatorId, surveyId);

        if (survey.getStatus() != SurveyStatus.DRAFT && survey.getStatus() != SurveyStatus.PUBLISHED) {
            throw new ConflictException("Only draft or published surveys can be updated");
        }

        validateRequest(request);

        if (survey.getStatus() == SurveyStatus.PUBLISHED) {
            if (!survey.getTargetResponseCount().equals(request.targetResponseCount())) {
                throw new ConflictException("targetResponseCount cannot be changed after survey is published");
            }
            if (survey.getProvider() != SurveyProvider.valueOf(request.provider())
                    || !Objects.equals(survey.getExternalFormUrl(), normalizeOptional(request.externalFormUrl()))) {
                throw new ConflictException("Form URL and provider cannot be changed after survey is published");
            }
            if (request.deadline() != null && request.deadline().isBefore(Instant.now(clock))) {
                throw new InvalidRequestException("Survey deadline cannot be set in the past");
            }

            SurveyCategory category = request.categoryId() == null ? null : categoryRepository.findById(request.categoryId())
                    .filter(SurveyCategory::isActive)
                    .orElseThrow(() -> new InvalidRequestException("Survey category is invalid or inactive"));
            survey.setCategory(category);
            survey.setTitle(normalizeRequired(request.title()));
            survey.setDescription(normalizeOptional(request.description()));
            survey.setResearchPurpose(normalizeOptional(request.researchPurpose()));
            survey.setParticipantInstructions(normalizeOptional(request.participantInstructions()));
            survey.setEstimatedDurationSeconds(request.estimatedDurationSeconds());
            survey.setQuestionCount(request.questionCount());
            survey.setLanguage(normalizeOptional(request.language()));
            survey.setContainsSensitiveQuestions(request.containsSensitiveQuestions());
            survey.setDataUsageNotice(normalizeOptional(request.dataUsageNotice()));
            survey.setDeadline(request.deadline());
            survey.setSlotTtlSeconds(request.slotTtlSeconds());
            applyTargeting(survey, request.targeting());

            log.info("Published survey updated: surveyId={}, creatorId={}", surveyId, creatorId);
            return toResponse(survey);
        }

        // Target đã được dùng để tính phí tạo nên không được thay đổi.
        if (!survey.getTargetResponseCount().equals(request.targetResponseCount())) {
            throw new ConflictException("targetResponseCount cannot be changed after survey creation");
        }

        String previousFormUrl = survey.getExternalFormUrl();
        applySurveyFields(survey, request);
        applyTargeting(survey, request.targeting());

        SurveyVerificationConfig config = latestConfig(surveyId);

        SurveyVerificationMethod previousMethod = config.getMethod();

        applyVerification(config, request.verification());

        // Form hoặc cách xác minh đổi thì cấu hình webhook cũ không còn hợp lệ.
        if (!Objects.equals(previousFormUrl, survey.getExternalFormUrl())
                || previousMethod != config.getMethod()) {
            config.setWebhookTokenHash(null);
            config.setWebhookVerifiedAt(null);
            log.info("Webhook verification invalidated by survey update: surveyId={}, creatorId={}",
                    surveyId, creatorId);
        }

        log.info("Survey draft updated: surveyId={}, creatorId={}", surveyId, creatorId);
        return toResponse(survey);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SurveySummaryResponse> findMine(
            Long creatorId, int page, int size, String sortBy, String sortDir) {
        requireUser(creatorId);

        Pageable pageable = PageableUtils.buildPageable(
                page, size, sortBy, sortDir, "createdAt", MINE_SORTABLE_FIELDS);

        Page<Survey> surveys = surveyRepository.findByCreatorIdOrderByCreatedAtDesc(creatorId, pageable);

        return PageableUtils.toPageResponse(surveys, this::toSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SurveySummaryResponse> discover(
            Long userId, int page, int size, String sortBy, String sortDir) {
        requireUser(userId);

        Pageable pageable = PageableUtils.buildPageable(
                page, size, sortBy, sortDir, "publishedAt", DISCOVERY_SORTABLE_FIELDS);

        Instant now = Instant.now(clock);

        UserProfile profile = userProfileRepository.findByUserId(userId).orElse(null);

        Set<Long> interestIds = userInterestRepository.findByUserId(userId).stream()
                .map(UserInterest::getInterest)
                .map(Interest::getId)
                .collect(Collectors.toSet());

        Page<Survey> surveys = surveyRepository.findAll(
                SurveySpecifications.discoverableFor(userId, profile, interestIds, now), pageable);

        return PageableUtils.toPageResponse(surveys, this::toSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public SurveyResponse get(Long userId, Long surveyId) {
        Survey survey = surveyRepository.findById(surveyId)
                .orElseThrow(() -> new ResourceNotFoundException("Survey not found"));

        boolean owner = survey.getCreator().getId().equals(userId);

        // Chỉ creator được xem survey chưa publish.
        if (!owner && survey.getStatus() != SurveyStatus.PUBLISHED) {
            throw new ResourceNotFoundException("Survey not found");
        }

        return toResponse(survey);
    }

    @Override
    @Transactional(readOnly = true)
    public SurveyTrackingSummaryResponse getTrackingSummary(Long creatorId, String scope) {
        boolean isCreatorScope = !"global".equalsIgnoreCase(scope) && creatorId != null;

        long publishedCount;
        long formOpenCount;
        long completedCount;
        Long creditsAwarded;
        long invalidCodeCount;

        if (isCreatorScope) {
            publishedCount = surveyRepository.countByCreatorIdAndStatusIn(
                    creatorId, List.of(SurveyStatus.PUBLISHED, SurveyStatus.CLOSED));
            formOpenCount = participationRepository.countBySurveyCreatorId(creatorId);
            completedCount = participationRepository.countBySurveyCreatorIdAndStatusIn(
                    creatorId, List.of(ParticipationStatus.VERIFIED, ParticipationStatus.VALID));
            creditsAwarded = creditTransactionRepository.sumAmountByTypeAndDirectionAndCreatorId(
                    CreditTransactionType.SURVEY_COMPLETION, CreditTransactionDirection.CREDIT, creatorId);
            invalidCodeCount = participationRepository.countBySurveyCreatorIdAndStatus(
                    creatorId, ParticipationStatus.REJECTED);
        } else {
            publishedCount = surveyRepository.countByStatusIn(
                    List.of(SurveyStatus.PUBLISHED, SurveyStatus.CLOSED));
            formOpenCount = participationRepository.count();
            completedCount = participationRepository.countByStatusIn(
                    List.of(ParticipationStatus.VERIFIED, ParticipationStatus.VALID));
            creditsAwarded = creditTransactionRepository.sumAmountByTypeAndDirection(
                    CreditTransactionType.SURVEY_COMPLETION, CreditTransactionDirection.CREDIT);
            invalidCodeCount = participationRepository.countByStatus(ParticipationStatus.REJECTED);
        }

        if (creditsAwarded == null) {
            creditsAwarded = 0L;
        }

        double completionRate = formOpenCount > 0
                ? Math.round(((double) completedCount / formOpenCount * 100.0) * 10.0) / 10.0
                : 0.0;
        long xpAwarded = completedCount * 15L;

        return new SurveyTrackingSummaryResponse(
                publishedCount,
                formOpenCount,
                completedCount,
                completionRate,
                creditsAwarded,
                invalidCodeCount,
                xpAwarded
        );
    }

    @Override
    @Transactional
    public WebhookConfigurationResponse configureWebhook(Long creatorId, Long surveyId) {
        Survey survey = requireOwnedSurveyForUpdate(creatorId, surveyId);

        if (survey.getStatus() != SurveyStatus.DRAFT) {
            throw new ConflictException("Webhook can only be configured while survey is a draft");
        }

        if (survey.getProvider() != SurveyProvider.GOOGLE_FORMS) {
            throw new BusinessException("Google Forms webhook requires GOOGLE_FORMS provider");
        }

        securitySupport.extractGoogleFormId(survey.getExternalFormUrl());

        SurveyVerificationConfig config = latestConfig(surveyId);

        if (config.getMethod() != SurveyVerificationMethod.EXTERNAL_CODE) {
            throw new BusinessException("Webhook configuration requires EXTERNAL_CODE verification");
        }

        String token = securitySupport.newWebhookToken();
        config.setWebhookTokenHash(securitySupport.sha256(token));
        config.setWebhookVerifiedAt(null);

        log.info("Webhook configuration rotated: surveyId={}, creatorId={}", surveyId, creatorId);
        return new WebhookConfigurationResponse(
                surveyId,
                "/api/v1/webhooks/google-forms/" + surveyId,
                "/api/v1/webhooks/google-forms/" + surveyId + "/verify",
                token);
    }

    @Override
    @Transactional
    public SurveyResponse publish(Long creatorId, Long surveyId) {
        Survey survey = requireOwnedSurveyForUpdate(creatorId, surveyId);

        if (survey.getStatus() == SurveyStatus.PUBLISHED) {
            log.info("Survey publish skipped because already published: surveyId={}", surveyId);
            return toResponse(survey);
        }

        if (survey.getStatus() != SurveyStatus.DRAFT) {
            throw new ConflictException("Only draft surveys can be published");
        }

        Instant now = Instant.now(clock);

        validatePublish(survey, now);

        SurveyVerificationConfig config = latestConfig(surveyId);

        // Survey dùng mã ngoài: cho phép publish nếu đã liên kết Google Forms hoặc đã xác minh webhook.
        if (config.getMethod() == SurveyVerificationMethod.EXTERNAL_CODE
                && config.getWebhookVerifiedAt() == null) {
            boolean hasGoogleFormsConnection = googleFormsConnectionRepository.findByUserId(creatorId).isPresent();
            if (!hasGoogleFormsConnection) {
                throw new BusinessException("Vui lòng liên kết tài khoản Google Forms hoặc xác minh webhook trước khi xuất bản khảo sát");
            }
        }

        // Trừ phí xuất bản khảo sát (11 credit / response: 10 trả thưởng + 1 phí nền tảng)
        creditWalletBalanceService.chargeSurveyPublish(creatorId, surveyId);

        config.setValidFrom(now);
        survey.setStatus(SurveyStatus.PUBLISHED);
        survey.setPublishedAt(now);

        log.info("Survey status changed: surveyId={}, from={}, to={}",
                surveyId, SurveyStatus.DRAFT, SurveyStatus.PUBLISHED);
        return toResponse(survey);
    }

    @Override
    @Transactional
    public SurveyResponse close(Long creatorId, Long surveyId) {
        Survey survey = requireOwnedSurveyForUpdate(creatorId, surveyId);

        if (survey.getStatus() == SurveyStatus.CLOSED) {
            log.info("Survey close skipped because already closed: surveyId={}", surveyId);
            return toResponse(survey);
        }

        // Chỉ survey đang hiển thị hoặc đã ẩn mới được đóng.
        if (survey.getStatus() != SurveyStatus.PUBLISHED && survey.getStatus() != SurveyStatus.HIDDEN) {
            throw new ConflictException("Only published or hidden surveys can be closed");
        }

        SurveyStatus previousStatus = survey.getStatus();
        survey.setStatus(SurveyStatus.CLOSED);

        // Tự động hoàn trả credit cho các lượt phản hồi chưa có người làm (11 credit / response)
        creditWalletBalanceService.refundSurveyClose(creatorId, surveyId);

        log.info("Survey status changed: surveyId={}, from={}, to={}",
                surveyId, previousStatus, SurveyStatus.CLOSED);
        return toResponse(survey);
    }

    private void applySurveyFields(Survey survey, SurveyUpsertRequest request) {
        SurveyCategory category = request.categoryId() == null ? null : categoryRepository.findById(request.categoryId())
                .filter(SurveyCategory::isActive)
                .orElseThrow(() -> new InvalidRequestException("Survey category is invalid or inactive"));

        survey.setCategory(category);
        survey.setTitle(normalizeRequired(request.title()));
        survey.setDescription(normalizeOptional(request.description()));
        survey.setResearchPurpose(normalizeOptional(request.researchPurpose()));
        survey.setParticipantInstructions(normalizeOptional(request.participantInstructions()));
        survey.setProvider(SurveyProvider.valueOf(request.provider()));
        survey.setExternalFormUrl(normalizeOptional(request.externalFormUrl()));
        survey.setEstimatedDurationSeconds(request.estimatedDurationSeconds());
        survey.setQuestionCount(request.questionCount());
        survey.setLanguage(normalizeOptional(request.language()));
        survey.setContainsSensitiveQuestions(request.containsSensitiveQuestions());
        survey.setDataUsageNotice(normalizeOptional(request.dataUsageNotice()));
        survey.setTargetResponseCount(request.targetResponseCount());
        survey.setRewardCredit(request.rewardCredit() != null ? request.rewardCredit() : 10L);
        survey.setSlotTtlSeconds(request.slotTtlSeconds());
        survey.setDeadline(request.deadline());
    }

    private void applyVerification(
            SurveyVerificationConfig config, SurveyUpsertRequest.VerificationRequest request) {
        config.setMethod(SurveyVerificationMethod.valueOf(request.method()));
        config.setMinCompletionSeconds(request.minCompletionSeconds());
        config.setMaxCompletionSeconds(request.maxCompletionSeconds());
        config.setMaxAttempts(request.maxAttempts());
    }

    /**
     * Thay thế targeting và các interest liên quan của survey.
     */
    private void applyTargeting(Survey survey, SurveyUpsertRequest.TargetingRequest request) {
        targetInterestRepository.deleteBySurveyId(survey.getId());
        targetInterestRepository.flush();

        SurveyTargeting targeting = targetingRepository.findBySurveyId(survey.getId()).orElse(null);

        if (request == null) {
            if (targeting != null) {
                targetingRepository.delete(targeting);
            }
            return;
        }

        if (targeting == null) {
            targeting = new SurveyTargeting();
            targeting.setSurvey(survey);
        }
        targeting.setMinBirthYear(request.minBirthYear());
        targeting.setMaxBirthYear(request.maxBirthYear());
        targeting.setGender(request.genderValue());
        targeting.setSchool(normalizeOptional(request.school()));
        targeting.setOccupation(normalizeOptional(request.occupation()));
        targetingRepository.save(targeting);

        Set<Long> interestIds = request.interestIds() == null ? Set.of() : request.interestIds();

        if (interestIds.isEmpty()) {
            return;
        }

        List<Interest> interests = interestRepository.findAllById(interestIds);

        // Mọi interest targeting phải tồn tại và đang hoạt động.
        if (interests.size() != interestIds.size() || interests.stream().anyMatch(interest -> !interest.isActive())) {
            throw new InvalidRequestException("One or more target interests are invalid or inactive");
        }

        targetInterestRepository.saveAll(interests.stream().map(interest -> {
            SurveyTargetInterest mapping = new SurveyTargetInterest();
            mapping.setSurvey(survey);
            mapping.setInterest(interest);
            return mapping;
        }).toList());
    }

    /**
     * Kiểm tra các business rule giữa các field trước khi lưu survey.
     */
    private void validateRequest(SurveyUpsertRequest request) {
        if (request.verification().minCompletionSeconds() > request.verification().maxCompletionSeconds()) {
            throw new InvalidRequestException("minCompletionSeconds must not exceed maxCompletionSeconds");
        }

        // Khoảng năm sinh targeting phải có thứ tự hợp lệ.
        if (request.targeting() != null
                && request.targeting().minBirthYear() != null
                && request.targeting().maxBirthYear() != null
                && request.targeting().minBirthYear() > request.targeting().maxBirthYear()) {
            throw new InvalidRequestException("minBirthYear must not exceed maxBirthYear");
        }

        // Survey nhạy cảm phải nêu rõ thông báo sử dụng dữ liệu.
        if (Boolean.TRUE.equals(request.containsSensitiveQuestions())
                && normalizeOptional(request.dataUsageNotice()) == null) {
            throw new InvalidRequestException("dataUsageNotice is required for sensitive surveys");
        }

        SurveyProvider provider = SurveyProvider.valueOf(request.provider());
        SurveyVerificationMethod verificationMethod = SurveyVerificationMethod.valueOf(request.verification().method());

        // Provider ngoài cần có đường dẫn form để participant truy cập.
        if (provider != SurveyProvider.INTERNAL && normalizeOptional(request.externalFormUrl()) == null) {
            throw new InvalidRequestException("externalFormUrl is required for external providers");
        }

        if (provider == SurveyProvider.GOOGLE_FORMS) {
            securitySupport.extractGoogleFormId(request.externalFormUrl());
        }

        // V1 chỉ xác minh mã ngoài qua Google Forms webhook.
        if (verificationMethod == SurveyVerificationMethod.EXTERNAL_CODE
                && provider != SurveyProvider.GOOGLE_FORMS) {
            throw new InvalidRequestException("EXTERNAL_CODE requires GOOGLE_FORMS provider");
        }
    }

    private void validatePublish(Survey survey, Instant now) {
        // Không được publish survey đã hết hạn.
        if (survey.getDeadline() != null && !survey.getDeadline().isAfter(now)) {
            throw new BusinessException("Survey deadline must be in the future");
        }

        if (survey.getProvider() == SurveyProvider.GOOGLE_FORMS) {
            securitySupport.extractGoogleFormId(survey.getExternalFormUrl());
        }
    }

    private Survey requireOwnedSurveyForUpdate(Long creatorId, Long surveyId) {
        Survey survey = surveyRepository.findByIdForUpdate(surveyId)
                .orElseThrow(() -> new ResourceNotFoundException("Survey not found"));

        if (!survey.getCreator().getId().equals(creatorId)) {
            throw new ResourceNotFoundException("Survey not found");
        }

        return survey;
    }

    private User requireUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private SurveyVerificationConfig latestConfig(Long surveyId) {
        return verificationConfigRepository.findFirstBySurveyIdOrderByVersionDesc(surveyId)
                .orElseThrow(() -> new IllegalStateException("Survey verification config is missing"));
    }

    /**
     * Tính số slot còn lại sau khi loại các lượt giữ chỗ đã hết hạn.
     */
    private long availableSlots(Long surveyId, int target, Instant now) {
        long occupied = participationRepository.countBySurveyIdAndStatus(surveyId, ParticipationStatus.VERIFIED)
                + participationRepository.countBySurveyIdAndStatus(surveyId, ParticipationStatus.SUBMITTED)
                + participationRepository.countBySurveyIdAndStatusAndSlotExpiresAtAfter(
                surveyId, ParticipationStatus.RESERVED, now);

        return Math.max(0L, target - occupied);
    }

    private SurveyResponse toResponse(Survey survey) {
        SurveyVerificationConfig config = latestConfig(survey.getId());
        SurveyTargeting targeting = targetingRepository.findBySurveyId(survey.getId()).orElse(null);

        Set<Long> interestIds = targetInterestRepository.findBySurveyId(survey.getId()).stream()
                .map(SurveyTargetInterest::getInterest)
                .map(Interest::getId)
                .collect(Collectors.toCollection(HashSet::new));

        Instant now = Instant.now(clock);

        return new SurveyResponse(
                survey.getId(),
                survey.getCreator().getId(),
                survey.getCategory() == null ? null : survey.getCategory().getId(),
                survey.getTitle(),
                survey.getDescription(),
                survey.getResearchPurpose(),
                survey.getParticipantInstructions(),
                survey.getProvider(),
                survey.getExternalFormUrl(),
                survey.getEstimatedDurationSeconds(),
                survey.getQuestionCount(),
                survey.getLanguage(),
                survey.getContainsSensitiveQuestions(),
                survey.getDataUsageNotice(),
                survey.getRewardCredit() != null ? survey.getRewardCredit() : SURVEY_COMPLETION_REWARD,
                survey.getTargetResponseCount(),
                survey.getCurrentResponseCount(),
                availableSlots(survey.getId(), survey.getTargetResponseCount(), now),
                survey.getSlotTtlSeconds(),
                survey.getStatus(),
                survey.getPublishedAt(),
                survey.getDeadline(),
                new SurveyResponse.Verification(
                        config.getVersion(), config.getMethod(), config.getMinCompletionSeconds(),
                        config.getMaxCompletionSeconds(), config.getMaxAttempts(),
                        config.getWebhookVerifiedAt() != null),
                targeting == null && interestIds.isEmpty() ? null : new SurveyResponse.Targeting(
                        targeting == null ? null : targeting.getMinBirthYear(),
                        targeting == null ? null : targeting.getMaxBirthYear(),
                        targeting == null ? null : targeting.getGender(),
                        targeting == null ? null : targeting.getSchool(),
                        targeting == null ? null : targeting.getOccupation(),
                        Set.copyOf(interestIds)),
                survey.getCreatedAt(),
                survey.getUpdatedAt());
    }

    private SurveySummaryResponse toSummary(Survey survey) {
        return new SurveySummaryResponse(
                survey.getId(), survey.getCreator().getId(),
                survey.getCategory() == null ? null : survey.getCategory().getId(),
                survey.getTitle(), survey.getProvider(), survey.getEstimatedDurationSeconds(),
                survey.getRewardCredit() != null ? survey.getRewardCredit() : SURVEY_COMPLETION_REWARD,
                survey.getTargetResponseCount(), survey.getCurrentResponseCount(),
                availableSlots(survey.getId(), survey.getTargetResponseCount(), Instant.now(clock)),
                survey.getStatus(), survey.getDeadline(), survey.getCreatedAt());
    }

    private String normalizeRequired(String value) {
        return value.strip();
    }

    private String normalizeOptional(String value) {
        return value == null || value.isBlank() ? null : value.strip();
    }
}
