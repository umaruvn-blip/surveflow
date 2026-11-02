package com.surveyflow.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.surveyflow.common.enums.PaymentStatus;
import com.surveyflow.dto.request.payment.RejectPaymentRequest;
import com.surveyflow.dto.response.ApiResponse;
import com.surveyflow.dto.response.admin.AdminPaymentItemResponse;
import com.surveyflow.factory.ApiResponseFactory;
import com.surveyflow.security.model.UserPrincipal;
import com.surveyflow.service.BankTransferPaymentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j(topic = "ADMIN-PAYMENT-CONTROLLER")
@RestController
@RequestMapping("/api/v1/admin/payments")
@RequiredArgsConstructor
@Tag(name = "Admin Payments")
public class AdminPaymentController {

    private final BankTransferPaymentService service;
    private final ApiResponseFactory responseFactory;

    /** Lấy danh sách các đơn thanh toán (hỗ trợ lọc theo trạng thái: PENDING, SUCCESS, CANCELLED). */
    @GetMapping
    @Operation(summary = "Get list of payments for admin reconciliation with optional status filter")
    public ResponseEntity<ApiResponse<List<AdminPaymentItemResponse>>> getPayments(
            @RequestParam(required = false) PaymentStatus status) {
        log.info("Admin payments list requested with status={}", status);
        return ResponseEntity.ok(responseFactory.success(
                service.getAdminPayments(status),
                "Danh sách đơn thanh toán được tải thành công"));
    }

    /** Quản trị viên duyệt đơn thanh toán hợp lệ (kích hoạt gói hoặc cộng Credits). */
    @PostMapping("/{id}/approve")
    @Operation(summary = "Admin approves a pending payment and provisions credits or subscription")
    public ResponseEntity<ApiResponse<AdminPaymentItemResponse>> approvePayment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        log.info("Admin userId={} approving paymentId={}", principal.getId(), id);
        return ResponseEntity.ok(responseFactory.success(
                service.approvePayment(principal.getId(), id),
                "Duyệt đơn thanh toán thành công"));
    }

    /** Quản trị viên từ chối / hủy đơn thanh toán không hợp lệ. */
    @PostMapping("/{id}/reject")
    @Operation(summary = "Admin rejects or cancels a payment")
    public ResponseEntity<ApiResponse<AdminPaymentItemResponse>> rejectPayment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody(required = false) RejectPaymentRequest request) {
        String reason = (request != null) ? request.reason() : null;
        log.info("Admin userId={} rejecting paymentId={} with reason={}", principal.getId(), id, reason);
        return ResponseEntity.ok(responseFactory.success(
                service.rejectPayment(principal.getId(), id, reason),
                "Từ chối đơn thanh toán thành công"));
    }
}
