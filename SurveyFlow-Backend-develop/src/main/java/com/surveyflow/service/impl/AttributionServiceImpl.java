package com.surveyflow.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.surveyflow.dto.request.attribution.RecordAttributionRequest;
import com.surveyflow.dto.response.attribution.AttributionStatsResponse;
import com.surveyflow.model.TrafficAttribution;
import com.surveyflow.model.User;
import com.surveyflow.repository.TrafficAttributionRepository;
import com.surveyflow.repository.UserRepository;
import com.surveyflow.service.AttributionService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j(topic = "ATTRIBUTION-SERVICE")
@Service
@RequiredArgsConstructor
public class AttributionServiceImpl implements AttributionService {

    private final TrafficAttributionRepository attributionRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void recordVisit(RecordAttributionRequest request, Long userId) {
        if (request == null || request.getUtmSource() == null || request.getUtmSource().isBlank()) {
            return;
        }

        String utmSource = request.getUtmSource().trim().toLowerCase();
        String sessionId = request.getSessionId();

        // Kiểm tra xem session này đã ghi nhận cùng utmSource chưa để tránh tạo bản ghi trùng lặp
        if (sessionId != null && !sessionId.isBlank()) {
            java.util.Optional<TrafficAttribution> existing = attributionRepository.findFirstBySessionIdAndUtmSource(sessionId, utmSource);
            if (existing.isPresent()) {
                TrafficAttribution attr = existing.get();
                if (request.getLandingPage() != null) attr.setLandingPage(request.getLandingPage());
                if (request.getReferrerUrl() != null) attr.setReferrerUrl(request.getReferrerUrl());
                attributionRepository.save(attr);
                return;
            }
        }

        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }

        TrafficAttribution attribution = TrafficAttribution.builder()
                .sessionId(sessionId)
                .utmSource(utmSource)
                .utmMedium(request.getUtmMedium() != null ? request.getUtmMedium().trim().toLowerCase() : null)
                .utmCampaign(request.getUtmCampaign() != null ? request.getUtmCampaign().trim() : null)
                .utmContent(request.getUtmContent())
                .utmTerm(request.getUtmTerm())
                .landingPage(request.getLandingPage())
                .referrerUrl(request.getReferrerUrl())
                .converted(false)
                .user(user)
                .build();

        attributionRepository.save(attribution);
        log.info("Recorded UTM visit: source={}, medium={}, campaign={}, sessionId={}",
                attribution.getUtmSource(), attribution.getUtmMedium(), attribution.getUtmCampaign(), attribution.getSessionId());
    }

    @Override
    @Transactional
    public void markConversion(String sessionId, Long userId) {
        if (sessionId == null || sessionId.isBlank()) {
            return;
        }

        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }

        List<TrafficAttribution> attributions = attributionRepository.findBySessionId(sessionId);
        for (TrafficAttribution attr : attributions) {
            attr.setConverted(true);
            if (user != null && attr.getUser() == null) {
                attr.setUser(user);
            }
        }
        if (!attributions.isEmpty()) {
            attributionRepository.saveAll(attributions);
            log.info("Marked conversion for sessionId={}, userId={}", sessionId, userId);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public AttributionStatsResponse getAttributionStats() {
        long totalVisits = attributionRepository.countUniqueVisits();
        long totalConversions = attributionRepository.countConverted();
        double overallConversionRate = totalVisits > 0
                ? Math.round(((double) totalConversions / totalVisits * 100.0) * 10.0) / 10.0
                : 0.0;

        List<Object[]> sourceRows = attributionRepository.countVisitsAndConversionsBySource();
        List<AttributionStatsResponse.SourceAttributionDto> sourceBreakdown = new ArrayList<>();
        for (Object[] row : sourceRows) {
            if (row[0] != null) {
                String source = String.valueOf(row[0]);
                long visits = ((Number) row[1]).longValue();
                long conversions = row[2] != null ? ((Number) row[2]).longValue() : 0L;
                double rate = visits > 0 ? Math.round(((double) conversions / visits * 100.0) * 10.0) / 10.0 : 0.0;
                sourceBreakdown.add(AttributionStatsResponse.SourceAttributionDto.builder()
                        .source(source)
                        .visits(visits)
                        .conversions(conversions)
                        .conversionRate(rate)
                        .build());
            }
        }

        List<Object[]> campaignRows = attributionRepository.countVisitsAndConversionsByCampaign();
        List<AttributionStatsResponse.CampaignAttributionDto> campaignBreakdown = new ArrayList<>();
        for (Object[] row : campaignRows) {
            if (row[0] != null) {
                String campaign = String.valueOf(row[0]);
                long visits = ((Number) row[1]).longValue();
                long conversions = row[2] != null ? ((Number) row[2]).longValue() : 0L;
                double rate = visits > 0 ? Math.round(((double) conversions / visits * 100.0) * 10.0) / 10.0 : 0.0;
                campaignBreakdown.add(AttributionStatsResponse.CampaignAttributionDto.builder()
                        .campaign(campaign)
                        .visits(visits)
                        .conversions(conversions)
                        .conversionRate(rate)
                        .build());
            }
        }

        List<TrafficAttribution> recentEntities = attributionRepository.findTop15ByOrderByCreatedAtDesc();
        List<AttributionStatsResponse.RecentVisitDto> recentVisits = new ArrayList<>();
        for (TrafficAttribution attr : recentEntities) {
            recentVisits.add(AttributionStatsResponse.RecentVisitDto.builder()
                    .id(attr.getId())
                    .utmSource(attr.getUtmSource())
                    .utmMedium(attr.getUtmMedium())
                    .utmCampaign(attr.getUtmCampaign())
                    .landingPage(attr.getLandingPage())
                    .converted(attr.isConverted())
                    .userId(attr.getUser() != null ? attr.getUser().getId() : null)
                    .createdAt(attr.getCreatedAt())
                    .build());
        }

        return AttributionStatsResponse.builder()
                .totalVisits(totalVisits)
                .totalConversions(totalConversions)
                .overallConversionRate(overallConversionRate)
                .sourceBreakdown(sourceBreakdown)
                .campaignBreakdown(campaignBreakdown)
                .recentVisits(recentVisits)
                .build();
    }
}
