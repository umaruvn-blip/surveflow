package com.surveyflow.service;

import java.time.Instant;

import com.surveyflow.common.enums.RefreshTokenRevocationReason;
import com.surveyflow.model.User;

public interface RefreshTokenService {

    /** Lưu refresh token mới cho user. */
    void issue(User user, String rawToken, Instant expiresAt);

    /** Thu hồi refresh token hiện tại và thay thế bằng token mới. */
    void rotate(String currentRawToken, User expectedUser, String replacementRawToken, Instant replacementExpiresAt);

    /** Thu hồi refresh token với lý do xác định. */
    void revoke(String rawToken, RefreshTokenRevocationReason reason);
}
