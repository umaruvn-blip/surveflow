package com.surveyflow.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.surveyflow.dto.response.ApiResponse;
import com.surveyflow.dto.response.admin.AdminTrackingStatsResponse;
import com.surveyflow.factory.ApiResponseFactory;
import com.surveyflow.service.AdminTrackingService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j(topic = "ADMIN-TRACKING-CONTROLLER")
@RestController
@RequestMapping("/api/v1/admin/tracking")
@RequiredArgsConstructor
@Tag(name = "Admin Tracking")
public class AdminTrackingController {

    private final AdminTrackingService adminTrackingService;
    private final ApiResponseFactory responseFactory;

    /**
     * Lấy báo cáo thống kê phân tích toàn diện dành cho Quản trị viên (Admin).
     */
    @GetMapping("/summary")
    @Operation(summary = "Get comprehensive platform metrics and tracking summary for Admin")
    public ResponseEntity<ApiResponse<AdminTrackingStatsResponse>> getAdminTrackingSummary() {
        log.info("Admin tracking summary requested");
        return ResponseEntity.ok(responseFactory.success(
                adminTrackingService.getAdminTrackingSummary(),
                "Admin tracking summary retrieved successfully"));
    }
}
