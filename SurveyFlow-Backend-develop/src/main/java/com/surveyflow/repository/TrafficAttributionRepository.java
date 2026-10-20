package com.surveyflow.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.surveyflow.model.TrafficAttribution;

public interface TrafficAttributionRepository extends JpaRepository<TrafficAttribution, Long> {

    Optional<TrafficAttribution> findFirstBySessionIdOrderByCreatedAtDesc(String sessionId);

    Optional<TrafficAttribution> findFirstBySessionIdAndUtmSource(String sessionId, String utmSource);

    List<TrafficAttribution> findBySessionId(String sessionId);

    @Query("SELECT COUNT(DISTINCT t.sessionId) FROM TrafficAttribution t WHERE t.converted = true")
    long countConverted();

    @Query("SELECT COUNT(DISTINCT t.sessionId) FROM TrafficAttribution t")
    long countUniqueVisits();

    @Query("SELECT t.utmSource, COUNT(DISTINCT t.sessionId), COUNT(DISTINCT CASE WHEN t.converted = true THEN t.sessionId END) " +
           "FROM TrafficAttribution t " +
           "GROUP BY t.utmSource " +
           "ORDER BY COUNT(DISTINCT t.sessionId) DESC")
    List<Object[]> countVisitsAndConversionsBySource();

    @Query("SELECT t.utmCampaign, COUNT(DISTINCT t.sessionId), COUNT(DISTINCT CASE WHEN t.converted = true THEN t.sessionId END) " +
           "FROM TrafficAttribution t " +
           "WHERE t.utmCampaign IS NOT NULL AND t.utmCampaign != '' " +
           "GROUP BY t.utmCampaign " +
           "ORDER BY COUNT(DISTINCT t.sessionId) DESC")
    List<Object[]> countVisitsAndConversionsByCampaign();

    List<TrafficAttribution> findTop15ByOrderByCreatedAtDesc();
}
