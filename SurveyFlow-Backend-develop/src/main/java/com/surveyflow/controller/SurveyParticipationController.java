package com.surveyflow.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.surveyflow.dto.request.survey.VerifyParticipationRequest;
import com.surveyflow.dto.response.ApiResponse;
import com.surveyflow.dto.response.survey.CompletionCodeResponse;
import com.surveyflow.dto.response.survey.ParticipationResponse;
import com.surveyflow.factory.ApiResponseFactory;
import com.surveyflow.security.model.UserPrincipal;
import com.surveyflow.service.SurveyParticipationService;
import org.springframework.web.bind.annotation.RequestBody;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j(topic = "SURVEY-PARTICIPATION-CONTROLLER")
@RestController
@RequestMapping("/api/v1/participations")
@RequiredArgsConstructor
public class SurveyParticipationController {

    private final SurveyParticipationService participationService;
    private final ApiResponseFactory responseFactory;

    /** Lấy lượt tham gia thuộc user hiện tại. */
    @GetMapping("/{publicId}")
    public ResponseEntity<ApiResponse<ParticipationResponse>> get(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String publicId) {
        return ResponseEntity.ok(responseFactory.success(
                participationService.get(principal.getId(), publicId)));
    }

    /** Phát completion code cho lượt tham gia đủ điều kiện. */
    @PostMapping("/{publicId}/verification-code")
    public ResponseEntity<ApiResponse<CompletionCodeResponse>> issueCode(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String publicId) {
        log.info("Issue completion code requested: userId={}, participationId={}", principal.getId(), publicId);
        return ResponseEntity.ok(responseFactory.success(
                participationService.issueCompletionCode(principal.getId(), publicId),
                "Completion code issued"));
    }

    /** Xác nhận hoàn thành khảo sát qua Google Forms API. */
    @PostMapping("/{publicId}/verify")
    public ResponseEntity<ApiResponse<ParticipationResponse>> verify(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String publicId,
            @RequestBody(required = false) VerifyParticipationRequest request) {
        log.info("Verify participation requested: userId={}, participationId={}", principal.getId(), publicId);
        return ResponseEntity.ok(responseFactory.success(
                participationService.verify(principal.getId(), publicId, request),
                "Khảo sát đã được xác nhận hoàn thành"));
    }

    /** Hủy lượt tham gia đang giữ slot. */
    @PostMapping("/{publicId}/cancel")
    public ResponseEntity<ApiResponse<ParticipationResponse>> cancel(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String publicId) {
        log.info("Cancel participation requested: userId={}, participationId={}", principal.getId(), publicId);
        return ResponseEntity.ok(responseFactory.success(
                participationService.cancel(principal.getId(), publicId),
                "Participation cancelled"));
    }
}
