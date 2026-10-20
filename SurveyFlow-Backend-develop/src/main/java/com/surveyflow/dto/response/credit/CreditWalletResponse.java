package com.surveyflow.dto.response.credit;

public record CreditWalletResponse(
        Long walletId,
        Long balance,
        Long reservedBalance,
        Long spendableBalance
) {
}
