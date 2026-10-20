package com.surveyflow.factory;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import com.surveyflow.dto.response.ApiResponse;

@Component
public class ApiResponseFactory {

    /** Tạo response thành công với message mặc định. */
    public <T> ApiResponse<T> success(T data) {
        return success(data, "Success");
    }

    /** Tạo response thành công với message tùy chỉnh. */
    public <T> ApiResponse<T> success(T data, String message) {
        return build(HttpStatus.OK, "SUCCESS", message, data);
    }

    /** Tạo response cho nghiệp vụ tạo mới thành công. */
    public <T> ApiResponse<T> created(T data, String message) {
        return build(HttpStatus.CREATED, "CREATED", message, data);
    }

    /** Dựng cấu trúc response thành công chuẩn. */
    private <T> ApiResponse<T> build(HttpStatus status, String code, String message, T data) {
        return ApiResponse.<T>builder()
                .status(status.value())
                .code(code)
                .success(true)
                .message(message)
                .data(data)
                .build();
    }
}
