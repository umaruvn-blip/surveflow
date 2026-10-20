package com.surveyflow.service;

import com.surveyflow.common.enums.LeaderboardPeriod;
import com.surveyflow.common.enums.LeaderboardType;
import com.surveyflow.dto.response.leaderboard.LeaderboardItemResponse;
import com.surveyflow.dto.response.leaderboard.LeaderboardResponse;

public interface LeaderboardService {

    LeaderboardResponse getLeaderboard(LeaderboardType type, LeaderboardPeriod period, int limit, Long currentUserId);

    LeaderboardItemResponse getMyRank(LeaderboardType type, LeaderboardPeriod period, Long currentUserId);
}
