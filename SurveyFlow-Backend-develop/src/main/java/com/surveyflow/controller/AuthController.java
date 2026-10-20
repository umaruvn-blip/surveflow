package com.surveyflow.controller;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.surveyflow.dto.request.auth.LoginRequest;
import com.surveyflow.dto.request.auth.RegisterRequest;
import com.surveyflow.dto.response.ApiResponse;
import com.surveyflow.dto.response.auth.AuthResponse;
import com.surveyflow.dto.response.auth.LoginResult;
import com.surveyflow.dto.response.auth.RefreshResult;
import com.surveyflow.dto.response.auth.RegisterResult;
import com.surveyflow.factory.ApiResponseFactory;
import com.surveyflow.service.AuthService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@Slf4j(topic = "AUTH-CONTROLLER")
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final ApiResponseFactory apiResponseFactory;
    private final String refreshTokenCookieName;
    private final boolean refreshTokenCookieSecure;
    private final String refreshTokenCookieSameSite;
    private final long refreshTokenExpirationMs;

    public AuthController(AuthService authService,
                          ApiResponseFactory apiResponseFactory,
                          @Value("${app.jwt.refresh-token-cookie-name}") String refreshTokenCookieName,
                          @Value("${app.jwt.refresh-token-cookie-secure}") boolean refreshTokenCookieSecure,
                          @Value("${app.jwt.refresh-token-cookie-same-site}") String refreshTokenCookieSameSite,
                          @Value("${app.jwt.refresh-token-expiration-ms}") long refreshTokenExpirationMs) {
        this.authService = authService;
        this.apiResponseFactory = apiResponseFactory;
        this.refreshTokenCookieName = refreshTokenCookieName;
        this.refreshTokenCookieSecure = refreshTokenCookieSecure;
        this.refreshTokenCookieSameSite = refreshTokenCookieSameSite;
        this.refreshTokenExpirationMs = refreshTokenExpirationMs;
    }

    /** Đăng nhập và lưu refresh token trong HttpOnly cookie. */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login requested");
        LoginResult result = authService.login(request);
        ResponseCookie refreshTokenCookie = buildRefreshTokenCookie(result.refreshToken());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
                .body(apiResponseFactory.success(result.response(), "Login successful"));
    }

    /** Xoay vòng refresh token và trả access token mới. */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(HttpServletRequest request) {
        log.info("Refresh token requested");
        RefreshResult result = authService.refresh(readRefreshTokenCookie(request));
        ResponseCookie refreshTokenCookie = buildRefreshTokenCookie(result.refreshToken());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
                .body(apiResponseFactory.success(result.response(), "Token refreshed successfully"));
    }

    /** Đăng ký tài khoản local và đăng nhập ngay sau khi tạo. */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        log.info("User registration requested");
        RegisterResult result = authService.register(request);
        ResponseCookie refreshTokenCookie = buildRefreshTokenCookie(result.refreshToken());

        return ResponseEntity.status(201)
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
                .body(apiResponseFactory.created(result.response(), "Registration successful"));
    }

    /** Thu hồi refresh token hiện tại và xóa cookie đăng nhập. */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request) {
        log.info("Logout requested");
        String refreshToken = readRefreshTokenCookie(request);
        authService.logout(refreshToken);
        ResponseCookie clearRefreshTokenCookie = buildClearRefreshTokenCookie();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearRefreshTokenCookie.toString())
                .body(apiResponseFactory.success(null, "Logout successful"));
    }

    /** Tạo HttpOnly cookie chứa refresh token. */
    private ResponseCookie buildRefreshTokenCookie(String refreshToken) {
        return ResponseCookie.from(refreshTokenCookieName, refreshToken)
                .httpOnly(true)
                .secure(refreshTokenCookieSecure)
                .sameSite(refreshTokenCookieSameSite)
                .path("/api/v1/auth")
                .maxAge(Duration.ofMillis(refreshTokenExpirationMs))
                .build();
    }

    /** Tạo cookie hết hạn để xóa refresh token trên browser. */
    private ResponseCookie buildClearRefreshTokenCookie() {
        return ResponseCookie.from(refreshTokenCookieName, "")
                .httpOnly(true)
                .secure(refreshTokenCookieSecure)
                .sameSite(refreshTokenCookieSameSite)
                .path("/api/v1/auth")
                .maxAge(Duration.ZERO)
                .build();
    }

    /** Đọc refresh token cookie theo tên cấu hình. */
    private String readRefreshTokenCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }

        for (Cookie cookie : cookies) {
            if (refreshTokenCookieName.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }

        return null;
    }
}
