package com.surveyflow.model;

import java.time.Instant;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(
        name = "traffic_attributions",
        indexes = {
                @Index(name = "idx_traffic_attributions_source", columnList = "utm_source"),
                @Index(name = "idx_traffic_attributions_campaign", columnList = "utm_campaign"),
                @Index(name = "idx_traffic_attributions_user_id", columnList = "user_id"),
                @Index(name = "idx_traffic_attributions_session_id", columnList = "session_id"),
                @Index(name = "idx_traffic_attributions_created_at", columnList = "created_at")
        }
)
public class TrafficAttribution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "session_id", length = 100)
    private String sessionId;

    @Column(name = "utm_source", nullable = false, length = 100)
    private String utmSource;

    @Column(name = "utm_medium", length = 100)
    private String utmMedium;

    @Column(name = "utm_campaign", length = 100)
    private String utmCampaign;

    @Column(name = "utm_content", length = 100)
    private String utmContent;

    @Column(name = "utm_term", length = 100)
    private String utmTerm;

    @Column(name = "landing_page", length = 500)
    private String landingPage;

    @Column(name = "referrer_url", length = 500)
    private String referrerUrl;

    @Builder.Default
    @Column(name = "is_converted", nullable = false)
    private boolean converted = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
