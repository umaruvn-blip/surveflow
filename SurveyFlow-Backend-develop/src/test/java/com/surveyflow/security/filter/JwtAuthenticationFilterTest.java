package com.surveyflow.security.filter;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.userdetails.UserDetailsService;

import com.surveyflow.exception.AuthenticationException;
import com.surveyflow.security.handler.CustomAuthenticationEntryPoint;
import com.surveyflow.security.model.AuthErrorCode;
import com.surveyflow.security.service.JwtService;

import io.jsonwebtoken.MalformedJwtException;
import jakarta.servlet.FilterChain;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock private JwtService jwtService;
    @Mock private UserDetailsService userDetailsService;
    @Mock private CustomAuthenticationEntryPoint entryPoint;
    @Mock private FilterChain filterChain;

    @Test
    void malformedTokenIsSentToEntryPointAndStopsFilterChain() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer invalid");
        MockHttpServletResponse response = new MockHttpServletResponse();
        when(jwtService.extractAllClaims("invalid")).thenThrow(new MalformedJwtException("malformed"));

        new JwtAuthenticationFilter(jwtService, userDetailsService, entryPoint)
                .doFilter(request, response, filterChain);

        ArgumentCaptor<org.springframework.security.core.AuthenticationException> error =
                ArgumentCaptor.forClass(org.springframework.security.core.AuthenticationException.class);
        verify(entryPoint).commence(eq(request), eq(response), error.capture());
        assertThat(error.getValue()).isInstanceOf(AuthenticationException.class);
        assertThat(((AuthenticationException) error.getValue()).getErrorCode())
                .isEqualTo(AuthErrorCode.TOKEN_MALFORMED);
        assertThat(request.getAttribute("auth_error_code")).isEqualTo(AuthErrorCode.TOKEN_MALFORMED);
        verify(filterChain, never()).doFilter(any(), any());
    }
}
