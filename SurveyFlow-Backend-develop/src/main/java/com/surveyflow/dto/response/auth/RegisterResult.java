package com.surveyflow.dto.response.auth;

/**
 * Internal result used to keep the refresh token out of the JSON response.
 */
public record RegisterResult(AuthResponse response, String refreshToken) {
}
