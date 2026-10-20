package com.surveyflow.service.impl;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.surveyflow.common.enums.ParticipationStatus;
import com.surveyflow.common.enums.SurveyStatus;
import com.surveyflow.dto.request.survey.VerifyParticipationRequest;
import com.surveyflow.dto.response.googleforms.GoogleFormVerifyResponse;
import com.surveyflow.dto.response.survey.CompletionCodeResponse;
import com.surveyflow.dto.response.survey.ParticipationResponse;
import com.surveyflow.exception.BusinessException;
import com.surveyflow.exception.ConflictException;
import com.surveyflow.exception.ResourceNotFoundException;
import com.surveyflow.model.Interest;
import com.surveyflow.model.Survey;
import com.surveyflow.model.SurveyParticipation;
import com.surveyflow.model.SurveyTargetInterest;
import com.surveyflow.model.SurveyTargeting;
import com.surveyflow.model.SurveyVerificationConfig;
import com.surveyflow.model.User;
import com.surveyflow.model.UserInterest;
import com.surveyflow.model.UserProfile;
import com.surveyflow.repository.CreditTransactionRepository;
import com.surveyflow.repository.SurveyParticipationRepository;
import com.surveyflow.repository.SurveyRepository;
import com.surveyflow.repository.SurveyTargetInterestRepository;
import com.surveyflow.repository.SurveyTargetingRepository;
import com.surveyflow.repository.SurveyVerificationConfigRepository;
import com.surveyflow.repository.UserInterestRepository;
import com.surveyflow.repository.UserProfileRepository;
import com.surveyflow.repository.UserRepository;
import com.surveyflow.service.CreditWalletBalanceService;
import com.surveyflow.service.GoogleFormsClientService;
import com.surveyflow.service.SurveyParticipationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j(topic = "SURVEY-PARTICIPATION-SERVICE")
@Service
@RequiredArgsConstructor
public class SurveyParticipationServiceImpl implements SurveyParticipationService {

    private static final long SURVEY_COMPLETION_REWARD = 10L;

    private static final Set<ParticipationStatus> BLOCKING_RETRY_STATUSES = Set.of(
            ParticipationStatus.RESERVED,
            ParticipationStatus.SUBMITTED,
            ParticipationStatus.VERIFIED,
            ParticipationStatus.REJECTED);

    private final SurveyRepository surveyRepository;
    private final SurveyParticipationRepository participationRepository;
    private final SurveyVerificationConfigRepository verificationConfigRepository;
    private final SurveyTargetingRepository targetingRepository;
    private final SurveyTargetInterestRepository targetInterestRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserInterestRepository userInterestRepository;
    private final SurveySecuritySupport securitySupport;
    private final GoogleFormsClientService googleFormsClientService;
    private final CreditTransactionRepository creditTransactionRepository;
    private final CreditWalletBalanceService creditWalletBalanceService;
    private final Clock clock;

