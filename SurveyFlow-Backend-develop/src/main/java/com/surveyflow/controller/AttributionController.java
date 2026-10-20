package com.surveyflow.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.surveyflow.dto.request.attribution.RecordAttributionRequest;
import com.surveyflow.dto.response.ApiResponse;
import com.surveyflow.dto.response.attribution.AttributionStatsResponse;
import com.surveyflow.factory.ApiResponseFactory;
import com.surveyflow.security.model.UserPrincipal;
import com.surveyflow.service.AttributionService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j(topic = "ATTRIBUTION-CONTROLLER")
@RestController
@RequestMapping("/api/v1/attributions")
@RequiredArgsConstructor
@Validated
@Tag(name = "Attribution Tracking")
public class AttributionController {

    private final AttributionService attributionService;
    private final ApiResponseFactory responseFactory;

    /**
     * Tự động ghi nhận lượt truy cập có gắn tham số UTM.
     */
    @PostMapping("/record")
    @Operation(summary = "Automatically record UTM campaign traffic visit")
    public ResponseEntity<ApiResponse<Void>> recordVisit(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody RecordAttributionRequest request) {
        Long userId = (principal != null) ? principal.getId() : null;
        attributionService.recordVisit(request, userId);
        return ResponseEntity.status(201)
                .body(responseFactory.created(null, "Attribution visit recorded successfully"));
    }

    /**
     * Ghi nhận chuyển đổi (Conversion) khi người dùng đăng ký hoặc đăng nhập.
     */
    @PostMapping("/convert")
    @Operation(summary = "Mark UTM session as converted (user registered/logged in)")
    public ResponseEntity<ApiResponse<Void>> markConversion(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("sessionId") String sessionId) {
        Long userId = (principal != null) ? principal.getId() : null;
        attributionService.markConversion(sessionId, userId);
        return ResponseEntity.ok(responseFactory.success(null, "Conversion marked successfully"));
    }

    /**
     * Lấy báo cáo thống kê UTM Attribution dành cho Admin.
     */
    @GetMapping("/stats")
    @Operation(summary = "Get UTM attribution stats for Admin")
    public ResponseEntity<ApiResponse<AttributionStatsResponse>> getStats() {
        return ResponseEntity.ok(responseFactory.success(
                attributionService.getAttributionStats(),
                "Attribution stats retrieved successfully"));
    }
}
