package com.surveyflow.security.model;

import java.io.Serial;
import java.util.ArrayList;
import java.util.Collection;
import java.util.stream.Collectors;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.surveyflow.common.enums.UserStatus;
import com.surveyflow.model.User;

public class UserPrincipal implements UserDetails {

    @Serial
    private static final long serialVersionUID = 1L;

    private final Long id;
    private final String email;
    private final String password;
    private final boolean accountNonExpired;
    private final boolean accountNonLocked;
    private final boolean credentialsNonExpired;
    private final boolean enabled;
    private final ArrayList<SimpleGrantedAuthority> authorities;

    public UserPrincipal(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.password = user.getPasswordHash();
        this.accountNonExpired = user.getStatus() != UserStatus.INACTIVE;
        this.accountNonLocked = user.getStatus() != UserStatus.SUSPENDED;
        this.credentialsNonExpired = true;
        this.enabled = user.getStatus() == UserStatus.ACTIVE;
        this.authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(toAuthority(role.getCode())))
                .collect(Collectors.toCollection(ArrayList::new));
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    private String toAuthority(String roleName) {
        if (roleName == null || roleName.isBlank()) {
            return "ROLE_USER";
        }

        String normalizedRoleName = roleName.trim().toUpperCase();
        return normalizedRoleName.startsWith("ROLE_")
                ? normalizedRoleName
                : "ROLE_" + normalizedRoleName;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return accountNonExpired;
    }

    @Override
    public boolean isAccountNonLocked() {
        return accountNonLocked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return credentialsNonExpired;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
