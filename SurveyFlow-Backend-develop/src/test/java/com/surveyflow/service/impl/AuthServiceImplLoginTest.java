package com.surveyflow.service.impl;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.Clock;

import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;

import com.surveyflow.dto.request.auth.LoginRequest;
import com.surveyflow.exception.AuthenticationException;
import com.surveyflow.security.model.AuthErrorCode;

import static org.mockito.Mockito.mock;

class AuthServiceImplLoginTest {

    @Test
    void invalidCredentialsBecomeCodedAuthenticationError() {
        AuthenticationManager authenticationManager = mock(AuthenticationManager.class);
        when(authenticationManager.authenticate(any(Authentication.class)))
                .thenThrow(new BadCredentialsException("bad credentials"));
        AuthServiceImpl service = new AuthServiceImpl(null, null, null, null, null, null, null,
                authenticationManager, Clock.systemUTC(), null, null);

        assertThatThrownBy(() -> service.login(new LoginRequest("person@example.com", "wrong")))
                .isInstanceOf(AuthenticationException.class)
                .extracting(ex -> ((AuthenticationException) ex).getErrorCode())
                .isEqualTo(AuthErrorCode.INVALID_CREDENTIALS);
    }
}
