package com.surveyflow.dto.response.auth;

public record RefreshResult(AuthResponse response, String refreshToken) {
}
