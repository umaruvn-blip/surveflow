package com.surveyflow.service.impl;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Clock;
import java.time.Instant;
import java.util.HexFormat;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.surveyflow.common.enums.RefreshTokenRevocationReason;
import com.surveyflow.exception.InvalidRefreshTokenException;
import com.surveyflow.model.RefreshToken;
import com.surveyflow.model.User;
import com.surveyflow.repository.RefreshTokenRepository;
import com.surveyflow.service.RefreshTokenService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j(topic = "REFRESH-TOKEN-SERVICE")
@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private static final String INVALID_REFRESH_TOKEN = "Invalid refresh token";

    private final RefreshTokenRepository refreshTokenRepository;
    private final Clock clock;

    @Override
    @Transactional
    public void issue(User user, String rawToken, Instant expiresAt) {
        RefreshToken token = refreshTokenRepository.save(newToken(user, rawToken, expiresAt));
        log.info("Refresh token issued: tokenId={}, userId={}", token.getId(), user.getId());
    }

    @Override
    @Transactional(
            propagation = Propagation.REQUIRES_NEW,
            noRollbackFor = InvalidRefreshTokenException.class
    )
    public void rotate(String currentRawToken,
                       User expectedUser,
                       String replacementRawToken,
                       Instant replacementExpiresAt) {
        Instant now = Instant.now(clock);
        RefreshToken current = refreshTokenRepository.findByTokenHashForUpdate(hashToken(currentRawToken))
                .orElseThrow(() -> new InvalidRefreshTokenException(INVALID_REFRESH_TOKEN));

        if (!current.getUser().getId().equals(expectedUser.getId())) {
            throw new InvalidRefreshTokenException(INVALID_REFRESH_TOKEN);
        }

        if (current.getRevokedAt() != null) {
            log.warn("Revoked refresh token reused: tokenId={}, userId={}, reason={}",
                    current.getId(), current.getUser().getId(), current.getRevocationReason());
            handleReplay(current, now);
            throw new InvalidRefreshTokenException(INVALID_REFRESH_TOKEN);
        }

        if (!current.getExpiresAt().isAfter(now)) {
            current.setRevokedAt(now);
            current.setRevocationReason(RefreshTokenRevocationReason.EXPIRED);
            log.info("Expired refresh token revoked: tokenId={}, userId={}",
                    current.getId(), current.getUser().getId());
            throw new InvalidRefreshTokenException("Refresh token has expired");
        }

        RefreshToken replacement = refreshTokenRepository.save(
                newToken(expectedUser, replacementRawToken, replacementExpiresAt));
        current.setRevokedAt(now);
        current.setRevocationReason(RefreshTokenRevocationReason.ROTATED);
        current.setReplacedByToken(replacement);
        log.info("Refresh token rotated: userId={}, previousTokenId={}, replacementTokenId={}",
                expectedUser.getId(), current.getId(), replacement.getId());
    }

    @Override
    @Transactional
    public void revoke(String rawToken, RefreshTokenRevocationReason reason) {
        if (rawToken == null || rawToken.isBlank()) {
            return;
        }

        refreshTokenRepository.findByTokenHashForUpdate(hashToken(rawToken))
                .filter(token -> token.getRevokedAt() == null)
                .ifPresent(token -> {
                    token.setRevokedAt(Instant.now(clock));
                    token.setRevocationReason(reason);
                    log.info("Refresh token revoked: tokenId={}, userId={}, reason={}",
                            token.getId(), token.getUser().getId(), reason);
                });
    }

    /** Thu hồi mọi phiên còn hiệu lực khi phát hiện token đã xoay vòng bị dùng lại. */
    private void handleReplay(RefreshToken replayedToken, Instant now) {
        if (RefreshTokenRevocationReason.ROTATED == replayedToken.getRevocationReason()) {
            refreshTokenRepository.revokeAllActiveByUserId(
                    replayedToken.getUser().getId(), now, RefreshTokenRevocationReason.REPLAY_DETECTED);
            log.warn("All active refresh tokens revoked after replay: userId={}, replayedTokenId={}",
                    replayedToken.getUser().getId(), replayedToken.getId());
        }
    }

    private RefreshToken newToken(User user, String rawToken, Instant expiresAt) {
        RefreshToken token = new RefreshToken();
        token.setUser(user);
        token.setTokenHash(hashToken(rawToken));
        token.setExpiresAt(expiresAt);
        return token;
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 algorithm is not available", ex);
        }
    }
}
