package com.surveyflow.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.surveyflow.dto.request.payment.CreateBankTransferPaymentRequest;
import com.surveyflow.dto.response.ApiResponse;
import com.surveyflow.dto.response.payment.BankTransferPaymentResponse;
import com.surveyflow.factory.ApiResponseFactory;
import com.surveyflow.security.model.UserPrincipal;
import com.surveyflow.service.BankTransferPaymentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j(topic = "BANK-TRANSFER-PAYMENT-CONTROLLER")
@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/payments/bank-transfer")
@Tag(name = "Bank Transfer Payment")
public class BankTransferPaymentController {

    private final BankTransferPaymentService service;
    private final ApiResponseFactory responseFactory;

    /** Tạo đơn thanh toán qua chuyển khoản ngân hàng (VietQR). */
    @PostMapping("/create")
    @Operation(summary = "Create a bank transfer payment order with dynamic VietQR")
    public ResponseEntity<ApiResponse<BankTransferPaymentResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateBankTransferPaymentRequest request) {
        log.info("Bank transfer order creation requested by userId={}", principal.getId());
        BankTransferPaymentResponse response = service.createOrder(principal.getId(), request);
        return ResponseEntity.status(201).body(responseFactory.created(response, "Đơn thanh toán chuyển khoản đã được khởi tạo thành công"));
    }

    /** Xem chi tiết đơn thanh toán qua chuyển khoản của chính người dùng. */
    @GetMapping("/{paymentId}")
    @Operation(summary = "Get bank transfer payment order details by ID")
    public ApiResponse<BankTransferPaymentResponse> get(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long paymentId) {
        return responseFactory.success(service.getOrder(principal.getId(), paymentId));
    }

    /** Xem lịch sử thanh toán chuyển khoản của người dùng. */
    @GetMapping("/history")
    @Operation(summary = "Get user bank transfer payment history")
    public ApiResponse<List<BankTransferPaymentResponse>> getHistory(
            @AuthenticationPrincipal UserPrincipal principal) {
        return responseFactory.success(service.getUserHistory(principal.getId()));
    }
}
