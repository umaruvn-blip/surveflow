package com.surveyflow.dto.response.auth;

public record TokenPair(AuthResponse response, String refreshToken) {
}
