package com.surveyflow.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.surveyflow.model.RewardCatalogItem;

public interface RewardCatalogRepository extends JpaRepository<RewardCatalogItem, Long> {

    List<RewardCatalogItem> findAllByActiveTrueOrderByDisplayOrderAscIdAsc();
}
