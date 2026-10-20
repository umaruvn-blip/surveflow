package com.surveyflow.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.surveyflow.model.UserRole;
import com.surveyflow.model.id.UserRoleId;

public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleId> {

    List<UserRole> findByUserId(Long userId);

    List<UserRole> findByRoleId(Long roleId);
}
