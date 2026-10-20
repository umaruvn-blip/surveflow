package com.surveyflow.controller;

import java.time.Instant;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.surveyflow.dto.request.googleforms.GoogleFormsCallbackRequest;
import com.surveyflow.dto.response.ApiResponse;
import com.surveyflow.dto.response.googleforms.GoogleFormItemResponse;
import com.surveyflow.dto.response.googleforms.GoogleFormVerifyResponse;
import com.surveyflow.dto.response.googleforms.GoogleFormsConnectionStatusResponse;
import com.surveyflow.factory.ApiResponseFactory;
import com.surveyflow.security.model.UserPrincipal;
import com.surveyflow.service.GoogleFormsClientService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j(topic = "GOOGLE-FORMS-CONTROLLER")
@RestController
@RequestMapping("/api/v1/google-forms")
@RequiredArgsConstructor
@Validated
@Tag(name = "Google Forms Integration")
public class GoogleFormsController {

    private final GoogleFormsClientService googleFormsService;
    private final ApiResponseFactory responseFactory;

    /**
     * Lấy URL để chuyển hướng người dùng sang trang cấp quyền Google Forms.
     */
    @GetMapping("/auth-url")
    @Operation(summary = "Get Google OAuth authorization URL for Google Forms access")
    public ResponseEntity<ApiResponse<String>> getAuthUrl(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("redirectUri") String redirectUri) {
        String authUrl = googleFormsService.buildAuthorizationUrl(principal.getId(), redirectUri);
        return ResponseEntity.ok(responseFactory.success(authUrl, "Authorization URL generated"));
    }

    /**
     * Nhận Authorization Code từ Google OAuth callback để lưu kết nối và lấy Token.
     */
    @PostMapping("/callback")
    @Operation(summary = "Exchange authorization code and link Google Forms account")
    public ResponseEntity<ApiResponse<GoogleFormsConnectionStatusResponse>> handleCallback(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody GoogleFormsCallbackRequest request) {
        log.info("Connecting Google Forms for user {}: redirectUri={}", principal.getId(), request.getRedirectUri());
        GoogleFormsConnectionStatusResponse status = googleFormsService.exchangeCodeAndConnect(
                principal.getId(), request.getCode(), request.getRedirectUri());
        return ResponseEntity.ok(responseFactory.success(status, "Google Forms connected successfully"));
    }

    /**
     * Lấy trạng thái kết nối tài khoản Google Forms của người dùng hiện tại.
     */
    @GetMapping("/status")
    @Operation(summary = "Get current Google Forms connection status")
    public ResponseEntity<ApiResponse<GoogleFormsConnectionStatusResponse>> getStatus(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(responseFactory.success(
                googleFormsService.getConnectionStatus(principal.getId()),
                "Connection status retrieved"));
    }

    /**
     * Ngắt kết nối tài khoản Google Forms.
     */
    @DeleteMapping("/disconnect")
    @Operation(summary = "Disconnect linked Google Forms account")
    public ResponseEntity<ApiResponse<Void>> disconnect(
            @AuthenticationPrincipal UserPrincipal principal) {
        googleFormsService.disconnect(principal.getId());
        return ResponseEntity.ok(responseFactory.success(null, "Google Forms disconnected successfully"));
    }

    /**
     * Lấy danh sách các Google Forms từ tài khoản Google Drive đã liên kết.
     */
    @GetMapping("/forms")
    @Operation(summary = "List all Google Forms owned by the linked Google account")
    public ResponseEntity<ApiResponse<List<GoogleFormItemResponse>>> listForms(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(responseFactory.success(
                googleFormsService.listUserForms(principal.getId()),
                "Google Forms list retrieved"));
    }

    /**
     * Lấy chi tiết thông tin của một Google Form.
     */
    @GetMapping("/forms/{formId}")
    @Operation(summary = "Get details of a specific Google Form")
    public ResponseEntity<ApiResponse<GoogleFormItemResponse>> getFormDetails(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("formId") String formId) {
        return ResponseEntity.ok(responseFactory.success(
                googleFormsService.getFormDetails(principal.getId(), formId),
                "Google Form details retrieved"));
    }

    @GetMapping("/details")
    @Operation(summary = "Get details of a specific Google Form via query param")
    public ResponseEntity<ApiResponse<GoogleFormItemResponse>> getFormDetailsQuery(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("formId") String formId) {
        return ResponseEntity.ok(responseFactory.success(
                googleFormsService.getFormDetails(principal.getId(), formId),
                "Google Form details retrieved"));
    }

    /**
     * Kiểm tra biểu mẫu Google Form có câu hỏi mã xác nhận SurveyFlow hay không.
     */
    @GetMapping("/forms/{formId}/check-completion-question")
    @Operation(summary = "Check if a Google Form contains the required SurveyFlow completion code question")
    public ResponseEntity<ApiResponse<Boolean>> checkCompletionCodeQuestion(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("formId") String formId) {
        boolean hasQuestion = googleFormsService.hasCompletionCodeQuestion(principal.getId(), formId);
        String message = hasQuestion
                ? "Google Form đã có câu hỏi 'Mã xác nhận SurveyFlow' hợp lệ."
                : "Google Form chưa có câu hỏi 'Mã xác nhận SurveyFlow'. Vui lòng thêm vào Google Form.";
        return ResponseEntity.ok(responseFactory.success(hasQuestion, message));
    }

    @GetMapping("/check-completion-question")
    @Operation(summary = "Check if a Google Form contains the required SurveyFlow completion code question via query param")
    public ResponseEntity<ApiResponse<Boolean>> checkCompletionCodeQuestionQuery(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("formId") String formId) {
        boolean hasQuestion = googleFormsService.hasCompletionCodeQuestion(principal.getId(), formId);
        String message = hasQuestion
                ? "Google Form đã có câu hỏi 'Mã xác nhận SurveyFlow' hợp lệ."
                : "Google Form chưa có câu hỏi 'Mã xác nhận SurveyFlow'. Vui lòng thêm vào Google Form.";
        return ResponseEntity.ok(responseFactory.success(hasQuestion, message));
    }

    /**
     * Xác thực phản hồi trực tiếp từ Google Forms API.
     */
    @PostMapping("/verify")
    @Operation(summary = "Verify submission via Google Forms API")
    public ResponseEntity<ApiResponse<GoogleFormVerifyResponse>> verifyResponse(
            @RequestParam("creatorUserId") Long creatorUserId,
            @RequestParam("formId") String formId,
            @RequestParam(value = "targetCode", required = false) String targetCode,
            @RequestParam(value = "afterTimestamp", required = false) Instant afterTimestamp) {
        GoogleFormVerifyResponse result = googleFormsService.verifyResponse(creatorUserId, formId, targetCode, afterTimestamp);
        return ResponseEntity.ok(responseFactory.success(result, result.getMessage()));
    }
}
