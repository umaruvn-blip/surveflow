package com.surveyflow.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.net.URI;
import java.time.Clock;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import com.surveyflow.common.enums.UserStatus;
import com.surveyflow.exception.ConflictException;
import com.surveyflow.exception.GoogleAccountLinkRequiredException;
import com.surveyflow.model.Role;
import com.surveyflow.model.User;
import com.surveyflow.model.UserAuthIdentity;
import com.surveyflow.model.UserRole;
import com.surveyflow.repository.RoleRepository;
import com.surveyflow.repository.UserAuthIdentityRepository;
import com.surveyflow.repository.UserProfileRepository;
import com.surveyflow.repository.UserRepository;
import com.surveyflow.repository.UserRoleRepository;
import com.surveyflow.security.service.JwtService;
import com.surveyflow.service.CreditWalletBalanceService;
import com.surveyflow.service.RefreshTokenService;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;

import com.surveyflow.repository.CreditWalletRepository;

class GoogleAuthServiceImplTest {

    private UserRepository userRepository;
    private UserAuthIdentityRepository identityRepository;
    private UserProfileRepository userProfileRepository;
    private RoleRepository roleRepository;
    private UserRoleRepository userRoleRepository;
    private JwtService jwtService;
    private RefreshTokenService refreshTokenService;
    private CreditWalletBalanceService creditWalletBalanceService;
    private GoogleAuthServiceImpl service;
    private OidcUser googleUser;

    @BeforeEach
    void setUp() throws Exception {
        userRepository = mock(UserRepository.class);
        identityRepository = mock(UserAuthIdentityRepository.class);
        userProfileRepository = mock(UserProfileRepository.class);
        roleRepository = mock(RoleRepository.class);
        userRoleRepository = mock(UserRoleRepository.class);
        jwtService = mock(JwtService.class);
        refreshTokenService = mock(RefreshTokenService.class);
        creditWalletBalanceService = mock(CreditWalletBalanceService.class);
        service = new GoogleAuthServiceImpl(userRepository, identityRepository, userProfileRepository,
                roleRepository, userRoleRepository, mock(CreditWalletRepository.class),
                creditWalletBalanceService, jwtService, refreshTokenService, Clock.systemUTC());

        googleUser = mock(OidcUser.class);
        when(googleUser.getClaimAsBoolean("email_verified")).thenReturn(true);
        when(googleUser.getEmail()).thenReturn("student@example.edu");
        when(googleUser.getSubject()).thenReturn("google-subject-1");
        when(googleUser.getIssuer()).thenReturn(URI.create("https://accounts.google.com").toURL());
    }

    @Test
    void logsInByStableGoogleIdentity() {
        User user = activeUser();
        UserAuthIdentity identity = new UserAuthIdentity();
        identity.setUser(user);
        when(identityRepository.findByProviderAndIssuerAndSubject(
                "GOOGLE", "https://accounts.google.com", "google-subject-1"))
                .thenReturn(Optional.of(identity));
        when(jwtService.generateAccessToken(eq(user.getEmail()), any())).thenReturn("access-token");
        when(jwtService.generateRefreshToken(eq(user.getEmail()), any())).thenReturn("refresh-token");
        when(jwtService.getRefreshTokenExpirationMs()).thenReturn(60000L);

        var result = service.loginOrRegister(googleUser);

        assertThat(result.response().accessToken()).isEqualTo("access-token");
        assertThat(result.response().user().id()).isEqualTo(user.getId());
        verify(userRepository, never()).saveAndFlush(any());
        verify(creditWalletBalanceService, never()).initializeForRegistration(any());
        verify(refreshTokenService).issue(eq(user), eq("refresh-token"), any());
    }

    @Test
    void newGoogleUserReceivesRegistrationBonus() {
        Role role = new Role("USER", "User");
        when(roleRepository.findByCode("USER")).thenReturn(Optional.of(role));
        when(userRepository.saveAndFlush(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(42L);
            return user;
        });
        when(jwtService.getRefreshTokenExpirationMs()).thenReturn(60_000L);

        service.loginOrRegister(googleUser);

        verify(creditWalletBalanceService).initializeForRegistration(42L);
    }

    @Test
    void doesNotMergeGoogleLoginWhenEmailBelongsToLocalAccount() {
        when(identityRepository.findByProviderAndIssuerAndSubject(anyString(), anyString(), anyString()))
                .thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCase("student@example.edu"))
                .thenReturn(Optional.of(activeUser()));

        assertThatThrownBy(() -> service.loginOrRegister(googleUser))
                .isInstanceOf(GoogleAccountLinkRequiredException.class);
        verify(identityRepository, never()).saveAndFlush(any());
    }

    @Test
    void rejectsLinkWhenGoogleIdentityBelongsToAnotherUser() throws Exception {
        UserAuthIdentity identity = new UserAuthIdentity();
        identity.setUser(activeUser());
        when(userRepository.findById(20L)).thenReturn(Optional.of(activeUserWithId(20L)));
        when(identityRepository.findByProviderAndIssuerAndSubject(
                "GOOGLE", "https://accounts.google.com", "google-subject-1"))
                .thenReturn(Optional.of(identity));

        assertThatThrownBy(() -> service.linkIdentity(20L, googleUser))
                .isInstanceOf(ConflictException.class);
        verify(identityRepository, never()).saveAndFlush(any());
    }

    private User activeUser() {
        return activeUserWithId(10L);
    }

    private User activeUserWithId(Long id) {
        Role role = new Role("USER", "User");
        User user = new User();
        user.setId(id);
        user.setEmail("student@example.edu");
        user.setStatus(UserStatus.ACTIVE);
        UserRole userRole = new UserRole();
        userRole.setUser(user);
        userRole.setRole(role);
        user.setUserRoles(Set.of(userRole));
        return user;
    }
}
