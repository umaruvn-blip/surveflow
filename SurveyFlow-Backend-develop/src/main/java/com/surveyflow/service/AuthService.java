package com.surveyflow.service;

import com.surveyflow.dto.request.auth.LoginRequest;
import com.surveyflow.dto.request.auth.RegisterRequest;
import com.surveyflow.dto.response.auth.LoginResult;
import com.surveyflow.dto.response.auth.RefreshResult;
import com.surveyflow.dto.response.auth.RegisterResult;

public interface AuthService {

    /** Xác thực thông tin đăng nhập và cấp bộ token mới. */
    LoginResult login(LoginRequest request);

    /** Xoay vòng refresh token và cấp access token mới. */
    RefreshResult refresh(String refreshToken);

    /** Tạo tài khoản local và cấp bộ token đăng nhập. */
    RegisterResult register(RegisterRequest request);

    /** Thu hồi refresh token của phiên hiện tại. */
    void logout(String refreshToken);
}
