package com.surveyflow.service;

import java.util.List;

import com.surveyflow.common.enums.PaymentStatus;
import com.surveyflow.dto.request.payment.CreateBankTransferPaymentRequest;
import com.surveyflow.dto.response.admin.AdminPaymentItemResponse;
import com.surveyflow.dto.response.payment.BankTransferPaymentResponse;

public interface BankTransferPaymentService {

    BankTransferPaymentResponse createOrder(Long userId, CreateBankTransferPaymentRequest request);

    BankTransferPaymentResponse getOrder(Long userId, Long paymentId);

    List<BankTransferPaymentResponse> getUserHistory(Long userId);

    List<AdminPaymentItemResponse> getAdminPayments(PaymentStatus status);

    AdminPaymentItemResponse approvePayment(Long adminUserId, Long paymentId);

    AdminPaymentItemResponse rejectPayment(Long adminUserId, Long paymentId, String reason);
}
