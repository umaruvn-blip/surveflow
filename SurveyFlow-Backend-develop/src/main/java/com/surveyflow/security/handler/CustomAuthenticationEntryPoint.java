package com.surveyflow.security.handler;

import java.io.IOException;
import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import com.surveyflow.dto.response.ErrorResponse;
import com.surveyflow.security.model.AuthErrorCode;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import tools.jackson.databind.ObjectMapper;

@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private static final String AUTH_ERROR_CODE_ATTR = "auth_error_code";
    private static final String AUTH_ERROR_MESSAGE_ATTR = "auth_error_message";

    private final ObjectMapper objectMapper;

    public CustomAuthenticationEntryPoint(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * Trả về lỗi 401 theo chuẩn ErrorResponse khi xác thực thất bại.
     */
    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        AuthErrorCode authErrorCode = authException instanceof com.surveyflow.exception.AuthenticationException appException
                ? appException.getErrorCode()
                : readAuthErrorCode(request.getAttribute(AUTH_ERROR_CODE_ATTR));
        String message = readMessage(
                request.getAttribute(AUTH_ERROR_MESSAGE_ATTR),
                authException.getMessage() != null ? authException.getMessage() : authErrorCode.getMessage()
        );

        ErrorResponse body = ErrorResponse.builder()
                .code(authErrorCode.getCode())
                .status(HttpStatus.UNAUTHORIZED.value())
                .message(message)
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .build();

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getOutputStream(), body);
    }

    /**
     * Đọc request attribute theo kiểu AuthErrorCode, fallback nếu không tồn tại.
     */
    private AuthErrorCode readAuthErrorCode(Object value) {
        if (value instanceof AuthErrorCode authErrorCode) {
            return authErrorCode;
        }

        if (value instanceof String str) {
            try {
                return AuthErrorCode.valueOf(str);
            } catch (IllegalArgumentException ex) {
                return AuthErrorCode.UNAUTHORIZED;
            }
        }

        return AuthErrorCode.UNAUTHORIZED;
    }

    /**
     * Đọc request attribute theo kiểu String, fallback nếu không tồn tại.
     */
    private String readMessage(Object value, String fallback) {
        return value instanceof String str ? str : fallback;
    }
}
