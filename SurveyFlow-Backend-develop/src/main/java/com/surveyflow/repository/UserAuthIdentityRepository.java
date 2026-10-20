package com.surveyflow.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.surveyflow.model.UserAuthIdentity;

public interface UserAuthIdentityRepository extends JpaRepository<UserAuthIdentity, Long> {

    Optional<UserAuthIdentity> findByProviderAndIssuerAndSubject(String provider, String issuer, String subject);

    boolean existsByProviderAndIssuerAndSubject(String provider, String issuer, String subject);
}
