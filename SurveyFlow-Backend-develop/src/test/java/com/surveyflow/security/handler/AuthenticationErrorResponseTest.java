package com.surveyflow.security.handler;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import com.surveyflow.exception.AuthenticationException;
import com.surveyflow.exception.GlobalExceptionHandler;
import com.surveyflow.security.model.AuthErrorCode;

import tools.jackson.databind.ObjectMapper;

class AuthenticationErrorResponseTest {

    @Test
    void entryPointReturnsSpecificTokenCode() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/surveys");
        MockHttpServletResponse response = new MockHttpServletResponse();

        new CustomAuthenticationEntryPoint(new ObjectMapper()).commence(
                request, response, new AuthenticationException(AuthErrorCode.TOKEN_EXPIRED));

        assertThat(response.getStatus()).isEqualTo(401);
        assertThat(response.getContentAsString()).contains("\"code\":\"TOKEN_EXPIRED\"");
    }

    @Test
    void globalHandlerReturnsSpecificCredentialsCode() {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/login");

        var response = new GlobalExceptionHandler().handleAuthentication(
                new AuthenticationException(AuthErrorCode.INVALID_CREDENTIALS), request);

        assertThat(response.status()).isEqualTo(401);
        assertThat(response.code()).isEqualTo("INVALID_CREDENTIALS");
        assertThat(response.message()).isEqualTo("Invalid email or password");
    }
}
