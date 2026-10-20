package com.surveyflow.exception;

import com.surveyflow.security.model.AuthErrorCode;

public class AuthenticationException extends org.springframework.security.core.AuthenticationException {

    private final AuthErrorCode errorCode;

    public AuthenticationException(AuthErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public AuthenticationException(AuthErrorCode errorCode, Throwable cause) {
        super(errorCode.getMessage(), cause);
        this.errorCode = errorCode;
    }

    public AuthErrorCode getErrorCode() {
        return errorCode;
    }
}
