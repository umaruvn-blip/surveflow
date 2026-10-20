package com.surveyflow.model;

import java.time.Instant;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(
        name = "levels",
        uniqueConstraints = @UniqueConstraint(name = "uk_levels_level_number", columnNames = "level_number"),
        indexes = {
                @Index(name = "idx_levels_level_number", columnList = "level_number", unique = true),
                @Index(name = "idx_levels_min_xp", columnList = "min_xp")
        }
)
public class Level {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, name = "level_number")
    private Integer levelNumber;

    @Column(length = 100)
    private String name;

    @Column(nullable = false, name = "min_xp")
    private Long minXp;

    @CreationTimestamp
    @Column(nullable = false, updatable = false, name = "created_at")
    private Instant createdAt;
}
