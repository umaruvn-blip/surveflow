package com.surveyflow.security.handler;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;

@Slf4j(topic = "GOOGLE-OAUTH2-FAILURE-SECURITY-HANDLER")
@Component
public class GoogleOAuth2FailureHandler implements AuthenticationFailureHandler {

    @Value("${app.oauth2.frontend-callback-url:http://localhost:5173/auth/callback}")
    private String frontendCallbackUrl;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                        AuthenticationException exception) throws IOException, ServletException {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        log.warn("Google OAuth2 authentication failed: cause={}", exception.getClass().getSimpleName());
        response.sendRedirect(frontendCallbackUrl + "?oauth=failed");
    }
}
