package com.surveyflow.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.surveyflow.common.enums.LeaderboardPeriod;
import com.surveyflow.common.enums.LeaderboardType;
import com.surveyflow.dto.response.ApiResponse;
import com.surveyflow.dto.response.leaderboard.LeaderboardItemResponse;
import com.surveyflow.dto.response.leaderboard.LeaderboardResponse;
import com.surveyflow.factory.ApiResponseFactory;
import com.surveyflow.security.model.UserPrincipal;
import com.surveyflow.service.LeaderboardService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j(topic = "LEADERBOARD-CONTROLLER")
@RestController
@RequestMapping("/api/v1/leaderboard")
@RequiredArgsConstructor
@Tag(name = "Leaderboard")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;
    private final ApiResponseFactory responseFactory;

    @GetMapping
    @Operation(summary = "Get leaderboard items for respondents or creators by time period")
    public ApiResponse<LeaderboardResponse> getLeaderboard(
            @RequestParam(name = "type", defaultValue = "RESPONDENT") LeaderboardType type,
            @RequestParam(name = "period", defaultValue = "ALL_TIME") LeaderboardPeriod period,
            @RequestParam(name = "limit", defaultValue = "20") int limit,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long currentUserId = (principal != null) ? principal.getId() : null;
        LeaderboardResponse response = leaderboardService.getLeaderboard(type, period, limit, currentUserId);
        return responseFactory.success(response);
    }

    @GetMapping("/my-rank")
    @Operation(summary = "Get current authenticated user rank on leaderboard")
    public ApiResponse<LeaderboardItemResponse> getMyRank(
            @RequestParam(name = "type", defaultValue = "RESPONDENT") LeaderboardType type,
            @RequestParam(name = "period", defaultValue = "ALL_TIME") LeaderboardPeriod period,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long currentUserId = (principal != null) ? principal.getId() : null;
        LeaderboardItemResponse response = leaderboardService.getMyRank(type, period, currentUserId);
        return responseFactory.success(response);
    }
}
