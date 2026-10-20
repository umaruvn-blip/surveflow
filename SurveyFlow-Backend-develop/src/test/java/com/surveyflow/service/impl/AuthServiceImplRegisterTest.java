package com.surveyflow.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.surveyflow.common.enums.AuthProvider;
import com.surveyflow.common.enums.UserGender;
import com.surveyflow.common.enums.UserStatus;
import com.surveyflow.dto.request.auth.RegisterRequest;
import com.surveyflow.dto.response.auth.RegisterResult;
import com.surveyflow.exception.ConflictException;
import com.surveyflow.model.Role;
import com.surveyflow.model.CreditWallet;
import com.surveyflow.model.User;
import com.surveyflow.model.UserProfile;
import com.surveyflow.model.UserRole;
import com.surveyflow.repository.RoleRepository;
import com.surveyflow.repository.CreditWalletRepository;
import com.surveyflow.repository.UserProfileRepository;
import com.surveyflow.repository.UserRepository;
import com.surveyflow.repository.UserRoleRepository;
import com.surveyflow.security.service.JwtService;
import com.surveyflow.service.CreditWalletBalanceService;
import com.surveyflow.service.RefreshTokenService;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplRegisterTest {

    private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-09-21T00:00:00Z"), ZoneOffset.UTC);

    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtService jwtService;
    @Mock
    private UserRepository userRepository;
    @Mock
    private UserProfileRepository userProfileRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private UserRoleRepository userRoleRepository;
    @Mock
    private CreditWalletRepository creditWalletRepository;
    @Mock
    private CreditWalletBalanceService creditWalletBalanceService;
    @Mock
    private RefreshTokenService refreshTokenService;
    @Mock
    private PasswordEncoder passwordEncoder;

    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        authService = new AuthServiceImpl(
                userRepository,
                userProfileRepository,
                roleRepository,
                userRoleRepository,
                creditWalletRepository,
                creditWalletBalanceService,
                passwordEncoder,
                authenticationManager,
                CLOCK,
                jwtService,
                refreshTokenService
        );
    }

    @Test
    void registerCreatesLocalUserProfileRoleAndTokens() {
        Role role = new Role("USER", "User");
        role.setId(7L);
        when(userRepository.existsByEmailIgnoreCase("person@example.com")).thenReturn(false);
        when(roleRepository.findByCode("USER")).thenReturn(Optional.of(role));
        when(passwordEncoder.encode("strong-password")).thenReturn("bcrypt-hash");
        when(userRepository.saveAndFlush(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(42L);
            return user;
        });
        when(jwtService.generateAccessToken(eq("person@example.com"), anyMap())).thenReturn("access-token");
        when(jwtService.generateRefreshToken(eq("person@example.com"), anyMap())).thenReturn("refresh-token");
        when(jwtService.getRefreshTokenExpirationMs()).thenReturn(604_800_000L);

        RegisterResult result = authService.register(new RegisterRequest(
                "  Person@Example.COM ",
                "strong-password",
                "  Survey Person  ",
                "OTHER"
        ));

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).saveAndFlush(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        assertThat(savedUser.getEmail()).isEqualTo("person@example.com");
        assertThat(savedUser.getPasswordHash()).isEqualTo("bcrypt-hash");
        assertThat(savedUser.getAuthProvider()).isEqualTo(AuthProvider.LOCAL);
        assertThat(savedUser.getStatus()).isEqualTo(UserStatus.ACTIVE);

        ArgumentCaptor<UserProfile> profileCaptor = ArgumentCaptor.forClass(UserProfile.class);
        verify(userProfileRepository).save(profileCaptor.capture());
        assertThat(profileCaptor.getValue().getUser()).isSameAs(savedUser);
        assertThat(profileCaptor.getValue().getDisplayName()).isEqualTo("Survey Person");
        assertThat(profileCaptor.getValue().getGender()).isEqualTo(UserGender.OTHER);

        ArgumentCaptor<UserRole> roleCaptor = ArgumentCaptor.forClass(UserRole.class);
        verify(userRoleRepository).save(roleCaptor.capture());
        assertThat(roleCaptor.getValue().getUser()).isSameAs(savedUser);
        assertThat(roleCaptor.getValue().getRole()).isSameAs(role);

        ArgumentCaptor<CreditWallet> walletCaptor = ArgumentCaptor.forClass(CreditWallet.class);
        verify(creditWalletRepository).save(walletCaptor.capture());
        assertThat(walletCaptor.getValue().getUser()).isSameAs(savedUser);
        assertThat(walletCaptor.getValue().getBalance()).isZero();
        verify(creditWalletBalanceService).initializeForRegistration(42L);

        verify(passwordEncoder).encode("strong-password");
        verify(refreshTokenService).issue(
                eq(savedUser),
                eq("refresh-token"),
                any(Instant.class)
        );
        assertThat(result.refreshToken()).isEqualTo("refresh-token");
        assertThat(result.response().accessToken()).isEqualTo("access-token");
        assertThat(result.response().user().id()).isEqualTo(42L);
        assertThat(result.response().user().roles()).containsExactly("USER");
    }

    @Test
    void registerRewardsVerifiedReferrerAfterCreatingWallet() {
        User referrer = new User();
        referrer.setId(7L);
        referrer.setReferralCode("ABC123DEF456");
        Role role = new Role("USER", "User");
        when(userRepository.findByReferralCodeIgnoreCase("ABC123DEF456"))
                .thenReturn(Optional.of(referrer));
        when(roleRepository.findByCode("USER")).thenReturn(Optional.of(role));
        when(passwordEncoder.encode("strong-password")).thenReturn("bcrypt-hash");
        when(userRepository.saveAndFlush(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(42L);
            return user;
        });
        when(jwtService.generateAccessToken(eq("person@example.com"), anyMap())).thenReturn("access-token");
        when(jwtService.generateRefreshToken(eq("person@example.com"), anyMap())).thenReturn("refresh-token");
        when(jwtService.getRefreshTokenExpirationMs()).thenReturn(604_800_000L);

        authService.register(new RegisterRequest(
                "person@example.com", "strong-password", null, null, "abc123def456"));

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).saveAndFlush(userCaptor.capture());
        assertThat(userCaptor.getValue().getReferredBy()).isSameAs(referrer);
        verify(creditWalletBalanceService).initializeForRegistration(42L);
        verify(creditWalletBalanceService).rewardQualifiedReferral(7L, 42L);
    }

    @Test
    void registerRejectsAnExistingEmailIgnoringCase() {
        when(userRepository.existsByEmailIgnoreCase("person@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(new RegisterRequest(
                "Person@Example.com", "strong-password", null, null)))
                .isInstanceOf(ConflictException.class)
                .hasMessage("Email is already registered");

        verify(passwordEncoder, never()).encode(any());
        verify(userRepository, never()).saveAndFlush(any());
    }
}
