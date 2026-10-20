package com.surveyflow.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.surveyflow.dto.request.feedback.CreateFeedbackRequest;
import com.surveyflow.dto.response.ApiResponse;
import com.surveyflow.dto.response.feedback.FeedbackSummaryResponse;
import com.surveyflow.factory.ApiResponseFactory;
import com.surveyflow.security.model.UserPrincipal;
import com.surveyflow.service.FeedbackService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j(topic = "FEEDBACK-CONTROLLER")
@RestController
@RequestMapping("/api/v1/feedbacks")
@RequiredArgsConstructor
@Validated
@Tag(name = "Feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;
    private final ApiResponseFactory responseFactory;

    /**
     * Gửi phản hồi / góp ý trải nghiệm và nguồn tiếp cận.
     */
    @PostMapping
    @Operation(summary = "Submit user feedback & channel attribution")
    public ResponseEntity<ApiResponse<Void>> createFeedback(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateFeedbackRequest request) {
        Long userId = (principal != null) ? principal.getId() : null;
        log.info("Create feedback requested: userId={}", userId);
        feedbackService.createFeedback(userId, request);
        return ResponseEntity.status(201)
                .body(responseFactory.created(null, "Cảm ơn bạn đã gửi phản hồi và góp ý cho SurveyFlow!"));
    }

    /**
     * Lấy báo cáo tổng hợp phản hồi và các góp ý mới nhất.
     */
    @GetMapping("/summary")
    @Operation(summary = "Get feedback summary and channel attribution stats")
    public ResponseEntity<ApiResponse<FeedbackSummaryResponse>> getFeedbackSummary() {
        return ResponseEntity.ok(responseFactory.success(
                feedbackService.getFeedbackSummary(),
                "Feedback summary retrieved successfully"));
    }
}
