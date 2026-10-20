package com.surveyflow.service.impl;

import java.time.Clock;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.surveyflow.common.enums.AuthProvider;
import com.surveyflow.common.enums.UserStatus;
import com.surveyflow.dto.response.auth.AuthResponse;
import com.surveyflow.dto.response.auth.LoginResult;
import com.surveyflow.exception.ConflictException;
import com.surveyflow.exception.GoogleAccountLinkRequiredException;
import com.surveyflow.exception.InvalidRequestException;
import com.surveyflow.model.Role;
import com.surveyflow.model.CreditWallet;
import com.surveyflow.model.User;
import com.surveyflow.model.UserAuthIdentity;
import com.surveyflow.model.UserProfile;
import com.surveyflow.model.UserRole;
import com.surveyflow.repository.RoleRepository;
import com.surveyflow.repository.CreditWalletRepository;
import com.surveyflow.repository.UserAuthIdentityRepository;
import com.surveyflow.repository.UserProfileRepository;
import com.surveyflow.repository.UserRepository;
import com.surveyflow.repository.UserRoleRepository;
import com.surveyflow.security.service.JwtService;
import com.surveyflow.service.GoogleAuthService;
import com.surveyflow.service.CreditWalletBalanceService;
import com.surveyflow.service.RefreshTokenService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j(topic = "GOOGLE-AUTH-SERVICE")
@Service
@RequiredArgsConstructor
public class GoogleAuthServiceImpl implements GoogleAuthService {

    private static final String PROVIDER = "GOOGLE";
    private static final String DEFAULT_ROLE_CODE = "USER";

    private final UserRepository userRepository;
    private final UserAuthIdentityRepository identityRepository;
    private final UserProfileRepository userProfileRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final CreditWalletRepository creditWalletRepository;
    private final CreditWalletBalanceService creditWalletBalanceService;

    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final Clock clock;

    @Override
    @Transactional
    public LoginResult loginOrRegister(OidcUser googleUser) {
        GoogleIdentity google = readIdentity(googleUser);

        UserAuthIdentity identity = identityRepository
                .findByProviderAndIssuerAndSubject(PROVIDER, google.issuer(), google.subject())
                .orElse(null);
        User user;

        if (identity != null) {
            user = identity.getUser();
            log.info("Existing Google identity authenticated: userId={}", user.getId());
        } else {
            user = userRepository.findByEmailIgnoreCase(google.email()).orElse(null);
            if (user != null) {
                log.warn("Google login requires explicit account linking: userId={}", user.getId());
                throw new GoogleAccountLinkRequiredException();
            }
            user = createGoogleUser(google);
            saveIdentity(user, google);
            log.info("Google user registered: userId={}", user.getId());
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new InvalidRequestException("This account is not active");
        }
        return issueLogin(user);
    }

