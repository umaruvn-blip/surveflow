package com.surveyflow.security.filter;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.surveyflow.security.model.AuthErrorCode;
import com.surveyflow.exception.AuthenticationException;
import com.surveyflow.security.handler.CustomAuthenticationEntryPoint;
import com.surveyflow.security.service.JwtService;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Slf4j(topic = "JWT-AUTHENTICATION-SECURITY-FILTER")
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String AUTHORIZATION = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";
    private static final String AUTH_ERROR_CODE_ATTR = "auth_error_code";
    private static final String AUTH_ERROR_MESSAGE_ATTR = "auth_error_message";

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final CustomAuthenticationEntryPoint authenticationEntryPoint;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService,
                                   CustomAuthenticationEntryPoint authenticationEntryPoint) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.authenticationEntryPoint = authenticationEntryPoint;
    }

    /**
     * Lọc request, đọc Bearer token và gắn thông tin user vào SecurityContext nếu hợp lệ.
     * Filter chỉ xử lý access token; refresh token không đi qua Authorization header mà nằm trong cookie auth endpoint.
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader(AUTHORIZATION);

        if (header == null || !header.startsWith(BEARER_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(BEARER_PREFIX.length());

        try {
            Claims claims = jwtService.extractAllClaims(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(claims.getSubject());

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (ExpiredJwtException ex) {
            commenceAuthenticationError(request, response, AuthErrorCode.TOKEN_EXPIRED, ex);
            return;
        } catch (MalformedJwtException ex) {
            commenceAuthenticationError(request, response, AuthErrorCode.TOKEN_MALFORMED, ex);
            return;
        } catch (UnsupportedJwtException ex) {
            commenceAuthenticationError(request, response, AuthErrorCode.TOKEN_UNSUPPORTED, ex);
            return;
        } catch (SignatureException ex) {
            commenceAuthenticationError(request, response, AuthErrorCode.TOKEN_SIGNATURE_INVALID, ex);
            return;
        } catch (JwtException | IllegalArgumentException
                 | org.springframework.security.core.AuthenticationException ex) {
            commenceAuthenticationError(request, response, AuthErrorCode.TOKEN_INVALID, ex);
            return;
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Gắn thông tin lỗi xác thực vào request để entry point dựng response thống nhất.
     */
    private void setAuthError(HttpServletRequest request, AuthErrorCode authErrorCode) {
        request.setAttribute(AUTH_ERROR_CODE_ATTR, authErrorCode);
        request.setAttribute(AUTH_ERROR_MESSAGE_ATTR, authErrorCode.getMessage());
    }

    /** Gửi lỗi JWT qua entry point vì filter này chạy trước bộ xử lý exception của Spring Security. */
    private void commenceAuthenticationError(HttpServletRequest request,
                                             HttpServletResponse response,
                                             AuthErrorCode errorCode,
                                             Exception ex) throws IOException, ServletException {
        SecurityContextHolder.clearContext();
        setAuthError(request, errorCode);
        log.warn("Bearer token rejected: errorCode={}, path={}", errorCode.getCode(), request.getRequestURI());
        authenticationEntryPoint.commence(request, response, new AuthenticationException(errorCode, ex));
    }
}
