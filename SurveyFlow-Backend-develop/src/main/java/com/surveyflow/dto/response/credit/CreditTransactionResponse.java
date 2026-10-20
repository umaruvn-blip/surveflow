package com.surveyflow.dto.response.credit;

import java.time.Instant;

import com.surveyflow.common.enums.CreditTransactionDirection;
import com.surveyflow.common.enums.CreditTransactionType;

public record CreditTransactionResponse(
        Long id,
        CreditTransactionType type,
        CreditTransactionDirection direction,
        Long amount,
        Long balanceBefore,
        Long balanceAfter,
        String referenceType,
        Long referenceId,
        String description,
        Instant createdAt
) {
}
