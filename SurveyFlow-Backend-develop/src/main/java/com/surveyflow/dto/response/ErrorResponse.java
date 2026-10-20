package com.surveyflow.dto.response;

import java.time.LocalDateTime;

import lombok.Builder;

@Builder
public record ErrorResponse(String code, int status, String message, String path, LocalDateTime timestamp) {
}
