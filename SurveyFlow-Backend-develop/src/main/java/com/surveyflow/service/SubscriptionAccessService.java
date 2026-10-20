package com.surveyflow.service;

import java.util.Optional;

import com.surveyflow.common.enums.PlusEntitlementCode;
import com.surveyflow.dto.response.subscription.CurrentSubscriptionResponse;
import com.surveyflow.dto.response.subscription.SubscriptionEntitlementResponse;

public interface SubscriptionAccessService {

    /** Lấy kỳ Plus đang có hiệu lực cùng các quyền lợi của user. */
    CurrentSubscriptionResponse getCurrentSubscription(Long userId);

    /** Kiểm tra user có kỳ Plus đang hiệu lực. */
    boolean hasActivePlus(Long userId);

    /** Lấy quyền lợi được cấp bởi Plus đang hiệu lực, chưa trừ số lượt đã dùng của quota. */
    Optional<SubscriptionEntitlementResponse> getEntitlement(Long userId, PlusEntitlementCode code);

    /** Kiểm tra Plus đang hiệu lực có cấp quyền lợi này, chưa xét số lượt quota còn lại. */
    boolean hasEntitlement(Long userId, PlusEntitlementCode code);
}
