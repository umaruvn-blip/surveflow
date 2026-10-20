package com.surveyflow.config.properties;

import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.cors")
public record AppCorsProperties(
        List<String> allowedOrigins,
        List<String> allowedMethods,
        List<String> allowedHeaders,
        List<String> exposedHeaders,
        boolean allowCredentials,
        long maxAge
) {
    public AppCorsProperties {
        allowedOrigins = allowedOrigins == null ? new ArrayList<>() : allowedOrigins;
        allowedMethods = allowedMethods == null ? new ArrayList<>() : allowedMethods;
        allowedHeaders = allowedHeaders == null ? new ArrayList<>() : allowedHeaders;
        exposedHeaders = exposedHeaders == null ? new ArrayList<>() : exposedHeaders;
    }
}
