package com.surveyflow.security;

import jakarta.servlet.DispatcherType;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.surveyflow.security.filter.JwtAuthenticationFilter;
import com.surveyflow.security.handler.CustomAccessDeniedHandler;
import com.surveyflow.security.handler.CustomAuthenticationEntryPoint;
import com.surveyflow.security.handler.GoogleOAuth2FailureHandler;
import com.surveyflow.security.handler.GoogleOAuth2SuccessHandler;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomAuthenticationEntryPoint authenticationEntryPoint;
    private final CustomAccessDeniedHandler accessDeniedHandler;
    private final GoogleOAuth2SuccessHandler googleOAuth2SuccessHandler;
    private final GoogleOAuth2FailureHandler googleOAuth2FailureHandler;

    /**
     * Bảo vệ API bằng JWT và tạo session ngắn hạn cho luồng OAuth2 redirect.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) {
        http
                .cors(cors -> {})
                .csrf(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler))
                .authorizeHttpRequests(auth -> auth
                        // Cho phép Spring render error dispatch, thay vì che lỗi ban đầu bằng 401.
                        .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
                        .requestMatchers("/api/v1/auth/oauth2/google/link").authenticated()
                        .requestMatchers(HttpMethod.GET,
                                "/api/v1/categories", "/api/v1/interests", "/api/v1/tags",
                                "/api/v1/badges", "/api/v1/levels", "/api/v1/pricing/**",
                                "/api/v1/leaderboard/**").permitAll()
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/api/v1/auth/**",
                                "/api/v1/health/**",
                                "/api/v1/webhooks/google-forms/**",
                                "/api/v1/feedbacks/**",
                                "/api/v1/attributions/**"
                        ).permitAll()
                        .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                        .anyRequest().authenticated())
                .oauth2Login(oauth2 -> oauth2
                        .successHandler(googleOAuth2SuccessHandler)
                        .failureHandler(googleOAuth2FailureHandler))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Dùng BCrypt để hash password trước khi lưu và verify password khi login.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Expose AuthenticationManager để AuthService dùng kiểm tra email/password.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}
