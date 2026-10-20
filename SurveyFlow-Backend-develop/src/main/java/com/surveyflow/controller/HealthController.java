package com.surveyflow.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.surveyflow.dto.response.ApiResponse;
import com.surveyflow.factory.ApiResponseFactory;

@RestController
@RequestMapping("/api/v1/health")
public class HealthController {

    private final ApiResponseFactory apiResponseFactory;

    public HealthController(ApiResponseFactory apiResponseFactory) {
        this.apiResponseFactory = apiResponseFactory;
    }

    /** Kiểm tra trạng thái sống của service. */
    @GetMapping
    public ApiResponse<Map<String, String>> health() {
        return apiResponseFactory.success(Map.of("status", "UP"), "Service is running");
    }
}
