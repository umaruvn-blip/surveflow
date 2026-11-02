package com.surveyflow.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.payment.bank")
public record AppPaymentBankProperties(
        String bankId,
        String bankName,
        String accountNo,
        String accountName
) {
    public AppPaymentBankProperties {
        bankId = (bankId == null || bankId.isBlank()) ? "VCB" : bankId.trim();
        bankName = (bankName == null || bankName.isBlank()) ? "Vietcombank - Ngân hàng Ngoại thương Việt Nam" : bankName.trim();
        accountNo = (accountNo == null || accountNo.isBlank()) ? "1021713257" : accountNo.trim();
        accountName = (accountName == null || accountName.isBlank()) ? "LE THANH THINH" : accountName.trim();
    }
}
