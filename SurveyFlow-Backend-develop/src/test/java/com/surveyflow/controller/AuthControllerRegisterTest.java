package com.surveyflow.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.util.Set;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;

import com.surveyflow.common.enums.UserStatus;
import com.surveyflow.dto.request.auth.RegisterRequest;
import com.surveyflow.dto.response.ApiResponse;
import com.surveyflow.dto.response.auth.AuthResponse;
import com.surveyflow.dto.response.auth.RegisterResult;
import com.surveyflow.factory.ApiResponseFactory;
import com.surveyflow.service.AuthService;

@ExtendWith(MockitoExtension.class)
class AuthControllerRegisterTest {

    @Mock
    private AuthService authService;

    @Test
    void registerReturnsCreatedAndSetsSecureRefreshTokenCookie() {
        AuthResponse authResponse = AuthResponse.builder()
                .accessToken("access-token")
                .user(AuthResponse.UserInfo.builder()
                        .id(42L)
                        .email("person@example.com")
                        .status(UserStatus.ACTIVE)
                        .roles(Set.of("USER"))
                        .build())
                .build();
        RegisterRequest request = new RegisterRequest(
                "person@example.com", "strong-password", "Person", null);
        when(authService.register(request)).thenReturn(new RegisterResult(authResponse, "refresh-token"));

        AuthController controller = new AuthController(
                authService,
                new ApiResponseFactory(),
                "refreshToken",
                true,
                "Strict",
                604_800_000L
        );

        ResponseEntity<ApiResponse<AuthResponse>> response = controller.register(request);

        assertThat(response.getStatusCode().value()).isEqualTo(201);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().code()).isEqualTo("CREATED");
        assertThat(response.getBody().data()).isEqualTo(authResponse);
        assertThat(response.getHeaders().getFirst(HttpHeaders.SET_COOKIE))
                .contains("refreshToken=refresh-token")
                .contains("Path=/api/v1/auth")
                .contains("Secure")
                .contains("HttpOnly")
                .contains("SameSite=Strict");
    }
}
