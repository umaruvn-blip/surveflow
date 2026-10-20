package com.surveyflow.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.ai-matching")
public record AppAiMatchingProperties(
        String serviceUrl,
        int defaultTopK,
        long timeoutMs
) {
    public AppAiMatchingProperties {
        serviceUrl = (serviceUrl == null || serviceUrl.isBlank()) ? "http://localhost:8000" : serviceUrl;
        defaultTopK = defaultTopK <= 0 ? 10 : defaultTopK;
        timeoutMs = timeoutMs <= 0 ? 5000 : timeoutMs;
    }
}
