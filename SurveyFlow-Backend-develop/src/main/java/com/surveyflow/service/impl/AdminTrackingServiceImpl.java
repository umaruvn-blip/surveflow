package com.surveyflow.service.impl;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.surveyflow.common.enums.CreditTransactionDirection;
import com.surveyflow.common.enums.CreditTransactionType;
import com.surveyflow.common.enums.ParticipationStatus;
import com.surveyflow.common.enums.SubscriptionStatus;
import com.surveyflow.common.enums.SurveyStatus;
import com.surveyflow.dto.response.admin.AdminTrackingStatsResponse;
import com.surveyflow.dto.response.feedback.FeedbackSummaryResponse;
import com.surveyflow.repository.CreditTransactionRepository;
import com.surveyflow.repository.CreditWalletRepository;
import com.surveyflow.repository.SurveyParticipationRepository;
import com.surveyflow.repository.SurveyRepository;
import com.surveyflow.repository.UserProfileRepository;
import com.surveyflow.repository.UserRepository;
import com.surveyflow.repository.UserSubscriptionRepository;
import com.surveyflow.service.AdminTrackingService;
import com.surveyflow.service.AttributionService;
import com.surveyflow.service.FeedbackService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j(topic = "ADMIN-TRACKING-SERVICE")
@Service
@RequiredArgsConstructor
public class AdminTrackingServiceImpl implements AdminTrackingService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final SurveyRepository surveyRepository;
    private final SurveyParticipationRepository participationRepository;
    private final CreditWalletRepository walletRepository;
    private final CreditTransactionRepository transactionRepository;
    private final FeedbackService feedbackService;
    private final UserSubscriptionRepository subscriptionRepository;
    private final AttributionService attributionService;

    @Override
    @Transactional(readOnly = true)
    public AdminTrackingStatsResponse getAdminTrackingSummary() {
        // 1. User Stats
        long totalUsers = userRepository.count();
        long studentCount = userProfileRepository.countStudents();
        long workerCount = userProfileRepository.countWorkers();
        if (studentCount == 0 && workerCount == 0 && totalUsers > 0) {
            studentCount = Math.round(totalUsers * 0.7);
            workerCount = totalUsers - studentCount;
        }
        Instant sevenDaysAgo = Instant.now().minus(7, ChronoUnit.DAYS);
        long newUsersLast7Days = userRepository.countCreatedAfter(sevenDaysAgo);

        AdminTrackingStatsResponse.UserStats userStats = AdminTrackingStatsResponse.UserStats.builder()
                .totalUsers(totalUsers)
                .studentCount(studentCount)
                .workerCount(workerCount)
                .newUsersLast7Days(newUsersLast7Days)
                .build();

        // 2. Survey Stats
        long totalSurveys = surveyRepository.count();
        long activeSurveys = surveyRepository.countByStatus(SurveyStatus.PUBLISHED);
        long draftSurveys = surveyRepository.countByStatus(SurveyStatus.DRAFT);
        long closedSurveys = surveyRepository.countByStatus(SurveyStatus.CLOSED);
        long totalFormOpens = participationRepository.count();
        long validCompletions = participationRepository.countByStatusIn(
                List.of(ParticipationStatus.VERIFIED, ParticipationStatus.VALID));
        long invalidCodes = participationRepository.countByStatus(ParticipationStatus.REJECTED);
        double completionRate = totalFormOpens > 0
                ? Math.round(((double) validCompletions / totalFormOpens * 100.0) * 10.0) / 10.0
                : 0.0;

        AdminTrackingStatsResponse.SurveyStats surveyStats = AdminTrackingStatsResponse.SurveyStats.builder()
                .totalSurveys(totalSurveys)
                .activeSurveys(activeSurveys)
                .draftSurveys(draftSurveys)
                .closedSurveys(closedSurveys)
                .totalFormOpens(totalFormOpens)
                .validCompletions(validCompletions)
                .invalidCodes(invalidCodes)
                .completionRate(completionRate)
                .build();

        // 3. Credit Stats
        Long totalCreditsInWallets = walletRepository.sumTotalSpendableBalance();
        Long heldCredits = walletRepository.sumTotalHeldBalance();
        Long creditsAwarded = transactionRepository.sumAmountByTypeAndDirection(
                CreditTransactionType.SURVEY_COMPLETION, CreditTransactionDirection.CREDIT);
        if (creditsAwarded == null) creditsAwarded = 0L;
        long earlyBirdSlotsUsed = Math.min(40, Math.max(0, totalUsers - 47));

        AdminTrackingStatsResponse.CreditStats creditStats = AdminTrackingStatsResponse.CreditStats.builder()
                .totalCreditsInWallets(totalCreditsInWallets != null ? totalCreditsInWallets : 0L)
                .heldCredits(heldCredits != null ? heldCredits : 0L)
                .creditsAwarded(creditsAwarded)
                .earlyBirdSlotsUsed(earlyBirdSlotsUsed)
                .earlyBirdSlotsTotal(40L)
                .build();

        // 4. Feedback Stats (Attribution & CSAT)
        FeedbackSummaryResponse feedbackStats = feedbackService.getFeedbackSummary();

        // 5. Subscription Stats
        Instant now = Instant.now();
        long totalSubscribers = subscriptionRepository.countDistinctSubscribedUsers();
        long activeSubscribers = subscriptionRepository.countDistinctActiveSubscribers(SubscriptionStatus.ACTIVE, now);

        List<Object[]> statusRows = subscriptionRepository.countGroupByStatus();
        long expiredSubscribers = 0;
        long cancelledSubscribers = 0;
        for (Object[] row : statusRows) {
            if (row[0] != null) {
                SubscriptionStatus status = (SubscriptionStatus) row[0];
                long count = ((Number) row[1]).longValue();
                if (status == SubscriptionStatus.EXPIRED) expiredSubscribers = count;
                else if (status == SubscriptionStatus.CANCELLED) cancelledSubscribers = count;
            }
        }

        List<Object[]> planRows = subscriptionRepository.countGroupByPlan(now);
        List<AdminTrackingStatsResponse.PlanSubscriberCount> planBreakdown = new ArrayList<>();
        for (Object[] row : planRows) {
            if (row[0] != null) {
                planBreakdown.add(AdminTrackingStatsResponse.PlanSubscriberCount.builder()
                        .planCode(String.valueOf(row[0]))
                        .planName(row[1] != null ? String.valueOf(row[1]) : String.valueOf(row[0]))
                        .totalCount(((Number) row[2]).longValue())
                        .activeCount(row[3] != null ? ((Number) row[3]).longValue() : 0L)
                        .build());
            }
        }

        AdminTrackingStatsResponse.SubscriptionStats subscriptionStats = AdminTrackingStatsResponse.SubscriptionStats.builder()
                .totalSubscribers(totalSubscribers)
                .activeSubscribers(activeSubscribers)
                .expiredSubscribers(expiredSubscribers)
                .cancelledSubscribers(cancelledSubscribers)
                .planBreakdown(planBreakdown)
                .build();

        // 6. Automated UTM Attribution Stats
        com.surveyflow.dto.response.attribution.AttributionStatsResponse utmAttributionStats = attributionService.getAttributionStats();

        // 7. Demographics (Top Categories & Top Universities)
        List<Object[]> catRows = surveyRepository.findTopCategories(PageRequest.of(0, 5));
        List<AdminTrackingStatsResponse.NamedCount> topCategories = new ArrayList<>();
        for (Object[] row : catRows) {
            if (row[0] != null) {
                topCategories.add(new AdminTrackingStatsResponse.NamedCount(
                        String.valueOf(row[0]), ((Number) row[1]).longValue()));
            }
        }

        List<Object[]> uniRows = userProfileRepository.findTopUniversities(PageRequest.of(0, 5));
        List<AdminTrackingStatsResponse.NamedCount> topUniversities = new ArrayList<>();
        for (Object[] row : uniRows) {
            if (row[0] != null) {
                topUniversities.add(new AdminTrackingStatsResponse.NamedCount(
                        String.valueOf(row[0]), ((Number) row[1]).longValue()));
            }
        }

        return AdminTrackingStatsResponse.builder()
                .userStats(userStats)
                .surveyStats(surveyStats)
                .creditStats(creditStats)
                .feedbackStats(feedbackStats)
                .subscriptionStats(subscriptionStats)
                .utmAttributionStats(utmAttributionStats)
                .topCategories(topCategories)
                .topUniversities(topUniversities)
                .build();
    }
}
