package com.surveyflow.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.surveyflow.dto.response.ApiResponse;
import com.surveyflow.dto.response.survey.SurveyRecommendationResponse;
import com.surveyflow.factory.ApiResponseFactory;
import com.surveyflow.security.model.UserPrincipal;
import com.surveyflow.service.SurveyRecommendationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/surveys")
@RequiredArgsConstructor
@Tag(name = "Survey Recommendations", description = "AI-powered survey recommendation endpoints")
public class SurveyRecommendationController {

    private final SurveyRecommendationService surveyRecommendationService;
    private final ApiResponseFactory apiResponseFactory;

    @GetMapping("/recommendations")
    @Operation(summary = "Get personalized survey recommendations", description = "Returns top matched active surveys for the current user based on profile and interests")
    public ResponseEntity<ApiResponse<List<SurveyRecommendationResponse>>> getRecommendations(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(name = "limit", required = false, defaultValue = "10") Integer limit
    ) {
        Long userId = principal != null ? principal.getId() : null;
        List<SurveyRecommendationResponse> recommendations = surveyRecommendationService.getRecommendedSurveys(userId, limit);

        return ResponseEntity.ok(
                apiResponseFactory.success(recommendations, "Recommended surveys retrieved successfully")
        );
    }
}
