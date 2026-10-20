package com.surveyflow.dto.response.attribution;

import java.time.Instant;
import java.util.List;

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
public class AttributionStatsResponse {

    private long totalVisits;
    private long totalConversions;
    private double overallConversionRate;
    private List<SourceAttributionDto> sourceBreakdown;
    private List<CampaignAttributionDto> campaignBreakdown;
    private List<RecentVisitDto> recentVisits;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SourceAttributionDto {
        private String source;
        private long visits;
        private long conversions;
        private double conversionRate;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CampaignAttributionDto {
        private String campaign;
        private long visits;
        private long conversions;
        private double conversionRate;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentVisitDto {
        private Long id;
        private String utmSource;
        private String utmMedium;
        private String utmCampaign;
        private String landingPage;
        private boolean converted;
        private Long userId;
        private Instant createdAt;
    }
}
