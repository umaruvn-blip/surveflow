package com.surveyflow.service.impl;

import static com.surveyflow.common.enums.RefreshTokenRevocationReason.REPLAY_DETECTED;
import static com.surveyflow.common.enums.RefreshTokenRevocationReason.ROTATED;
import static com.surveyflow.common.enums.RefreshTokenRevocationReason.EXPIRED;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.surveyflow.exception.InvalidRefreshTokenException;
import com.surveyflow.model.RefreshToken;
import com.surveyflow.model.User;
import com.surveyflow.repository.RefreshTokenRepository;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceImplTest {

    private static final Instant NOW = Instant.parse("2026-09-21T12:00:00Z");

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    private RefreshTokenServiceImpl service;
    private User user;

    @BeforeEach
    void setUp() {
        service = new RefreshTokenServiceImpl(
                refreshTokenRepository, Clock.fixed(NOW, ZoneOffset.UTC));
        user = new User();
        user.setId(42L);
        user.setEmail("person@example.com");
    }

    @Test
    void rotateRevokesCurrentTokenAndLinksReplacement() {
        RefreshToken current = activeToken();
        when(refreshTokenRepository.findByTokenHashForUpdate(any())).thenReturn(Optional.of(current));
        when(refreshTokenRepository.save(any())).thenAnswer(invocation -> {
            RefreshToken saved = invocation.getArgument(0);
            saved.setId(2L);
            return saved;
        });

        Instant replacementExpiry = NOW.plusSeconds(3600);
        service.rotate("current-token", user, "replacement-token", replacementExpiry);

        assertThat(current.getRevokedAt()).isEqualTo(NOW);
        assertThat(current.getRevocationReason()).isEqualTo(ROTATED);
        assertThat(current.getReplacedByToken()).isNotNull();
        assertThat(current.getReplacedByToken().getUser()).isSameAs(user);
        assertThat(current.getReplacedByToken().getExpiresAt()).isEqualTo(replacementExpiry);
        assertThat(current.getReplacedByToken().getTokenHash()).hasSize(64);
        assertThat(current.getReplacedByToken().getTokenHash()).doesNotContain("replacement-token");
    }

    @Test
    void rotateRejectsReplayAndRevokesAllActiveTokensForUser() {
        RefreshToken replayed = activeToken();
        replayed.setRevokedAt(NOW.minusSeconds(10));
        replayed.setRevocationReason(ROTATED);
        when(refreshTokenRepository.findByTokenHashForUpdate(any())).thenReturn(Optional.of(replayed));

        assertThatThrownBy(() -> service.rotate(
                "replayed-token", user, "replacement-token", NOW.plusSeconds(3600)))
                .isInstanceOf(InvalidRefreshTokenException.class)
                .hasMessage("Invalid refresh token");

        verify(refreshTokenRepository).revokeAllActiveByUserId(
                42L, NOW, REPLAY_DETECTED);
        verify(refreshTokenRepository, never()).save(any());
    }

    @Test
    void rotateRejectsExpiredDatabaseToken() {
        RefreshToken expired = activeToken();
        expired.setExpiresAt(NOW);
        when(refreshTokenRepository.findByTokenHashForUpdate(any())).thenReturn(Optional.of(expired));

        assertThatThrownBy(() -> service.rotate(
                "expired-token", user, "replacement-token", NOW.plusSeconds(3600)))
                .isInstanceOf(InvalidRefreshTokenException.class)
                .hasMessage("Refresh token has expired");

        assertThat(expired.getRevokedAt()).isEqualTo(NOW);
        assertThat(expired.getRevocationReason()).isEqualTo(EXPIRED);
        verify(refreshTokenRepository, never()).save(any());
    }

    @Test
    void rotateRejectsTokenOwnedByAnotherUser() {
        User anotherUser = new User();
        anotherUser.setId(7L);
        RefreshToken current = activeToken();
        when(refreshTokenRepository.findByTokenHashForUpdate(any())).thenReturn(Optional.of(current));

        assertThatThrownBy(() -> service.rotate(
                "current-token", anotherUser, "replacement-token", NOW.plusSeconds(3600)))
                .isInstanceOf(InvalidRefreshTokenException.class);

        assertThat(current.getRevokedAt()).isNull();
        verify(refreshTokenRepository, never()).save(any());
    }

    private RefreshToken activeToken() {
        RefreshToken token = new RefreshToken();
        token.setId(1L);
        token.setUser(user);
        token.setTokenHash("stored-hash");
        token.setExpiresAt(NOW.plusSeconds(1800));
        return token;
    }
}