    @Override
    @Transactional
    public ParticipationResponse reserve(Long userId, Long surveyId) {
        Instant now = Instant.now(clock);
        Survey survey = surveyRepository.findByIdForUpdate(surveyId)
                .orElseThrow(() -> new ResourceNotFoundException("Survey not found"));
        User user = requireUser(userId);

        if (survey.getStatus() != SurveyStatus.PUBLISHED) {
            throw new BusinessException("Survey is not accepting participations");
        }
        if (survey.getDeadline() != null && !survey.getDeadline().isAfter(now)) {
            throw new BusinessException("Survey deadline has passed");
        }
        if (survey.getCreator().getId().equals(userId)) {
            throw new BusinessException("Survey creator cannot participate in their own survey");
        }
//        if (!isEligible(user, survey)) {
//            throw new BusinessException("User does not satisfy survey targeting");
//        }

        // Đóng reservation đã hết hạn và chặn user đang có hoặc đã hoàn tất participation
        participationRepository.findFirstBySurveyIdAndUserIdOrderByCreatedAtDesc(surveyId, userId)
                .ifPresent(previous -> {
                    if (previous.getStatus() == ParticipationStatus.RESERVED
                            && !previous.getSlotExpiresAt().isAfter(now)) {
                        previous.setStatus(ParticipationStatus.EXPIRED);
                        log.info("Participation status changed: participationId={}, surveyId={}, from={}, to={}",
                                previous.getId(), surveyId, ParticipationStatus.RESERVED, ParticipationStatus.EXPIRED);
                    } else if (BLOCKING_RETRY_STATUSES.contains(previous.getStatus())) {
                        throw new ConflictException("User already has a non-retryable participation for this survey");
                    }
                });

        if (availableSlots(surveyId, survey.getTargetResponseCount(), now) <= 0) {
            throw new BusinessException("Survey has no available slots");
        }

        SurveyVerificationConfig config = activeConfig(surveyId, now);
        SurveyParticipation participation = new SurveyParticipation();
        participation.setPublicId(UUID.randomUUID().toString());
        participation.setSurvey(survey);
        participation.setUser(user);
        participation.setVerificationConfigVersion(config.getVersion());
        participation.setEligibilitySnapshot(buildEligibilitySnapshot(user, survey));
        participation.setStatus(ParticipationStatus.RESERVED);
        participation.setSlotReservedAt(now);
        participation.setSlotExpiresAt(now.plusSeconds(survey.getSlotTtlSeconds()));
        participation.setVerificationAttemptCount(0);
        participation = participationRepository.save(participation);
        log.info("Participation reserved: participationId={}, surveyId={}, userId={}",
                participation.getId(), surveyId, userId);
        return toResponse(participation, config);
    }

    @Override
    @Transactional(readOnly = true)
    public ParticipationResponse get(Long userId, String publicId) {
        SurveyParticipation participation = participationRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Participation not found"));
        requireParticipantOwner(userId, participation);
        return toResponse(participation, configFor(participation));
    }

