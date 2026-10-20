package com.surveyflow.service.impl;

import java.time.Clock;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import com.surveyflow.dto.response.auth.TokenPair;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.surveyflow.dto.request.auth.LoginRequest;
import com.surveyflow.dto.request.auth.RegisterRequest;
import com.surveyflow.dto.response.auth.AuthResponse;
import com.surveyflow.dto.response.auth.LoginResult;
import com.surveyflow.dto.response.auth.RefreshResult;
import com.surveyflow.exception.InvalidRefreshTokenException;
import com.surveyflow.exception.AuthenticationException;
import com.surveyflow.dto.response.auth.RegisterResult;
import com.surveyflow.exception.ConflictException;
import com.surveyflow.exception.InvalidRequestException;
import com.surveyflow.common.enums.AuthProvider;
import com.surveyflow.common.enums.UserStatus;
import com.surveyflow.model.Role;
import com.surveyflow.model.User;
import com.surveyflow.model.CreditWallet;
import com.surveyflow.model.UserProfile;
import com.surveyflow.model.UserRole;
import com.surveyflow.repository.RefreshTokenRepository;
import com.surveyflow.repository.CreditWalletRepository;
import com.surveyflow.repository.RoleRepository;
import com.surveyflow.repository.UserRepository;
import com.surveyflow.repository.UserProfileRepository;
import com.surveyflow.repository.UserRoleRepository;
import com.surveyflow.security.service.JwtService;
import com.surveyflow.security.model.AuthErrorCode;
import com.surveyflow.service.AuthService;
import com.surveyflow.service.CreditWalletBalanceService;
import com.surveyflow.service.RefreshTokenService;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;

import static com.surveyflow.common.enums.RefreshTokenRevocationReason.LOGOUT;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "AUTH-SERVICE")
public class AuthServiceImpl implements AuthService {

    private static final String DEFAULT_ROLE_CODE = "USER";

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final CreditWalletRepository creditWalletRepository;
    private final CreditWalletBalanceService creditWalletBalanceService;

    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final Clock clock;

    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    @Override
    @Transactional
    public LoginResult login(LoginRequest request) {
        authenticate(request);

        User user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new AuthenticationException(AuthErrorCode.INVALID_CREDENTIALS));

        Set<String> roles = rolesOf(user);
        Map<String, Object> claims = claimsOf(user, roles);

        String accessToken = jwtService.generateAccessToken(user.getEmail(), claims);
        String refreshToken = jwtService.generateRefreshToken(user.getEmail(), claims);

        refreshTokenService.issue(user, refreshToken, refreshTokenExpiresAt());

        AuthResponse response = buildAuthResponse(user, roles, accessToken);

