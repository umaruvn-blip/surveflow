package com.surveyflow.dto.response.leaderboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardItemResponse {
    private int rank;
    private Long userId;
    private String displayName;
    private String avatarUrl;
    private String school;
    private String occupation;
    private Integer levelNumber;
    private String levelTitle;
    private Long totalXp;
    private Long completedSurveysCount;
    private Long totalEarnedCredits;
    private Long createdSurveysCount;
    private Long totalResponsesCollected;
}