    @Override
    @Transactional
    public void linkIdentity(Long userId, OidcUser googleUser) {
        GoogleIdentity google = readIdentity(googleUser);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new InvalidRequestException("User account was not found"));
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new InvalidRequestException("This account is not active");
        }

        var existing = identityRepository.findByProviderAndIssuerAndSubject(PROVIDER, google.issuer(), google.subject());
        if (existing.isPresent()) {
            if (existing.get().getUser().getId().equals(userId)) {
                log.info("Google account link skipped because identity already belongs to user: userId={}", userId);
                return;
            }
            log.warn("Google account link conflict: userId={}, linkedUserId={}",
                    userId, existing.get().getUser().getId());
            throw new ConflictException("Google account is already linked to another user");
        }
        saveIdentity(user, google);
        log.info("Google account linked: userId={}", userId);
    }

    /**
     * Tạo user Google mới cùng profile và role mặc định trong cùng transaction đăng nhập.
     */
    private User createGoogleUser(GoogleIdentity google) {
        Role defaultRole = roleRepository.findByCode(DEFAULT_ROLE_CODE)
                .orElseThrow(() -> new IllegalStateException("Default USER role is not configured"));
        User user = new User();
        user.setEmail(google.email());
        user.setAuthProvider(AuthProvider.GOOGLE);
        user.setProviderUserId(google.subject());
        user.setStatus(UserStatus.ACTIVE);

        try {
            userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException ex) {
            throw new GoogleAccountLinkRequiredException();
        }

        UserProfile profile = new UserProfile();
        profile.setUser(user);
        profile.setDisplayName(normalizeOptionalText(google.name()));
        profile.setAvatarUrl(normalizeOptionalText(google.picture()));
        userProfileRepository.save(profile);

        UserRole userRole = new UserRole();
        userRole.setUser(user);
        userRole.setRole(defaultRole);
        userRoleRepository.save(userRole);
        CreditWallet wallet = new CreditWallet();
        wallet.setUser(user);
        creditWalletRepository.save(wallet);

        //Add credits
        creditWalletBalanceService.initializeForRegistration(user.getId());

        return user;
    }

    /**
     * Lưu identity Google và chuyển lỗi unique thành xung đột liên kết có thể xử lý.
     */
    private void saveIdentity(User user, GoogleIdentity google) {
        UserAuthIdentity identity = new UserAuthIdentity();
        identity.setUser(user);
        identity.setProvider(PROVIDER);
        identity.setIssuer(google.issuer());
        identity.setSubject(google.subject());
        identity.setEmailAtLink(google.email());
        identity.setEmailVerified(true);
        try {
            identityRepository.saveAndFlush(identity);
        } catch (DataIntegrityViolationException ex) {
            throw new ConflictException("Google account is already linked");
        }
    }

    /**
     * Chỉ chấp nhận claim email đã xác minh và issuer thuộc Google trước khi dùng identity.
     */
    private GoogleIdentity readIdentity(OidcUser user) {
        Boolean emailVerified = user.getClaimAsBoolean("email_verified");
        String email = user.getEmail();
        String subject = user.getSubject();
        String issuer = user.getIssuer() == null ? null : user.getIssuer().toString();
        if (!Boolean.TRUE.equals(emailVerified) || email == null || subject == null || !isGoogleIssuer(issuer)) {
            throw new InvalidRequestException("Google account did not provide a verified email identity");
        }
        return new GoogleIdentity(issuer, subject, email.strip().toLowerCase(Locale.ROOT),
                user.getFullName(), user.getClaimAsString("picture"));
    }

    /**
     * Chấp nhận hai issuer Google được OIDC công bố, không chấp nhận issuer tùy ý.
     */
    private boolean isGoogleIssuer(String issuer) {
        return "https://accounts.google.com".equals(issuer) || "accounts.google.com".equals(issuer);
    }

    /**
     * Phát access/refresh token của Survey Flow và đăng ký refresh token để xoay vòng.
     */
    private LoginResult issueLogin(User user) {
        Set<String> roles = user.getRoles().stream().map(Role::getCode).collect(Collectors.toSet());
        Map<String, Object> claims = Map.of("userId", user.getId(), "email", user.getEmail(), "roles", roles);
        String accessToken = jwtService.generateAccessToken(user.getEmail(), claims);
        String refreshToken = jwtService.generateRefreshToken(user.getEmail(), claims);
        refreshTokenService.issue(user, refreshToken,
                Instant.now(clock).plusMillis(jwtService.getRefreshTokenExpirationMs()));
        AuthResponse response = AuthResponse.builder()
                .accessToken(accessToken)
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId()).email(user.getEmail()).status(user.getStatus()).roles(roles).build())
                .build();
        return new LoginResult(response, refreshToken);
    }

    private String normalizeOptionalText(String value) {
        return value == null || value.isBlank() ? null : value.strip();
    }

    private record GoogleIdentity(String issuer, String subject, String email, String name, String picture) {
    }
}