        log.info("User logged in successfully: userId={}", user.getId());
        return new LoginResult(response, refreshToken);
    }

    @Override
    @Transactional
    public RefreshResult refresh(String refreshToken) {
        Claims currentClaims = parseRefreshToken(refreshToken);
        String subject = currentClaims.getSubject();
        if (subject == null || subject.isBlank()) {
            throw new InvalidRefreshTokenException("Invalid refresh token");
        }

        User user = userRepository.findByEmail(subject)
                .orElseThrow(() -> new InvalidRefreshTokenException("Invalid refresh token"));
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new InvalidRefreshTokenException("Invalid refresh token");
        }
        Set<String> roles = rolesOf(user);
        Map<String, Object> claims = claimsOf(user, roles);
        String replacementRefreshToken = jwtService.generateRefreshToken(user.getEmail(), claims);
        AuthResponse response = buildAuthResponse(
                user, roles, jwtService.generateAccessToken(user.getEmail(), claims));

        refreshTokenService.rotate(
                refreshToken, user, replacementRefreshToken, refreshTokenExpiresAt());

        log.info("Refresh token rotated successfully: userId={}", user.getId());
        return new RefreshResult(response, replacementRefreshToken);
    }

    @Override
    @Transactional
    public RegisterResult register(RegisterRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ConflictException("Email is already registered");
        }

        User referrer = findReferrer(request.referralCode());

        Role defaultRole = roleRepository.findByCode(DEFAULT_ROLE_CODE)
                .orElseThrow(() -> new IllegalStateException("Default USER role is not configured"));

        //User
        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setAuthProvider(AuthProvider.LOCAL);
        user.setStatus(UserStatus.ACTIVE);
        user.setReferredBy(referrer);

        //Đưa entity User vào persistence context
        //Hibernate gửi câu INSERT xuống database ngay lập tức
        try {
            userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException ex) {
            throw new ConflictException("Email is already registered");
        }

        //User Profile
        UserProfile profile = new UserProfile();
        profile.setUser(user);
        profile.setDisplayName(normalizeOptionalText(request.displayName()));
        profile.setGender(request.genderValue());
        userProfileRepository.save(profile);

        //User Role
        UserRole userRole = new UserRole();
        userRole.setUser(user);
        userRole.setRole(defaultRole);
        userRoleRepository.save(userRole);

        CreditWallet wallet = new CreditWallet();
        wallet.setUser(user);
        creditWalletRepository.save(wallet);

        //Add credit
        creditWalletBalanceService.initializeForRegistration(user.getId());
        if (referrer != null) {
            creditWalletBalanceService.rewardQualifiedReferral(referrer.getId(), user.getId());
        }

        Set<String> roles = Set.of(defaultRole.getCode());
        TokenPair tokenPair = issueTokens(user, roles);

        log.info("User registered successfully: userId={}", user.getId());
        return new RegisterResult(tokenPair.response(), tokenPair.refreshToken());
    }

    private User findReferrer(String referralCode) {
        if (referralCode == null || referralCode.isBlank()) {
            return null;
        }
        User referrer = userRepository.findByReferralCodeIgnoreCase(referralCode)
                .orElseThrow(() -> new InvalidRequestException("Referral code is invalid"));
        if (referrer.getStatus() != UserStatus.ACTIVE) {
            throw new InvalidRequestException("Referral code is invalid");
        }
        return referrer;
    }

    @Override
    @Transactional
    public void logout(String refreshToken) {
        refreshTokenService.revoke(refreshToken, LOGOUT);
    }

    /**
     * Xác thực credential bằng cấu hình Spring Security hiện tại.
     */
    private void authenticate(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password())
            );
        } catch (BadCredentialsException ex) {
            log.warn("Login failed because credentials are invalid");
            throw new AuthenticationException(AuthErrorCode.INVALID_CREDENTIALS, ex);
        } catch (org.springframework.security.core.AuthenticationException ex) {
            log.warn("Login failed during authentication");
            throw new AuthenticationException(AuthErrorCode.AUTHENTICATION_FAILED, ex);
        }
    }

    /**
     * Xác minh chữ ký và thời hạn của refresh token.
     */
    private Claims parseRefreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new InvalidRefreshTokenException("Refresh token is required");
        }

        try {
            return jwtService.extractAllRefreshTokenClaims(refreshToken);
        } catch (JwtException | IllegalArgumentException ex) {
            throw new InvalidRefreshTokenException("Invalid or expired refresh token");
        }
    }

    /**
     * Phát bộ token và lưu refresh token cho user.
     */
    private TokenPair issueTokens(User user, Set<String> roles) {
        Map<String, Object> claims = Map.of(
                "userId", user.getId(),
                "email", user.getEmail(),
                "roles", roles
        );

        String accessToken = jwtService.generateAccessToken(user.getEmail(), claims);
        String refreshToken = jwtService.generateRefreshToken(user.getEmail(), claims);
        refreshTokenService.issue(user, refreshToken, refreshTokenExpiresAt());

        AuthResponse response = AuthResponse.builder()
                .accessToken(accessToken)
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .status(user.getStatus())
                        .roles(roles)
                        .build())
                .build();
        return new TokenPair(response, refreshToken);
    }

    private String normalizeEmail(String email) {
        return email.strip().toLowerCase(Locale.ROOT);
    }

    private String normalizeOptionalText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.strip();
    }

    private Instant refreshTokenExpiresAt() {
        return Instant.now(clock).plusMillis(jwtService.getRefreshTokenExpirationMs());
    }

    private Set<String> rolesOf(User user) {
        return user.getRoles().stream()
                .map(Role::getCode)
                .collect(Collectors.toSet());
    }

    private Map<String, Object> claimsOf(User user, Set<String> roles) {
        return Map.of("userId", user.getId(), "email", user.getEmail(), "roles", roles);
    }

    private AuthResponse buildAuthResponse(User user, Set<String> roles, String accessToken) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .status(user.getStatus())
                        .roles(roles)
                        .build())
                .build();
    }
}
