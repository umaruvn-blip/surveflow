package com.surveyflow.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.surveyflow.dto.response.ApiResponse;
import com.surveyflow.dto.response.credit.CreditTransactionResponse;
import com.surveyflow.dto.response.credit.CreditWalletResponse;
import com.surveyflow.factory.ApiResponseFactory;
import com.surveyflow.security.model.UserPrincipal;
import com.surveyflow.service.CreditWalletService;

@RestController
@RequestMapping("/api/v1/credits")
public class CreditWalletController {

    private final CreditWalletService creditWalletService;
    private final ApiResponseFactory apiResponseFactory;

    public CreditWalletController(CreditWalletService creditWalletService,
                                  ApiResponseFactory apiResponseFactory) {
        this.creditWalletService = creditWalletService;
        this.apiResponseFactory = apiResponseFactory;
    }

    /** Lấy số dư ví credit của người dùng hiện tại. */
    @GetMapping("/wallet")
    public ApiResponse<CreditWalletResponse> getWallet(@AuthenticationPrincipal UserPrincipal principal) {
        return apiResponseFactory.success(creditWalletService.getWallet(principal.getId()));
    }

    /** Lấy lịch sử giao dịch credit của người dùng hiện tại. */
    @GetMapping("/transactions")
    public ApiResponse<List<CreditTransactionResponse>> getTransactions(@AuthenticationPrincipal UserPrincipal principal) {
        return apiResponseFactory.success(creditWalletService.getTransactions(principal.getId()));
    }
}
