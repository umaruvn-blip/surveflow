package com.surveyflow.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import com.surveyflow.dto.response.ApiResponse;
import com.surveyflow.dto.response.auth.GoogleAuthorizationStartResponse;
import com.surveyflow.factory.ApiResponseFactory;
import com.surveyflow.security.handler.GoogleOAuth2SuccessHandler;
import com.surveyflow.security.model.UserPrincipal;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import lombok.extern.slf4j.Slf4j;

@Slf4j(topic = "GOOGLE-OAUTH2-CONTROLLER")
@RestController
public class GoogleOAuth2Controller {

    private final ApiResponseFactory apiResponseFactory;

    public GoogleOAuth2Controller(ApiResponseFactory apiResponseFactory) {
        this.apiResponseFactory = apiResponseFactory;
    }

    public static final String LOGIN_REDIRECT_TO = "google_login_redirect_to";

    /** Bắt đầu Google login và lưu đường dẫn nội bộ cần mở sau khi đăng nhập. */
    @GetMapping("/api/v1/auth/oauth2/google")
    public void startLogin(String redirectTo, HttpServletRequest request, HttpServletResponse response) throws IOException {
        log.info("Google login requested");
        String safeRedirectTo = isSafeRedirect(redirectTo) ? redirectTo : "/dashboard";
        request.getSession(true).setAttribute(LOGIN_REDIRECT_TO, safeRedirectTo);
        response.sendRedirect("/oauth2/authorization/google");
    }

    /** Lưu user hiện tại để hoàn tất liên kết sau callback Google. */
    @PostMapping("/api/v1/auth/oauth2/google/link")
    public ApiResponse<GoogleAuthorizationStartResponse> linkGoogle(@AuthenticationPrincipal UserDetails principal,
                                                                    HttpServletRequest request) {
        if (!(principal instanceof UserPrincipal userPrincipal)) {
            throw new IllegalStateException("Authenticated user principal is unavailable");
        }
        HttpSession session = request.getSession(true);
        session.setAttribute(GoogleOAuth2SuccessHandler.LINK_USER_ID, userPrincipal.getId());
        log.info("Google account link requested: userId={}", userPrincipal.getId());
        return apiResponseFactory.success(
                new GoogleAuthorizationStartResponse("/oauth2/authorization/google"), "Google link started");
    }

    /**
     * Chỉ nhận đường dẫn nội bộ để ngăn OAuth callback chuyển người dùng sang website ngoài.
     * Từ chối null, URL dạng //host, dấu gạch chéo ngược gây cách hiểu khác nhau và CR/LF có thể chèn header.
     */
    private boolean isSafeRedirect(String redirectTo) {
        return redirectTo != null && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
                && !redirectTo.contains("\\") && !redirectTo.contains("\r") && !redirectTo.contains("\n");
    }

}
