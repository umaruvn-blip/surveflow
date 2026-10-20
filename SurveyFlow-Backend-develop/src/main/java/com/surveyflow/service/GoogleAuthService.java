package com.surveyflow.service;

import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import com.surveyflow.dto.response.auth.LoginResult;

public interface GoogleAuthService {

    /** Đăng nhập hoặc đăng ký người dùng từ danh tính Google đã xác minh. */
    LoginResult loginOrRegister(OidcUser googleUser);

    /** Liên kết danh tính Google với tài khoản đã đăng nhập. */
    void linkIdentity(Long userId, OidcUser googleUser);
}
