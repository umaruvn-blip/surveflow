package com.surveyflow.service.client;

import java.time.Duration;

import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.surveyflow.config.properties.AppAiMatchingProperties;
import com.surveyflow.dto.request.aimatching.AiMatchRequest;
import com.surveyflow.dto.response.aimatching.AiMatchResponse;
import lombok.extern.slf4j.Slf4j;

@Slf4j(topic = "AI-MATCHING-CLIENT")
@Component
public class AiMatchingClient {

    private final RestClient restClient;
    private final AppAiMatchingProperties properties;

    public AiMatchingClient(AppAiMatchingProperties properties) {
        this.properties = properties;

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofMillis(properties.timeoutMs()));
        requestFactory.setReadTimeout(Duration.ofMillis(properties.timeoutMs()));

        this.restClient = RestClient.builder()
                .baseUrl(properties.serviceUrl())
                .requestFactory(requestFactory)
                .build();
    }

    /**
     * Gửi yêu cầu so khớp embedding sang Python AI Service.
     * Trả về null nếu service offline hoặc gặp lỗi để fallback an toàn.
     */
    public AiMatchResponse matchSurveys(AiMatchRequest request) {
        try {
            log.info("Sending match request to AI Service for {} surveys", request.surveys().size());

            return restClient.post()
                    .uri("/api/v1/match")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(AiMatchResponse.class);
        } catch (Exception e) {
            log.warn("AI Matching Service call failed: cause={}; using default ordering",
                    e.getClass().getSimpleName());
            return null;
        }
    }
}
