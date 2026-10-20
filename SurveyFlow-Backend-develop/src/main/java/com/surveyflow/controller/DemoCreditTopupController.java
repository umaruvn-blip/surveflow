package com.surveyflow.controller;

import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.surveyflow.dto.request.payment.CompleteDemoPaymentRequest;
import com.surveyflow.dto.request.payment.CreateCreditTopupRequest;
import com.surveyflow.dto.response.ApiResponse;
import com.surveyflow.dto.response.payment.TopupPaymentResponse;
import com.surveyflow.factory.ApiResponseFactory;
import com.surveyflow.security.model.UserPrincipal;
import com.surveyflow.service.DemoCreditTopupService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Profile("(staging | dev) & !prod")
@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/payments")
public class DemoCreditTopupController {

    private final DemoCreditTopupService service;
    private final ApiResponseFactory apiResponseFactory;

    /** Tạo đơn nạp Credits giả lập cho người dùng đã đăng nhập. */
    @PostMapping("/topups")
    public ResponseEntity<ApiResponse<TopupPaymentResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateCreditTopupRequest request) {
        TopupPaymentResponse response = service.create(principal.getId(), request.credits());
        return ResponseEntity.status(201).body(apiResponseFactory.created(response, "Top-up created"));
    }

    /** Xem trạng thái đơn nạp Credits của chính người dùng. */
    @GetMapping("/{paymentId}")
    public ApiResponse<TopupPaymentResponse> get(@AuthenticationPrincipal UserPrincipal principal,
                                                 @PathVariable Long paymentId) {
        return apiResponseFactory.success(service.get(principal.getId(), paymentId));
    }

    /** Giả lập kết quả thanh toán trên dev hoặc staging. */
    @PostMapping("/{paymentId}/demo-result")
    public ApiResponse<TopupPaymentResponse> complete(@AuthenticationPrincipal UserPrincipal principal,
                                                      @PathVariable Long paymentId,
                                                      @Valid @RequestBody CompleteDemoPaymentRequest request) {
        return apiResponseFactory.success(service.complete(principal.getId(), paymentId, request.outcome()));
    }
}
