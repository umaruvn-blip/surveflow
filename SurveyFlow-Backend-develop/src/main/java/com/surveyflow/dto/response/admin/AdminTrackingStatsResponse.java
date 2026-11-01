package com.surveyflow.dto.response.admin;

import java.util.List;
import java.util.Map;

import com.surveyflow.dto.response.feedback.FeedbackSummaryResponse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminTrackingStatsResponse {

    // 1. KPI & User Growth
    private UserStats userStats;

    // 2. Survey & Participation Activity
    private SurveyStats surveyStats;

    // 3. Economy & Credits
    private CreditStats creditStats;

    // 4. Feedback & Channel Attribution
    private FeedbackSummaryResponse feedbackStats;

    // 5. Subscription Stats
    private SubscriptionStats subscriptionStats;

    // 6. Automated UTM Attribution Tracking
    private com.surveyflow.dto.response.attribution.AttributionStatsResponse utmAttributionStats;

    // 7. Demographics / Top Categories, Universities & Occupations
    private List<NamedCount> topCategories;
    private List<NamedCount> topUniversities;
    private List<NamedCount> topOccupations;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserStats {
        private long totalUsers;
        private long studentCount;
        private long workerCount;
        private long newUsersLast7Days;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SurveyStats {
        private long totalSurveys;
        private long activeSurveys;
        private long draftSurveys;
        private long closedSurveys;
        private long totalFormOpens;
        private long validCompletions;
        private long invalidCodes;
        private double completionRate;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreditStats {
        private long totalCreditsInWallets;
        private long heldCredits;
        private long creditsAwarded;
        private long earlyBirdSlotsUsed;
        private long earlyBirdSlotsTotal;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubscriptionStats {
        private long totalSubscribers;
        private long activeSubscribers;
        private long expiredSubscribers;
        private long cancelledSubscribers;
        private List<PlanSubscriberCount> planBreakdown;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlanSubscriberCount {
        private String planCode;
        private String planName;
        private long totalCount;
        private long activeCount;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NamedCount {
        private String name;
        private long count;
    }
}
