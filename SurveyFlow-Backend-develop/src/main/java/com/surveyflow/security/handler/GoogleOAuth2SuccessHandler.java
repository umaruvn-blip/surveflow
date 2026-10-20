package com.surveyflow.security.handler;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.surveyflow.dto.response.auth.LoginResult;
import com.surveyflow.exception.ConflictException;
import com.surveyflow.exception.GoogleAccountLinkRequiredException;
import com.surveyflow.service.GoogleAuthService;
import com.surveyflow.controller.GoogleOAuth2Controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j(topic = "GOOGLE-OAUTH2-SUCCESS-SECURITY-HANDLER")
@Component
@RequiredArgsConstructor
public class GoogleOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    public static final String LINK_USER_ID = "google_link_user_id";

    private final GoogleAuthService googleAuthService;
    @Value("${app.jwt.refresh-token-cookie-name}")
    private String refreshTokenCookieName;
    @Value("${app.jwt.refresh-token-cookie-secure}")
    private boolean refreshTokenCookieSecure;
    @Value("${app.jwt.refresh-token-cookie-same-site}")
    private String refreshTokenCookieSameSite;
    @Value("${app.jwt.refresh-token-expiration-ms}")
    private long refreshTokenExpirationMs;
    @Value("${app.oauth2.frontend-callback-url:http://localhost:5173/auth/callback}")
    private String frontendCallbackUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        HttpSession session = request.getSession(false);
        Object linkUserId = session == null ? null : session.getAttribute(LINK_USER_ID);
        OidcUser googleUser = (OidcUser) authentication.getPrincipal();

        try {
            if (linkUserId instanceof Long userId) {
                googleAuthService.linkIdentity(userId, googleUser);
                log.info("Google OAuth2 account linked: userId={}", userId);
                invalidateSession(session);
                response.sendRedirect(frontendCallbackUrl + "?oauth=linked");
                return;
            }

            LoginResult login = googleAuthService.loginOrRegister(googleUser);
            log.info("Google OAuth2 login completed");
            response.addHeader(HttpHeaders.SET_COOKIE, buildRefreshCookie(login.refreshToken()));
            Object redirectTo = session == null ? null : session.getAttribute(GoogleOAuth2Controller.LOGIN_REDIRECT_TO);
            String target = redirectTo instanceof String path ? path : "/dashboard";
            invalidateSession(session);

            String redirectUrl = frontendCallbackUrl + "?oauth=login"
                    + "&accessToken=" + URLEncoder.encode(login.response().accessToken(), StandardCharsets.UTF_8)
                    + "&userId=" + login.response().user().id()
                    + "&email=" + URLEncoder.encode(login.response().user().email(), StandardCharsets.UTF_8)
                    + "&status=" + URLEncoder.encode(login.response().user().status().name(), StandardCharsets.UTF_8)
                    + "&roles=" + URLEncoder.encode(String.join(",", login.response().user().roles()), StandardCharsets.UTF_8)
                    + "&redirectTo=" + URLEncoder.encode(target, StandardCharsets.UTF_8);
            response.sendRedirect(redirectUrl);
        } catch (GoogleAccountLinkRequiredException exception) {
            log.warn("Google OAuth2 login requires account linking");
            invalidateSession(session);
            response.sendRedirect(frontendCallbackUrl + "?oauth=link-required");
        } catch (ConflictException exception) {
            log.warn("Google OAuth2 account link conflict");
            invalidateSession(session);
            response.sendRedirect(frontendCallbackUrl + "?oauth=link-conflict");
        } catch (RuntimeException exception) {
            log.error("Google OAuth2 callback failed: cause={}", exception.getClass().getSimpleName());
            invalidateSession(session);
            response.sendRedirect(frontendCallbackUrl + "?oauth=failed");
        }
    }

    /**
     * Xóa session OAuth tạm sau callback để không giữ phiên đăng nhập Spring Security.
     */
    private void invalidateSession(HttpSession session) {
        if (session != null) {
            session.invalidate();
        }
    }

    /**
     * Tạo cookie refresh HttpOnly theo thuộc tính và thời hạn cấu hình của ứng dụng.
     */
    private String buildRefreshCookie(String refreshToken) {
        return refreshTokenCookieName + "=" + refreshToken
                + "; Path=/api/v1/auth; Max-Age=" + Duration.ofMillis(refreshTokenExpirationMs).toSeconds()
                + "; HttpOnly; SameSite=" + refreshTokenCookieSameSite
                + (refreshTokenCookieSecure ? "; Secure" : "");
    }
}
