package com.surveyflow.exception;

public class GoogleAccountLinkRequiredException extends RuntimeException {

    public GoogleAccountLinkRequiredException() {
        super("Sign in with the existing account before linking Google");
    }
}
