package com.surveyflow.service.impl;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.surveyflow.common.enums.CreditTransactionDirection;
import com.surveyflow.common.enums.CreditTransactionType;
import com.surveyflow.common.enums.PaymentProvider;
import com.surveyflow.common.enums.PaymentStatus;
import com.surveyflow.common.enums.PaymentType;
import com.surveyflow.common.enums.SubscriptionStatus;
import com.surveyflow.config.properties.AppPaymentBankProperties;
import com.surveyflow.dto.request.payment.CreateBankTransferPaymentRequest;
import com.surveyflow.dto.response.admin.AdminPaymentItemResponse;
import com.surveyflow.dto.response.payment.BankTransferPaymentResponse;
import com.surveyflow.exception.ConflictException;
import com.surveyflow.exception.InvalidRequestException;
import com.surveyflow.exception.ResourceNotFoundException;
import com.surveyflow.model.CreditPackage;
import com.surveyflow.model.CreditTransaction;
import com.surveyflow.model.CreditWallet;
import com.surveyflow.model.Payment;
import com.surveyflow.model.SubscriptionPlan;
import com.surveyflow.model.SubscriptionPrice;
import com.surveyflow.model.User;
import com.surveyflow.model.UserSubscription;
import com.surveyflow.repository.CreditPackageRepository;
import com.surveyflow.repository.CreditTransactionRepository;
import com.surveyflow.repository.CreditWalletRepository;
import com.surveyflow.repository.PaymentRepository;
import com.surveyflow.repository.SubscriptionPlanRepository;
import com.surveyflow.repository.SubscriptionPriceRepository;
import com.surveyflow.repository.UserRepository;
import com.surveyflow.repository.UserSubscriptionRepository;
import com.surveyflow.service.BankTransferPaymentService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "BANK-TRANSFER-PAYMENT-SERVICE")
public class BankTransferPaymentServiceImpl implements BankTransferPaymentService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final CreditWalletRepository walletRepository;
    private final CreditTransactionRepository transactionRepository;
    private final CreditPackageRepository creditPackageRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final SubscriptionPriceRepository subscriptionPriceRepository;
    private final UserSubscriptionRepository userSubscriptionRepository;
    private final AppPaymentBankProperties bankProperties;
    private final Clock clock;

    @Override
    @Transactional
    public BankTransferPaymentResponse createOrder(Long userId, CreateBankTransferPaymentRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Payment payment = new Payment();
        payment.setUser(user);
        payment.setProvider(PaymentProvider.BANK_TRANSFER);
        payment.setStatus(PaymentStatus.PENDING);
        payment.setCurrency("VND");

        if (request.type() == PaymentType.SUBSCRIPTION) {
            SubscriptionPlan plan;
            if (request.planId() != null) {
                plan = subscriptionPlanRepository.findById(request.planId())
                        .orElseThrow(() -> new ResourceNotFoundException("Gói đăng ký không tồn tại"));
            } else {
                plan = subscriptionPlanRepository.findByCode("PLUS")
                        .orElseThrow(() -> new ResourceNotFoundException("Gói SurveyFlow Plus không tồn tại"));
            }

            SubscriptionPrice price;
            if (request.priceId() != null) {
                price = subscriptionPriceRepository.findById(request.priceId())
                        .orElseThrow(() -> new ResourceNotFoundException("Bảng giá không tồn tại"));
            } else {
                price = subscriptionPriceRepository.findFirstByPlan_IdAndActiveTrueOrderByValidFromDesc(plan.getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Chưa cấu hình giá cho gói đăng ký này"));
            }

            payment.setType(PaymentType.SUBSCRIPTION);
            payment.setAmount(price.getPrice());
            payment.setCurrency(price.getCurrency());
            payment.setSubscriptionPrice(price);
            payment.setDescription("Gói " + plan.getName());

            payment = paymentRepository.saveAndFlush(payment);

            String transactionCode = "SF" + payment.getId();
            payment.setTransactionCode(transactionCode);
            payment.setDescription("Gói " + plan.getName() + " - " + transactionCode);
            payment = paymentRepository.save(payment);

            log.info("Subscription payment order created: id={}, userId={}, plan={}, amount={}",
                    payment.getId(), userId, plan.getCode(), payment.getAmount());

            return toResponse(payment, plan.getName(), plan.getCode(), plan.getDurationDays());

        } else if (request.type() == PaymentType.CREDIT_TOPUP) {
            BigDecimal amount;
            Long credits;
            String desc;

            if (request.packageId() != null) {
                CreditPackage pkg = creditPackageRepository.findById(request.packageId())
                        .orElseThrow(() -> new ResourceNotFoundException("Gói Credits không tồn tại"));
                credits = pkg.getCreditAmount();
                amount = pkg.getPrice();
                desc = "Gói " + pkg.getName() + " (" + credits + " Credits)";
            } else if (request.credits() != null) {
                if (request.credits() < 10) {
                    throw new InvalidRequestException("Số Credits nạp tối thiểu là 10");
                }
                credits = request.credits();
                amount = BigDecimal.valueOf(credits).multiply(BigDecimal.valueOf(100L));
                desc = "Nạp " + credits + " Credits";
            } else {
                throw new InvalidRequestException("Vui lòng chọn gói Credits hoặc nhập số lượng Credits cần nạp");
            }

            payment.setType(PaymentType.CREDIT_TOPUP);
            payment.setAmount(amount);
            payment.setCreditAmount(credits);
            payment.setDescription(desc);

            payment = paymentRepository.saveAndFlush(payment);

            String transactionCode = "SF" + payment.getId();
            payment.setTransactionCode(transactionCode);
            payment.setDescription(desc + " - " + transactionCode);
            payment = paymentRepository.save(payment);

            log.info("Credit top-up payment order created: id={}, userId={}, credits={}, amount={}",
                    payment.getId(), userId, credits, payment.getAmount());

            return toResponse(payment, null, null, null);
        } else {
            throw new InvalidRequestException("Loại thanh toán không được hỗ trợ: " + request.type());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public BankTransferPaymentResponse getOrder(Long userId, Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn thanh toán không tồn tại"));

        if (!payment.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Đơn thanh toán không tồn tại");
        }

        String planName = null;
        String planCode = null;
        Integer durationDays = null;
        if (payment.getSubscriptionPrice() != null && payment.getSubscriptionPrice().getPlan() != null) {
            SubscriptionPlan plan = payment.getSubscriptionPrice().getPlan();
            planName = plan.getName();
            planCode = plan.getCode();
            durationDays = plan.getDurationDays();
        }

        return toResponse(payment, planName, planCode, durationDays);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BankTransferPaymentResponse> getUserHistory(Long userId) {
        return paymentRepository.findByUserIdAndProviderOrderByCreatedAtDesc(userId, PaymentProvider.BANK_TRANSFER)
                .stream()
                .map(p -> {
                    String planName = null;
                    String planCode = null;
                    Integer durationDays = null;
                    if (p.getSubscriptionPrice() != null && p.getSubscriptionPrice().getPlan() != null) {
                        SubscriptionPlan plan = p.getSubscriptionPrice().getPlan();
                        planName = plan.getName();
                        planCode = plan.getCode();
                        durationDays = plan.getDurationDays();
                    }
                    return toResponse(p, planName, planCode, durationDays);
                })
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminPaymentItemResponse> getAdminPayments(PaymentStatus status) {
        return paymentRepository.findAllWithFilter(status)
                .stream()
                .map(this::toAdminItem)
                .toList();
    }

    @Override
    @Transactional
    public AdminPaymentItemResponse approvePayment(Long adminUserId, Long paymentId) {
        Payment payment = paymentRepository.findByIdForUpdate(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn thanh toán không tồn tại"));

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            return toAdminItem(payment);
        }

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new ConflictException("Đơn thanh toán không ở trạng thái chờ duyệt (trạng thái hiện tại: " + payment.getStatus() + ")");
        }

        Instant now = clock.instant();

        if (payment.getType() == PaymentType.CREDIT_TOPUP) {
            creditWalletForTopup(payment);
        } else if (payment.getType() == PaymentType.SUBSCRIPTION) {
            provisionSubscription(payment, now);
        }

        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setPaidAt(now);
        payment = paymentRepository.save(payment);

        log.info("Payment approved by admin: paymentId={}, adminUserId={}, type={}, amount={}",
                paymentId, adminUserId, payment.getType(), payment.getAmount());

        return toAdminItem(payment);
    }

    @Override
    @Transactional
    public AdminPaymentItemResponse rejectPayment(Long adminUserId, Long paymentId, String reason) {
        Payment payment = paymentRepository.findByIdForUpdate(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn thanh toán không tồn tại"));

        if (payment.getStatus() == PaymentStatus.CANCELLED) {
            return toAdminItem(payment);
        }

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new ConflictException("Đơn thanh toán không ở trạng thái chờ duyệt (trạng thái hiện tại: " + payment.getStatus() + ")");
        }

        Instant now = clock.instant();
        payment.setStatus(PaymentStatus.CANCELLED);
        payment.setCancelledAt(now);

        if (reason != null && !reason.isBlank()) {
            payment.setDescription(payment.getDescription() + " (Lý do từ chối: " + reason.trim() + ")");
        }

        payment = paymentRepository.save(payment);
        log.info("Payment rejected by admin: paymentId={}, adminUserId={}, reason={}", paymentId, adminUserId, reason);

        return toAdminItem(payment);
    }

    private void creditWalletForTopup(Payment payment) {
        CreditWallet wallet = walletRepository.findWithLockByUserId(payment.getUser().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Ví Credits của người dùng không tồn tại"));

        long before = wallet.getBalance();
        long credits = payment.getCreditAmount();
        long after = Math.addExact(before, credits);
        wallet.setBalance(after);
        walletRepository.save(wallet);

        CreditTransaction tx = new CreditTransaction();
        tx.setWallet(wallet);
        tx.setType(CreditTransactionType.CREDIT_TOPUP);
        tx.setDirection(CreditTransactionDirection.CREDIT);
        tx.setAmount(credits);
        tx.setBalanceBefore(before);
        tx.setBalanceAfter(after);
        tx.setReferenceType("PAYMENT");
        tx.setReferenceId(payment.getId());
        tx.setPaymentId(payment.getId());
        tx.setDescription("Nạp " + credits + " Credits qua Chuyển khoản ngân hàng (" + payment.getTransactionCode() + ")");
        transactionRepository.save(tx);

        log.info("Credits credited: userId={}, credits={}, balanceBefore={}, balanceAfter={}",
                payment.getUser().getId(), credits, before, after);
    }

    private void provisionSubscription(Payment payment, Instant now) {
        SubscriptionPlan plan;
        if (payment.getSubscriptionPrice() != null && payment.getSubscriptionPrice().getPlan() != null) {
            plan = payment.getSubscriptionPrice().getPlan();
        } else {
            plan = subscriptionPlanRepository.findByCode("PLUS")
                    .orElseThrow(() -> new ResourceNotFoundException("Gói SurveyFlow Plus không tồn tại"));
        }

        int durationDays = (plan.getDurationDays() != null && plan.getDurationDays() > 0)
                ? plan.getDurationDays()
                : 30;

        List<UserSubscription> activeSubs = userSubscriptionRepository.findByUserIdAndStatus(
                payment.getUser().getId(), SubscriptionStatus.ACTIVE);

        UserSubscription targetSub = null;
        for (UserSubscription s : activeSubs) {
            if (s.getPlan().getId().equals(plan.getId()) && s.getExpiredAt() != null && s.getExpiredAt().isAfter(now)) {
                targetSub = s;
                break;
            }
        }

        if (targetSub != null) {
            Instant newExpiredAt = targetSub.getExpiredAt().plus(durationDays, ChronoUnit.DAYS);
            targetSub.setExpiredAt(newExpiredAt);
            userSubscriptionRepository.save(targetSub);

            payment.setUserSubscription(targetSub);
            payment.setSubscriptionPeriodStartedAt(targetSub.getStartedAt());
            payment.setSubscriptionPeriodExpiredAt(newExpiredAt);
            log.info("Subscription extended: userId={}, plan={}, newExpiredAt={}",
                    payment.getUser().getId(), plan.getCode(), newExpiredAt);
        } else {
            UserSubscription newSub = new UserSubscription();
            newSub.setUser(payment.getUser());
            newSub.setPlan(plan);
            newSub.setStatus(SubscriptionStatus.ACTIVE);
            newSub.setStartedAt(now);
            newSub.setExpiredAt(now.plus(durationDays, ChronoUnit.DAYS));
            newSub = userSubscriptionRepository.save(newSub);

            payment.setUserSubscription(newSub);
            payment.setSubscriptionPeriodStartedAt(now);
            payment.setSubscriptionPeriodExpiredAt(newSub.getExpiredAt());
            log.info("New subscription activated: userId={}, plan={}, expiredAt={}",
                    payment.getUser().getId(), plan.getCode(), newSub.getExpiredAt());
        }

        // Tặng quyền lợi 500 Credits hàng tháng kèm theo gói SurveyFlow Plus
        long benefitCredits = 500L;
        CreditWallet wallet = walletRepository.findWithLockByUserId(payment.getUser().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Ví Credits của người dùng không tồn tại"));

        long before = wallet.getBalance();
        long after = Math.addExact(before, benefitCredits);
        wallet.setBalance(after);
        walletRepository.save(wallet);

        CreditTransaction tx = new CreditTransaction();
        tx.setWallet(wallet);
        tx.setType(CreditTransactionType.CREDIT_TOPUP);
        tx.setDirection(CreditTransactionDirection.CREDIT);
        tx.setAmount(benefitCredits);
        tx.setBalanceBefore(before);
        tx.setBalanceAfter(after);
        tx.setReferenceType("PAYMENT");
        tx.setReferenceId(payment.getId());
        tx.setPaymentId(payment.getId());
        tx.setDescription("Đặc quyền +500 Credits gói SurveyFlow Plus (" + payment.getTransactionCode() + ")");
        transactionRepository.save(tx);

        payment.setSubscriptionBenefitCredits(benefitCredits);
    }

    private String buildVietQrUrl(BigDecimal amount, String transactionCode) {
        String bankId = bankProperties.bankId();
        String accountNo = bankProperties.accountNo();
        String accountName = URLEncoder.encode(bankProperties.accountName(), StandardCharsets.UTF_8).replace("+", "%20");
        String addInfo = URLEncoder.encode(transactionCode, StandardCharsets.UTF_8).replace("+", "%20");
        long amountInt = amount.longValue();

        return String.format(
                "https://img.vietqr.io/image/%s-%s-compact2.png?amount=%d&addInfo=%s&accountName=%s",
                bankId, accountNo, amountInt, addInfo, accountName);
    }

    private BankTransferPaymentResponse toResponse(
            Payment payment,
            String planName,
            String planCode,
            Integer durationDays) {
        String qrUrl = buildVietQrUrl(payment.getAmount(), payment.getTransactionCode());

        return new BankTransferPaymentResponse(
                payment.getId(),
                payment.getType(),
                payment.getStatus(),
                payment.getAmount(),
                payment.getCurrency(),
                payment.getCreditAmount(),
                planName,
                planCode,
                durationDays,
                payment.getTransactionCode(),
                payment.getDescription(),
                bankProperties.bankId(),
                bankProperties.bankName(),
                bankProperties.accountNo(),
                bankProperties.accountName(),
                qrUrl,
                payment.getCreatedAt(),
                payment.getPaidAt());
    }

    private AdminPaymentItemResponse toAdminItem(Payment payment) {
        String userName = null;
        if (payment.getUser() != null) {
            userName = (payment.getUser().getProfile() != null && payment.getUser().getProfile().getDisplayName() != null)
                    ? payment.getUser().getProfile().getDisplayName()
                    : payment.getUser().getEmail();
        }

        String planName = null;
        String planCode = null;
        if (payment.getSubscriptionPrice() != null && payment.getSubscriptionPrice().getPlan() != null) {
            planName = payment.getSubscriptionPrice().getPlan().getName();
            planCode = payment.getSubscriptionPrice().getPlan().getCode();
        }

        return new AdminPaymentItemResponse(
                payment.getId(),
                payment.getUser() != null ? payment.getUser().getId() : null,
                payment.getUser() != null ? payment.getUser().getEmail() : null,
                userName,
                payment.getType(),
                payment.getProvider(),
                payment.getStatus(),
                payment.getAmount(),
                payment.getCurrency(),
                payment.getCreditAmount(),
                planName,
                planCode,
                payment.getTransactionCode(),
                payment.getDescription(),
                payment.getCreatedAt(),
                payment.getPaidAt(),
                payment.getCancelledAt());
    }
}
