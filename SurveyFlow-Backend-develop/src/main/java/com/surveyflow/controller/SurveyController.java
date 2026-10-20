package com.surveyflow.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.surveyflow.dto.request.survey.SurveyUpsertRequest;
import com.surveyflow.dto.response.ApiResponse;
import com.surveyflow.dto.response.PageResponse;
import com.surveyflow.dto.response.survey.ParticipationResponse;
import com.surveyflow.dto.response.survey.SurveyResponse;
import com.surveyflow.dto.response.survey.SurveySummaryResponse;
import com.surveyflow.dto.response.survey.SurveyTrackingSummaryResponse;
import com.surveyflow.dto.response.survey.WebhookConfigurationResponse;
import com.surveyflow.factory.ApiResponseFactory;
import com.surveyflow.security.model.UserPrincipal;
import com.surveyflow.service.SurveyParticipationService;
import com.surveyflow.service.SurveyService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j(topic = "SURVEY-CONTROLLER")
@RestController
@RequestMapping("/api/v1/surveys")
@RequiredArgsConstructor
@Validated
public class SurveyController {

    private final SurveyService surveyService;
    private final SurveyParticipationService participationService;
    private final ApiResponseFactory responseFactory;

    /** Tạo survey draft cho creator hiện tại. */
    @PostMapping
    public ResponseEntity<ApiResponse<SurveyResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody SurveyUpsertRequest request) {
        log.info("Create survey requested: creatorId={}", principal.getId());
        return ResponseEntity.status(201)
                .body(responseFactory.created(
                        surveyService.create(principal.getId(), request),
                        "Survey draft created"));
    }

    /** Cập nhật toàn bộ cấu hình của survey draft. */
    @PutMapping("/{surveyId}")
    public ResponseEntity<ApiResponse<SurveyResponse>> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long surveyId,
            @Valid @RequestBody SurveyUpsertRequest request) {
        log.info("Update survey requested: surveyId={}, creatorId={}", surveyId, principal.getId());
        return ResponseEntity.ok(responseFactory.success(
                surveyService.update(principal.getId(), surveyId, request),
                "Survey draft updated"));
    }

    /** Lấy danh sách survey của creator hiện tại. */
    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<PageResponse<SurveySummaryResponse>>> findMine(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDir) {
        return ResponseEntity.ok(responseFactory.success(
                surveyService.findMine(principal.getId(), page, size, sortBy, sortDir)));
    }

    /** Lấy báo cáo tổng hợp theo dõi khảo sát. Mặc định là "mine" (khảo sát của tôi), hỗ trợ "global" (toàn sàn). */
    @GetMapping("/tracking-summary")
    public ResponseEntity<ApiResponse<SurveyTrackingSummaryResponse>> getTrackingSummary(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "mine") String scope) {
        return ResponseEntity.ok(responseFactory.success(
                surveyService.getTrackingSummary(principal.getId(), scope)));
    }

    /** Lấy danh sách survey user hiện tại có thể tham gia. */
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<SurveySummaryResponse>>> discover(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDir) {
        return ResponseEntity.ok(responseFactory.success(
                surveyService.discover(principal.getId(), page, size, sortBy, sortDir)));
    }

    /** Lấy chi tiết survey user hiện tại được phép xem. */
    @GetMapping("/{surveyId}")
    public ResponseEntity<ApiResponse<SurveyResponse>> get(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long surveyId) {
        return ResponseEntity.ok(responseFactory.success(
                surveyService.get(principal.getId(), surveyId)));
    }

    /** Tạo lại token và đường dẫn webhook cho Google Forms. */
    @PostMapping("/{surveyId}/webhook-configuration")
    public ResponseEntity<ApiResponse<WebhookConfigurationResponse>> configureWebhook(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long surveyId) {
        log.info("Configure webhook requested: surveyId={}, creatorId={}", surveyId, principal.getId());
        return ResponseEntity.ok(responseFactory.success(
                surveyService.configureWebhook(principal.getId(), surveyId),
                "Webhook configuration created"));
    }

    /** Publish survey sau khi các điều kiện nghiệp vụ được đáp ứng. */
    @PostMapping("/{surveyId}/publish")
    public ResponseEntity<ApiResponse<SurveyResponse>> publish(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long surveyId) {
        log.info("Publish survey requested: surveyId={}, creatorId={}", surveyId, principal.getId());
        return ResponseEntity.ok(responseFactory.success(
                surveyService.publish(principal.getId(), surveyId),
                "Survey published"));
    }

    /** Đóng survey đang hoạt động. */
    @PostMapping("/{surveyId}/close")
    public ResponseEntity<ApiResponse<SurveyResponse>> close(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long surveyId) {
        log.info("Close survey requested: surveyId={}, creatorId={}", surveyId, principal.getId());
        return ResponseEntity.ok(responseFactory.success(
                surveyService.close(principal.getId(), surveyId),
                "Survey closed"));
    }

    /** Giữ một slot tham gia survey cho user hiện tại. */
    @PostMapping("/{surveyId}/participations")
    public ResponseEntity<ApiResponse<ParticipationResponse>> reserve(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long surveyId) {
        log.info("Reserve survey slot requested: surveyId={}, userId={}", surveyId, principal.getId());
        return ResponseEntity.status(201)
                .body(responseFactory.created(
                        participationService.reserve(principal.getId(), surveyId),
                        "Survey slot reserved"));
    }
}
