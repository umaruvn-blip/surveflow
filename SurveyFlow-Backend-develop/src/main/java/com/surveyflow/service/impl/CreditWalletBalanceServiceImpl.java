package com.surveyflow.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.surveyflow.common.enums.CreditTransactionDirection;
import com.surveyflow.common.enums.CreditTransactionType;
import com.surveyflow.common.enums.ParticipationStatus;
import com.surveyflow.common.enums.SurveyStatus;
import com.surveyflow.dto.response.credit.CreditWalletResponse;
import com.surveyflow.exception.BusinessException;
import com.surveyflow.exception.ConflictException;
import com.surveyflow.exception.ResourceNotFoundException;
import com.surveyflow.model.CreditTransaction;
import com.surveyflow.model.CreditWallet;
import com.surveyflow.model.SurveyParticipation;
import com.surveyflow.model.Survey;
import com.surveyflow.model.User;
import com.surveyflow.repository.CreditTransactionRepository;
import com.surveyflow.repository.CreditWalletRepository;
import com.surveyflow.repository.SurveyParticipationRepository;
import com.surveyflow.repository.SurveyRepository;
import com.surveyflow.repository.UserRepository;
import com.surveyflow.service.CreditWalletBalanceService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j(topic = "CREDIT-WALLET-BALANCE-SERVICE")
@Service
@RequiredArgsConstructor
public class CreditWalletBalanceServiceImpl implements CreditWalletBalanceService {

    private static final long REGISTRATION_BONUS = 200L;
    private static final long EARLY_BIRD_BONUS = 100L;
    private static final int EARLY_BIRD_MAX_USERS = 87; // 47 users hien tai + 40 users moi (30 theo ke hoach + 10 du phong test)
    private static final long SURVEY_COMPLETION_REWARD = 10L;
    private static final long SURVEY_CREATION_COST_PER_RESPONSE = 11L;
    private static final long REFERRAL_REWARD = 50L;
    private static final String REGISTRATION_REFERENCE = "USER_REGISTRATION";
    private static final String PARTICIPATION_REFERENCE = "SURVEY_PARTICIPATION";
    private static final String REFERRAL_REFERENCE = "USER_REFERRAL";
    private static final String SURVEY_REFERENCE = "SURVEY";

    private final CreditWalletRepository walletRepository;
    private final CreditTransactionRepository transactionRepository;
    private final SurveyParticipationRepository participationRepository;
    private final UserRepository userRepository;
    private final SurveyRepository surveyRepository;

