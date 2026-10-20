package com.surveyflow.security.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum AuthErrorCode {
    UNAUTHORIZED("UNAUTHORIZED", "Unauthorized"),
    INVALID_CREDENTIALS("INVALID_CREDENTIALS", "Invalid email or password"),
    AUTHENTICATION_FAILED("AUTHENTICATION_FAILED", "Authentication failed"),
    TOKEN_EXPIRED("TOKEN_EXPIRED", "JWT token has expired"),
    TOKEN_MALFORMED("TOKEN_MALFORMED", "JWT token is malformed"),
    TOKEN_UNSUPPORTED("TOKEN_UNSUPPORTED", "JWT token is unsupported"),
    TOKEN_SIGNATURE_INVALID("TOKEN_SIGNATURE_INVALID", "JWT signature is invalid"),
    TOKEN_INVALID("TOKEN_INVALID", "JWT token is invalid");

    private final String code;
    private final String message;
}
