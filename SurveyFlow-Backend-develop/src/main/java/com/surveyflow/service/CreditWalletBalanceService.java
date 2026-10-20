package com.surveyflow.service;

import com.surveyflow.dto.response.credit.CreditWalletResponse;

public interface CreditWalletBalanceService {

    /** Cộng một lần 200 credit vào ví đã tạo cho người dùng mới đăng ký. */
    CreditWalletResponse initializeForRegistration(Long userId);

    /** Cộng một lần 10 credit khi lượt tham gia khảo sát của người dùng được xác nhận hợp lệ. */
    CreditWalletResponse rewardSurveyCompletion(Long userId, Long participationId);

    /** Cộng một lần 50 credit cho người giới thiệu sau khi người được mời đã được xác nhận hợp lệ. */
    CreditWalletResponse rewardQualifiedReferral(Long referrerUserId, Long referredUserId);

    /** Trừ 11 credit cho mỗi phản hồi mục tiêu khi xuất bản khảo sát (10 trả thưởng + 1 phí nền tảng). */
    CreditWalletResponse chargeSurveyPublish(Long creatorUserId, Long surveyId);

    /** Hoàn trả 11 credit cho mỗi phản hồi chưa có người làm khi đóng khảo sát sớm. */
    CreditWalletResponse refundSurveyClose(Long creatorUserId, Long surveyId);

    /** Trừ một lần 11 credit cho mỗi phản hồi mục tiêu khi tạo khảo sát (legacy). */
    CreditWalletResponse chargeSurveyCreation(Long creatorUserId, Long surveyId);
}
