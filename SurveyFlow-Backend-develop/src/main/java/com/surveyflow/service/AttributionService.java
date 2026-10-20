package com.surveyflow.service;

import com.surveyflow.dto.request.attribution.RecordAttributionRequest;
import com.surveyflow.dto.response.attribution.AttributionStatsResponse;

public interface AttributionService {

    void recordVisit(RecordAttributionRequest request, Long userId);

    void markConversion(String sessionId, Long userId);

    AttributionStatsResponse getAttributionStats();
}
