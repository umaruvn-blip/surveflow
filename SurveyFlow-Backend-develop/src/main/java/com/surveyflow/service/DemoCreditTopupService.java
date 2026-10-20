package com.surveyflow.service;

import com.surveyflow.common.enums.DemoPaymentOutcome;
import com.surveyflow.dto.response.payment.TopupPaymentResponse;

public interface DemoCreditTopupService {

    /** Tạo đơn nạp Credits giả lập với số tiền do server tính. */
    TopupPaymentResponse create(Long userId, long credits);

    /** Xem trạng thái đơn nạp Credits của người dùng hiện tại. */
    TopupPaymentResponse get(Long userId, Long paymentId);

    /** Hoàn tất đơn giả lập và cộng Credits đúng một lần khi thành công. */
    TopupPaymentResponse complete(Long userId, Long paymentId, DemoPaymentOutcome outcome);
}
