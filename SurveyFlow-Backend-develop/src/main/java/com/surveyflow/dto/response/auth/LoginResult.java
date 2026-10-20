package com.surveyflow.dto.response.auth;

public record LoginResult(AuthResponse response, String refreshToken) {
}
