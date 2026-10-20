package com.surveyflow.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.surveyflow.dto.response.credit.CreditTransactionResponse;
import com.surveyflow.dto.response.credit.CreditWalletResponse;
import com.surveyflow.exception.ResourceNotFoundException;
import com.surveyflow.model.CreditTransaction;
import com.surveyflow.model.CreditWallet;
import com.surveyflow.repository.CreditTransactionRepository;
import com.surveyflow.repository.CreditWalletRepository;
import com.surveyflow.service.CreditWalletService;

@Service
public class CreditWalletServiceImpl implements CreditWalletService {

    private final CreditWalletRepository creditWalletRepository;
    private final CreditTransactionRepository creditTransactionRepository;

    public CreditWalletServiceImpl(CreditWalletRepository creditWalletRepository,
                                   CreditTransactionRepository creditTransactionRepository) {
        this.creditWalletRepository = creditWalletRepository;
        this.creditTransactionRepository = creditTransactionRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public CreditWalletResponse getWallet(Long userId) {
        CreditWallet wallet = findWallet(userId);
        return new CreditWalletResponse(wallet.getId(), wallet.getBalance(),
                wallet.getReservedBalance(), wallet.getBalance());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CreditTransactionResponse> getTransactions(Long userId) {
        CreditWallet wallet = findWallet(userId);
        return creditTransactionRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId()).stream()
                .map(this::toTransactionResponse)
                .toList();
    }

    private CreditWallet findWallet(Long userId) {
        return creditWalletRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Credit wallet not found for user: " + userId));
    }

    private CreditTransactionResponse toTransactionResponse(CreditTransaction transaction) {
        return new CreditTransactionResponse(transaction.getId(), transaction.getType(), transaction.getDirection(),
                transaction.getAmount(), transaction.getBalanceBefore(), transaction.getBalanceAfter(),
                transaction.getReferenceType(), transaction.getReferenceId(), transaction.getDescription(), transaction.getCreatedAt());
    }
}
