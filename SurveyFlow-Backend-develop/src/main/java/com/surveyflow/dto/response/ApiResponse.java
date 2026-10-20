package com.surveyflow.dto.response;

import lombok.Builder;

@Builder
public record ApiResponse<T>(int status, String code, boolean success, String message, T data) {
}
