package com.surveyflow.service;

import java.util.List;

import com.surveyflow.dto.response.credit.CreditTransactionResponse;
import com.surveyflow.dto.response.credit.CreditWalletResponse;

public interface CreditWalletService {

    /** Lấy số dư ví credit của người dùng. */
    CreditWalletResponse getWallet(Long userId);

    /** Lấy lịch sử giao dịch credit của người dùng. */
    List<CreditTransactionResponse> getTransactions(Long userId);
}