    @Override
    @Transactional
    public CreditWalletResponse initializeForRegistration(Long userId) {
        CreditWallet wallet = walletRepository.findByUserIdForUpdate(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Credit wallet not found for user: " + userId));

        long totalUsers = userRepository.count();
        boolean isEarlyBird = totalUsers <= EARLY_BIRD_MAX_USERS;
        long grantAmount = isEarlyBird ? (REGISTRATION_BONUS + EARLY_BIRD_BONUS) : REGISTRATION_BONUS;
        String description = isEarlyBird
                ? "Thưởng chào mừng + Ưu đãi thành viên sớm (+100 credits)"
                : "Registration bonus";

        return creditOnce(wallet, grantAmount, CreditTransactionType.REGISTRATION_BONUS,
                REGISTRATION_REFERENCE, userId, description);
    }

    @Override
    @Transactional
    public CreditWalletResponse rewardSurveyCompletion(Long userId, Long participationId) {
        SurveyParticipation participation = participationRepository.findWithLockById(participationId)
                .orElseThrow(() -> new ResourceNotFoundException("Survey participation not found: " + participationId));

        if (!participation.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Survey participation not found: " + participationId);
        }

        if (participation.getStatus() != ParticipationStatus.VERIFIED
                && participation.getStatus() != ParticipationStatus.VALID) {
            throw new BusinessException("Only a verified survey participation can receive credits");
        }
        CreditWallet wallet = walletRepository.findByUserIdForUpdate(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Credit wallet not found for user: " + userId));

        long rewardAmount = participation.getSurvey().getRewardCredit() != null
                ? participation.getSurvey().getRewardCredit()
                : SURVEY_COMPLETION_REWARD;

        return creditOnce(wallet, rewardAmount, CreditTransactionType.SURVEY_COMPLETION,
                PARTICIPATION_REFERENCE, participationId, "Thưởng hoàn thành khảo sát (" + rewardAmount + " credits)");
    }

    @Override
    @Transactional
    public CreditWalletResponse rewardQualifiedReferral(Long referrerUserId, Long referredUserId) {
        if (referrerUserId == null || referredUserId == null
                || referrerUserId.equals(referredUserId)) {
            throw new BusinessException("A referral requires two distinct users");
        }

        // Khóa người được mời để chỉ một người giới thiệu có thể nhận thưởng cho tài khoản này.
        User referredUser = userRepository.findByIdForUpdate(referredUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Referred user not found: " + referredUserId));
        if (referredUser.getReferredBy() == null
                || !referrerUserId.equals(referredUser.getReferredBy().getId())) {
            throw new BusinessException("Referred user does not belong to this referrer");
        }
        CreditWallet wallet = walletRepository.findByUserIdForUpdate(referrerUserId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Credit wallet not found for user: " + referrerUserId));

        return creditOnce(wallet, REFERRAL_REWARD, CreditTransactionType.REFERRAL_BONUS,
                REFERRAL_REFERENCE, referredUserId, "Qualified referral reward");
    }

    @Override
    @Transactional
    public CreditWalletResponse chargeSurveyPublish(Long creatorUserId, Long surveyId) {
        Survey survey = surveyRepository.findByIdForUpdate(surveyId)
                .orElseThrow(() -> new ResourceNotFoundException("Survey not found: " + surveyId));

        if (!survey.getCreator().getId().equals(creatorUserId)) {
            throw new ResourceNotFoundException("Survey not found: " + surveyId);
        }

        if (survey.getTargetResponseCount() == null || survey.getTargetResponseCount() <= 0) {
            throw new BusinessException("Survey target response count must be positive");
        }

        long rewardCredit = survey.getRewardCredit() != null ? survey.getRewardCredit() : 10L;
        long costPerResponse = rewardCredit + 1L; // reward credit + 1 credit phí nền tảng

        long amount;
        try {
            amount = Math.multiplyExact(costPerResponse, survey.getTargetResponseCount().longValue());
        } catch (ArithmeticException ex) {
            throw new BusinessException("Survey publish credit cost exceeds the supported range");
        }

        CreditWallet wallet = walletRepository.findByUserIdForUpdate(creatorUserId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Credit wallet not found for user: " + creatorUserId));

        if (wallet.getBalance() < amount) {
            throw new BusinessException("Số dư ví không đủ để xuất bản khảo sát (Cần " + amount + " Credits, hiện có " + wallet.getBalance() + " Credits)");
        }

        return debitOnce(wallet, amount, CreditTransactionType.SURVEY_PUBLISH,
                SURVEY_REFERENCE, surveyId, "Phí xuất bản khảo sát (" + survey.getTargetResponseCount() + " phản hồi × " + costPerResponse + " credits)");
    }

    @Override
    @Transactional
    public CreditWalletResponse refundSurveyClose(Long creatorUserId, Long surveyId) {
        Survey survey = surveyRepository.findByIdForUpdate(surveyId)
                .orElseThrow(() -> new ResourceNotFoundException("Survey not found: " + surveyId));

        if (!survey.getCreator().getId().equals(creatorUserId)) {
            throw new ResourceNotFoundException("Survey not found: " + surveyId);
        }

        int target = survey.getTargetResponseCount() != null ? survey.getTargetResponseCount() : 0;
        int completed = survey.getCurrentResponseCount() != null ? survey.getCurrentResponseCount() : 0;
        int unused = Math.max(0, target - completed);

        if (unused <= 0) {
            CreditWallet wallet = walletRepository.findByUserId(creatorUserId)
                    .orElseThrow(() -> new ResourceNotFoundException("Credit wallet not found for user: " + creatorUserId));
            return toResponse(wallet);
        }

        long rewardCredit = survey.getRewardCredit() != null ? survey.getRewardCredit() : 10L;
        long costPerResponse = rewardCredit + 1L;
        long refundAmount = (long) unused * costPerResponse;

        CreditWallet wallet = walletRepository.findByUserIdForUpdate(creatorUserId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Credit wallet not found for user: " + creatorUserId));

        return creditOnce(wallet, refundAmount, CreditTransactionType.SURVEY_BUDGET_RELEASE,
                "SURVEY_CLOSE_REFUND", surveyId, "Hoàn trả phí cho " + unused + " lượt phản hồi chưa dùng (" + refundAmount + " credits)");
    }

    @Override
    @Transactional
    public CreditWalletResponse chargeSurveyCreation(Long creatorUserId, Long surveyId) {
        return chargeSurveyPublish(creatorUserId, surveyId);
    }

    /**
     * Ghi một khoản credit đúng một lần theo nguồn phát sinh và cập nhật ví trong cùng transaction.
     */
    private CreditWalletResponse creditOnce(CreditWallet wallet,
                                            long amount,
                                            CreditTransactionType type,
                                            String referenceType,
                                            Long referenceId,
                                            String description) {
        List<CreditTransaction> existing = transactionRepository
                .findByReferenceTypeAndReferenceId(referenceType, referenceId);

        if (!existing.isEmpty()) {
            if (existing.size() == 1 && existing.getFirst().getWallet().getId().equals(wallet.getId())
                    && existing.getFirst().getType() == type
                    && existing.getFirst().getDirection() == CreditTransactionDirection.CREDIT
                    && existing.getFirst().getAmount() == amount) {
                return toResponse(wallet);
            }
            throw new ConflictException("Credit has already been recorded for this reference");
        }

        long balanceBefore = wallet.getBalance();
        long balanceAfter;
        try {
            balanceAfter = Math.addExact(balanceBefore, amount);
        } catch (ArithmeticException ex) {
            throw new BusinessException("Credit balance exceeds the supported range");
        }

        wallet.setBalance(balanceAfter);
        walletRepository.save(wallet);

        CreditTransaction transaction = recordTransaction(wallet, type, CreditTransactionDirection.CREDIT,
                amount, balanceBefore, referenceType, referenceId, description);

        log.info("Credit granted: transactionId={}, walletId={}, type={}, amount={}, "
                        + "balanceBefore={}, balanceAfter={}, referenceType={}, referenceId={}",
                transaction.getId(), wallet.getId(), type, amount, balanceBefore, balanceAfter,
                referenceType, referenceId);
        return toResponse(wallet);
    }

    /**
     * Trừ credit đúng một lần cho nguồn phát sinh và ghi lịch sử trong cùng transaction.
     */
    private CreditWalletResponse debitOnce(CreditWallet wallet,
                                           long amount,
                                           CreditTransactionType type,
                                           String referenceType,
                                           Long referenceId,
                                           String description) {
        List<CreditTransaction> existing = transactionRepository
                .findByReferenceTypeAndReferenceId(referenceType, referenceId);
        if (!existing.isEmpty()) {
            if (existing.size() == 1 && existing.getFirst().getWallet().getId().equals(wallet.getId())
                    && existing.getFirst().getType() == type
                    && existing.getFirst().getDirection() == CreditTransactionDirection.DEBIT
                    && existing.getFirst().getAmount() == amount) {
                return toResponse(wallet);
            }
            throw new ConflictException("Credit has already been recorded for this reference");
        }

        long balanceBefore = wallet.getBalance();
        if (balanceBefore < amount) {
            log.warn("Credit debit blocked by insufficient balance: walletId={}, type={}, amount={}, balance={}",
                    wallet.getId(), type, amount, balanceBefore);
            throw new BusinessException("Insufficient credit balance");
        }

        wallet.setBalance(balanceBefore - amount);
        walletRepository.save(wallet);

        CreditTransaction transaction = recordTransaction(wallet, type, CreditTransactionDirection.DEBIT,
                amount, balanceBefore, referenceType, referenceId, description);

        log.info("Credit debited: transactionId={}, walletId={}, type={}, amount={}, "
                        + "balanceBefore={}, balanceAfter={}, referenceType={}, referenceId={}",
                transaction.getId(), wallet.getId(), type, amount, balanceBefore, wallet.getBalance(),
                referenceType, referenceId);
        return toResponse(wallet);
    }

    private CreditTransaction recordTransaction(CreditWallet wallet,
                                                CreditTransactionType type,
                                                CreditTransactionDirection direction,
                                                long amount,
                                                long balanceBefore,
                                                String referenceType,
                                                Long referenceId,
                                                String description) {
        CreditTransaction transaction = new CreditTransaction();
        transaction.setWallet(wallet);
        transaction.setType(type);
        transaction.setDirection(direction);
        transaction.setAmount(amount);
        transaction.setBalanceBefore(balanceBefore);
        transaction.setBalanceAfter(wallet.getBalance());
        transaction.setReferenceType(referenceType);
        transaction.setReferenceId(referenceId);
        transaction.setDescription(description);
        return transactionRepository.save(transaction);
    }

    private CreditWalletResponse toResponse(CreditWallet wallet) {
        return new CreditWalletResponse(wallet.getId(), wallet.getBalance(),
                wallet.getReservedBalance(), wallet.getBalance());
    }
}
