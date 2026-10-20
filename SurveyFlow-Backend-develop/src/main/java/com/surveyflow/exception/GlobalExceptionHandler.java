package com.surveyflow.exception;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.surveyflow.dto.response.ErrorResponse;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;

@Slf4j(topic = "GLOBAL-EXCEPTION-HANDLER")
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ========== BUSINESS EXCEPTIONS ==========
    @ExceptionHandler(AuthenticationException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ErrorResponse handleAuthentication(AuthenticationException ex,
                                              HttpServletRequest request) {
        return buildErrorResponse(ex.getErrorCode().getCode(), HttpStatus.UNAUTHORIZED,
                ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleResourceNotFound(ResourceNotFoundException ex,
                                                HttpServletRequest request) {
        return buildErrorResponse("RESOURCE_NOT_FOUND", HttpStatus.NOT_FOUND, ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(InvalidRequestException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleInvalidRequest(InvalidRequestException ex,
                                              HttpServletRequest request) {
        return buildErrorResponse("INVALID_REQUEST", HttpStatus.BAD_REQUEST, ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(InvalidRefreshTokenException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ErrorResponse handleInvalidRefreshToken(InvalidRefreshTokenException ex,
                                                   HttpServletRequest request) {
        return buildErrorResponse("INVALID_REFRESH_TOKEN", HttpStatus.UNAUTHORIZED,
                ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(UnauthorizedException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ErrorResponse handleUnauthorized(UnauthorizedException ex,
                                            HttpServletRequest request) {
        return buildErrorResponse("UNAUTHORIZED", HttpStatus.UNAUTHORIZED,
                ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(ConflictException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ErrorResponse handleConflict(ConflictException ex,
                                        HttpServletRequest request) {
        return buildErrorResponse("CONFLICT", HttpStatus.CONFLICT, ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(BusinessException.class)
    @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
    public ErrorResponse handleBusiness(BusinessException ex,
                                        HttpServletRequest request) {
        return buildErrorResponse("BUSINESS_ERROR", HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage(), request.getRequestURI());
    }

    // ========== VALIDATION EXCEPTIONS ==========
    @ExceptionHandler(HttpMessageNotReadableException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleUnreadableRequest(HttpMessageNotReadableException ex,
                                                 HttpServletRequest request) {
        return buildErrorResponse("INVALID_REQUEST", HttpStatus.BAD_REQUEST,
                "Request body is invalid", request.getRequestURI());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleMethodArgumentNotValid(MethodArgumentNotValidException ex,
                                                      HttpServletRequest request) {
        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(this::buildFieldValidationMessage)
                .collect(Collectors.joining("; "));

        return buildErrorResponse("VALIDATION_ERROR", HttpStatus.BAD_REQUEST, message, request.getRequestURI());
    }

    @ExceptionHandler(ConstraintViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleConstraintViolation(ConstraintViolationException ex,
                                                   HttpServletRequest request) {
        String message = ex.getConstraintViolations()
                .stream()
                .map(violation -> violation.getPropertyPath() + ": " + violation.getMessage())
                .collect(Collectors.joining("; "));

        return buildErrorResponse("VALIDATION_ERROR", HttpStatus.BAD_REQUEST, message, request.getRequestURI());
    }

    // ========== FALLBACK EXCEPTION ==========
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorResponse handleUnexpected(Exception ex,
                                          HttpServletRequest request) {
        log.error("Unexpected request failure: path={}, cause={}",
                request.getRequestURI(), ex.getClass().getSimpleName());
        return buildErrorResponse("INTERNAL_SERVER_ERROR", HttpStatus.INTERNAL_SERVER_ERROR,
                "Unexpected error occurred", request.getRequestURI());
    }

    // ========== INTERNAL HELPERS ==========
    private String buildFieldValidationMessage(FieldError fieldError) {
        return fieldError.getField() + ": " + fieldError.getDefaultMessage();
    }

    private ErrorResponse buildErrorResponse(String code, HttpStatus status,
                                             String message, String path) {
        return ErrorResponse.builder()
                .code(code)
                .status(status.value())
                .message(message)
                .path(path)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
