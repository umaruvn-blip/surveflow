package com.surveyflow.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.surveyflow.model.UserGoogleFormsConnection;

public interface UserGoogleFormsConnectionRepository extends JpaRepository<UserGoogleFormsConnection, Long> {

    Optional<UserGoogleFormsConnection> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    void deleteByUserId(Long userId);
}
