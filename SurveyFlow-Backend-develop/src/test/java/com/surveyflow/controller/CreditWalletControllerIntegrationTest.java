package com.surveyflow.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.surveyflow.common.enums.CreditTransactionDirection;
import com.surveyflow.common.enums.CreditTransactionType;
import com.surveyflow.model.CreditTransaction;
import com.surveyflow.model.CreditWallet;
import com.surveyflow.model.User;
import com.surveyflow.repository.CreditTransactionRepository;
import com.surveyflow.repository.CreditWalletRepository;
import com.surveyflow.repository.UserRepository;
import com.surveyflow.security.service.JwtService;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class CreditWalletControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JwtService jwtService;
    @Autowired private UserRepository userRepository;
    @Autowired private CreditWalletRepository walletRepository;
    @Autowired private CreditTransactionRepository transactionRepository;

    @Test
    void walletAndTransactionsKeepTheirAuthenticatedApiContract() throws Exception {
        User user = new User();
        user.setEmail("credit-wallet-" + UUID.randomUUID() + "@example.test");
        user = userRepository.saveAndFlush(user);

        CreditWallet wallet = new CreditWallet();
        wallet.setUser(user);
        wallet.setBalance(42L);
        wallet.setReservedBalance(8L);
        wallet = walletRepository.saveAndFlush(wallet);

        CreditTransaction transaction = new CreditTransaction();
        transaction.setWallet(wallet);
        transaction.setType(CreditTransactionType.CREDIT_TOPUP);
        transaction.setDirection(CreditTransactionDirection.CREDIT);
        transaction.setAmount(42L);
        transaction.setBalanceBefore(0L);
        transaction.setBalanceAfter(42L);
        transaction = transactionRepository.saveAndFlush(transaction);

        String authorization = "Bearer " + jwtService.generateAccessToken(user.getEmail(), Map.of());

        mockMvc.perform(get("/api/v1/credits/wallet").header("Authorization", authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.walletId").value(wallet.getId()))
                .andExpect(jsonPath("$.data.balance").value(42))
                .andExpect(jsonPath("$.data.reservedBalance").value(8))
                .andExpect(jsonPath("$.data.spendableBalance").value(42));

        mockMvc.perform(get("/api/v1/credits/transactions").header("Authorization", authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].id").value(transaction.getId()))
                .andExpect(jsonPath("$.data[0].amount").value(42));

        mockMvc.perform(get("/api/v1/credits/wallet"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/credits/transactions"))
                .andExpect(status().isUnauthorized());
    }
}
