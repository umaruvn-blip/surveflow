package com.surveyflow.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.surveyflow.model.CreditPackage;

public interface CreditPackageRepository extends JpaRepository<CreditPackage, Long> {

    List<CreditPackage> findAllByActiveTrueOrderByDisplayOrderAscIdAsc();
}