    @Override
    @Transactional
    public CompletionCodeResponse issueCompletionCode(Long userId, String publicId) {
        SurveyParticipation participation = participationRepository.findByPublicIdForUpdate(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Participation not found"));
        requireParticipantOwner(userId, participation);
        if (participation.getStatus() != ParticipationStatus.RESERVED) {
            throw new ConflictException("Completion code is only available for reserved participation");
        }

        Instant now = Instant.now(clock);
        if (!participation.getSlotExpiresAt().isAfter(now)) {
            throw new BusinessException("Participation slot has expired");
        }
        SurveyVerificationConfig config = configFor(participation);
        Instant codeAvailableAt = participation.getSlotReservedAt()
                .plusSeconds(config.getMinCompletionSeconds());
        if (now.isBefore(codeAvailableAt)) {
            throw new BusinessException("Completion code is not available yet");
        }

        String code = securitySupport.newCompletionCode();
        participation.setVerificationCodeHash(securitySupport.sha256(code));
        participation.setVerificationCodeIssuedAt(now);
        log.info("Completion code issued: participationId={}, surveyId={}, userId={}",
                participation.getId(), participation.getSurvey().getId(), userId);
        return new CompletionCodeResponse(publicId, code, now, participation.getSlotExpiresAt());
    }

    @Override
    @Transactional
    public ParticipationResponse verify(Long userId, String publicId, VerifyParticipationRequest request) {
        SurveyParticipation participation = participationRepository.findByPublicIdForUpdate(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Participation not found"));
        requireParticipantOwner(userId, participation);

        if (participation.getStatus() == ParticipationStatus.VERIFIED) {
            return toResponse(participation, configFor(participation));
        }

        if (participation.getStatus() != ParticipationStatus.RESERVED) {
            throw new ConflictException("Lượt tham gia không ở trạng thái chờ xác nhận");
        }

        Instant now = Instant.now(clock);
        if (!participation.getSlotExpiresAt().isAfter(now)) {
            participation.setStatus(ParticipationStatus.EXPIRED);
            participationRepository.save(participation);
            throw new BusinessException("Lượt tham gia đã hết hạn giữ slot");
        }

        String respondentEmail = request != null && request.respondentEmail() != null && !request.respondentEmail().isBlank()
                ? request.respondentEmail().trim()
                : participation.getUser().getEmail();

        String rawCode = request != null && request.completionCode() != null && !request.completionCode().isBlank()
                ? request.completionCode().strip()
                : null;

        if (rawCode != null && participation.getVerificationCodeHash() != null) {
            String codeHash = securitySupport.sha256(rawCode.toUpperCase());
            if (!participation.getVerificationCodeHash().equals(codeHash)) {
                throw new BusinessException("Mã xác nhận không khớp với mã đã cấp cho bạn");
            }
        }

        Survey survey = participation.getSurvey();
        Long creatorId = survey.getCreator().getId();
        String formUrl = survey.getExternalFormUrl();
        Instant issuedAt = participation.getSlotReservedAt();

        GoogleFormVerifyResponse verifyRes = googleFormsClientService.verifyResponse(
                creatorId, formUrl, rawCode, respondentEmail, issuedAt);

        if (!verifyRes.isVerified()) {
            participation.setVerificationAttemptCount(participation.getVerificationAttemptCount() + 1);
            participationRepository.save(participation);
            throw new BusinessException(verifyRes.getMessage() != null
                    ? verifyRes.getMessage()
                    : "Chưa tìm thấy phản hồi từ Google Form. Vui lòng đảm bảo bạn đã bấm 'Gửi' trên Google Form!");
        }

        Instant processedAt = Instant.now(clock);
        participation.setStatus(ParticipationStatus.VERIFIED);
        participation.setSubmittedAt(verifyRes.getSubmittedAt() != null ? verifyRes.getSubmittedAt() : processedAt);
        participation.setVerifiedAt(processedAt);
        participation.setVerificationCodeHash(null);
        participationRepository.save(participation);

        if (creditTransactionRepository.findByReferenceTypeAndReferenceId(
                "SURVEY_PARTICIPATION", participation.getId()).isEmpty()) {
            creditWalletBalanceService.rewardSurveyCompletion(
                    participation.getUser().getId(), participation.getId());
        }

        survey.setCurrentResponseCount(survey.getCurrentResponseCount() + 1);
        if (survey.getCurrentResponseCount() >= survey.getTargetResponseCount()) {
            SurveyStatus previousStatus = survey.getStatus();
            survey.setStatus(SurveyStatus.CLOSED);
            log.info("Survey status changed after target reached: surveyId={}, from={}, to={}",
                    survey.getId(), previousStatus, SurveyStatus.CLOSED);
        }
        surveyRepository.save(survey);

        log.info("Participation verified via Google Forms API: participationId={}, surveyId={}, userId={}, rewardCredit={}",
                participation.getId(), survey.getId(), userId, SURVEY_COMPLETION_REWARD);

        return toResponse(participation, configFor(participation));
    }

    @Override
    @Transactional
    public ParticipationResponse cancel(Long userId, String publicId) {
        SurveyParticipation participation = participationRepository.findByPublicIdForUpdate(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Participation not found"));
        requireParticipantOwner(userId, participation);
        if (participation.getStatus() == ParticipationStatus.CANCELLED) {
            log.info("Participation cancellation skipped because already cancelled: participationId={}",
                    participation.getId());
            return toResponse(participation, configFor(participation));
        }
        if (participation.getStatus() != ParticipationStatus.RESERVED) {
            throw new ConflictException("Only reserved participation can be cancelled");
        }
        participation.setStatus(ParticipationStatus.CANCELLED);
        participation.setVerificationCodeHash(null);
        participation.setVerificationCodeIssuedAt(null);
        log.info("Participation status changed: participationId={}, surveyId={}, userId={}, from={}, to={}",
                participation.getId(), participation.getSurvey().getId(), userId,
                ParticipationStatus.RESERVED, ParticipationStatus.CANCELLED);
        return toResponse(participation, configFor(participation));
    }

    private User requireUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void requireParticipantOwner(Long userId, SurveyParticipation participation) {
        if (!participation.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Participation not found");
        }
    }

    /**
     * Lấy cấu hình verification đang có hiệu lực của survey.
     */
    private SurveyVerificationConfig activeConfig(Long surveyId, Instant now) {
        return verificationConfigRepository.findActive(surveyId, now).stream().findFirst()
                .orElseThrow(() -> new BusinessException("Survey has no active verification config"));
    }

    private SurveyVerificationConfig configFor(SurveyParticipation participation) {
        return verificationConfigRepository.findBySurveyIdAndVersion(
                        participation.getSurvey().getId(), participation.getVerificationConfigVersion())
                .orElseThrow(() -> new IllegalStateException("Participation verification config is missing"));
    }

    /**
     * Tính số slot còn lại sau khi loại các lượt giữ chỗ đã hết hạn.
     */
    private long availableSlots(Long surveyId, int target, Instant now) {
        long occupied = participationRepository.countBySurveyIdAndStatus(surveyId, ParticipationStatus.VERIFIED)
                + participationRepository.countBySurveyIdAndStatus(surveyId, ParticipationStatus.SUBMITTED)
                + participationRepository.countBySurveyIdAndStatusAndSlotExpiresAtAfter(
                surveyId, ParticipationStatus.RESERVED, now);
        return target - occupied;
    }

    /**
     * Kiểm tra user có đáp ứng targeting của survey hay không.
     */
    private boolean isEligible(User user, Survey survey) {
        SurveyTargeting targeting = targetingRepository.findBySurveyId(survey.getId()).orElse(null);
        List<SurveyTargetInterest> requiredInterests = targetInterestRepository.findBySurveyId(survey.getId());
        boolean hasDemographicTargeting = hasDemographicTargeting(targeting);
        if (!hasDemographicTargeting && requiredInterests.isEmpty()) {
            return true;
        }
        UserProfile profile = userProfileRepository.findByUserId(user.getId()).orElse(null);
        if (hasDemographicTargeting) {
            if (profile == null) {
                return false;
            }
            if (targeting.getMinBirthYear() != null
                    && (profile.getBirthYear() == null || profile.getBirthYear() < targeting.getMinBirthYear())) {
                return false;
            }
            if (targeting.getMaxBirthYear() != null
                    && (profile.getBirthYear() == null || profile.getBirthYear() > targeting.getMaxBirthYear())) {
                return false;
            }
            if (targeting.getGender() != null && targeting.getGender() != profile.getGender()) {
                return false;
            }
            if (!matchesOptional(targeting.getSchool(), profile.getSchool())
                    || !matchesOptional(targeting.getOccupation(), profile.getOccupation())) {
                return false;
            }
        }
        if (requiredInterests.isEmpty()) {
            return true;
        }
        Set<Long> userInterestIds = userInterestRepository.findByUserId(user.getId()).stream()
                .map(UserInterest::getInterest)
                .map(Interest::getId)
                .collect(Collectors.toSet());
        return requiredInterests.stream()
                .map(SurveyTargetInterest::getInterest)
                .map(Interest::getId)
                .anyMatch(userInterestIds::contains);
    }

    private boolean hasDemographicTargeting(SurveyTargeting targeting) {
        return targeting != null && (targeting.getMinBirthYear() != null
                || targeting.getMaxBirthYear() != null
                || targeting.getGender() != null
                || targeting.getSchool() != null
                || targeting.getOccupation() != null);
    }

    private boolean matchesOptional(String expected, String actual) {
        return expected == null || (actual != null && expected.equalsIgnoreCase(actual.strip()));
    }

    /**
     * Lưu dấu vết tối thiểu của kết quả kiểm tra eligibility tại thời điểm reserve.
     */
    private String buildEligibilitySnapshot(User user, Survey survey) {
        return "{\"eligible\":true,\"userId\":" + user.getId()
                + ",\"surveyId\":" + survey.getId()
                + ",\"evaluatedAt\":\"" + Instant.now(clock) + "\"}";
    }

    private ParticipationResponse toResponse(
            SurveyParticipation participation, SurveyVerificationConfig config) {
        Instant codeAvailableAt = participation.getSlotReservedAt()
                .plusSeconds(config.getMinCompletionSeconds());
        return new ParticipationResponse(
                participation.getPublicId(),
                participation.getSurvey().getId(),
                participation.getUser().getId(),
                participation.getStatus(),
                SURVEY_COMPLETION_REWARD,
                participation.getSurvey().getExternalFormUrl(),
                participation.getSlotReservedAt(),
                codeAvailableAt,
                participation.getSlotExpiresAt(),
                participation.getSubmittedAt(),
                participation.getVerifiedAt(),
                participation.getRejectedAt(),
                participation.getVerificationAttemptCount(),
                participation.getFailureReason());
    }
}
