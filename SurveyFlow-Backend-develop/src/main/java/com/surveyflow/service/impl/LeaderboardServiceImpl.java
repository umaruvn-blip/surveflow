package com.surveyflow.service.impl;

import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.surveyflow.common.enums.CreditTransactionDirection;
import com.surveyflow.common.enums.CreditTransactionType;
import com.surveyflow.common.enums.LeaderboardPeriod;
import com.surveyflow.common.enums.LeaderboardType;
import com.surveyflow.dto.response.leaderboard.LeaderboardItemResponse;
import com.surveyflow.dto.response.leaderboard.LeaderboardResponse;
import com.surveyflow.model.User;
import com.surveyflow.model.UserProfile;
import com.surveyflow.model.UserProgress;
import com.surveyflow.repository.CreditTransactionRepository;
import com.surveyflow.repository.CreditWalletRepository;
import com.surveyflow.repository.SurveyParticipationRepository;
import com.surveyflow.repository.SurveyRepository;
import com.surveyflow.repository.UserProfileRepository;
import com.surveyflow.repository.UserProgressRepository;
import com.surveyflow.repository.UserRepository;
import com.surveyflow.service.LeaderboardService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "LEADERBOARD-SERVICE")
public class LeaderboardServiceImpl implements LeaderboardService {

    private final SurveyParticipationRepository participationRepository;
    private final SurveyRepository surveyRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository profileRepository;
    private final UserProgressRepository progressRepository;
    private final CreditWalletRepository walletRepository;
    private final CreditTransactionRepository transactionRepository;
    private final Clock clock;

    @Override
    @Transactional(readOnly = true)
    public LeaderboardResponse getLeaderboard(LeaderboardType type, LeaderboardPeriod period, int limit, Long currentUserId) {
        if (type == null) type = LeaderboardType.RESPONDENT;
        if (period == null) period = LeaderboardPeriod.ALL_TIME;
        if (limit <= 0 || limit > 100) limit = 20;

        Instant since = getSinceTimestamp(period);
        List<LeaderboardItemResponse> items = new ArrayList<>();

        if (type == LeaderboardType.RESPONDENT) {
            items = buildRespondentLeaderboard(since, limit);
        } else {
            items = buildCreatorLeaderboard(since, limit);
        }

        LeaderboardItemResponse myRank = null;
        if (currentUserId != null) {
            myRank = getMyRank(type, period, currentUserId);
        }

        return LeaderboardResponse.builder()
                .type(type)
                .period(period)
                .items(items)
                .myRank(myRank)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public LeaderboardItemResponse getMyRank(LeaderboardType type, LeaderboardPeriod period, Long currentUserId) {
        if (currentUserId == null) return null;
        Instant since = getSinceTimestamp(period);

        User user = userRepository.findById(currentUserId).orElse(null);
        if (user == null) return null;

        UserProfile profile = profileRepository.findByUserId(currentUserId).orElse(null);
        UserProgress progress = progressRepository.findByUserId(currentUserId).orElse(null);

        if (type == LeaderboardType.RESPONDENT) {
            long completed = since == null
                    ? participationRepository.countCompletedSurveysByUserId(currentUserId)
                    : participationRepository.countCompletedSurveysByUserIdSince(currentUserId, since);

            // Fetch top list to determine rank
            List<Object[]> allRanked = since == null
                    ? participationRepository.findTopRespondentsAllTime(PageRequest.of(0, 1000))
                    : participationRepository.findTopRespondentsSince(since, PageRequest.of(0, 1000));

            int rank = findUserRankInRows(allRanked, currentUserId);

            return mapToItem(rank, currentUserId, user, profile, progress, completed, null, null, null);
        } else {
            List<Object[]> allRanked = since == null
                    ? surveyRepository.findTopCreatorsAllTime(PageRequest.of(0, 1000))
                    : surveyRepository.findTopCreatorsSince(since, PageRequest.of(0, 1000));

            int rank = findUserRankInRows(allRanked, currentUserId);
            long totalSurveys = 0L;
            long totalResponses = 0L;

            for (Object[] row : allRanked) {
                Long uid = ((Number) row[0]).longValue();
                if (uid.equals(currentUserId)) {
                    totalSurveys = ((Number) row[1]).longValue();
                    totalResponses = ((Number) row[2]).longValue();
                    break;
                }
            }

            return mapToItem(rank, currentUserId, user, profile, progress, null, null, totalSurveys, totalResponses);
        }
    }

    private List<LeaderboardItemResponse> buildRespondentLeaderboard(Instant since, int limit) {
        List<Object[]> rows = since == null
                ? participationRepository.findTopRespondentsAllTime(PageRequest.of(0, limit))
                : participationRepository.findTopRespondentsSince(since, PageRequest.of(0, limit));

        if (rows.isEmpty()) {
            return Collections.emptyList();
        }

        Set<Long> userIds = rows.stream()
                .map(r -> ((Number) r[0]).longValue())
                .collect(Collectors.toSet());

        Map<Long, User> userMap = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));
        Map<Long, UserProfile> profileMap = profileRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(p -> p.getUser().getId(), Function.identity(), (a, b) -> a));
        Map<Long, UserProgress> progressMap = progressRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(p -> p.getUser().getId(), Function.identity(), (a, b) -> a));

        List<LeaderboardItemResponse> result = new ArrayList<>();
        int currentRank = 1;

        for (Object[] row : rows) {
            Long userId = ((Number) row[0]).longValue();
            long completedCount = ((Number) row[1]).longValue();

            User user = userMap.get(userId);
            UserProfile profile = profileMap.get(userId);
            UserProgress progress = progressMap.get(userId);

            result.add(mapToItem(currentRank++, userId, user, profile, progress, completedCount, null, null, null));
        }

        return result;
    }

    private List<LeaderboardItemResponse> buildCreatorLeaderboard(Instant since, int limit) {
        List<Object[]> rows = since == null
                ? surveyRepository.findTopCreatorsAllTime(PageRequest.of(0, limit))
                : surveyRepository.findTopCreatorsSince(since, PageRequest.of(0, limit));

        if (rows.isEmpty()) {
            return Collections.emptyList();
        }

        Set<Long> userIds = rows.stream()
                .map(r -> ((Number) r[0]).longValue())
                .collect(Collectors.toSet());

        Map<Long, User> userMap = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));
        Map<Long, UserProfile> profileMap = profileRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(p -> p.getUser().getId(), Function.identity(), (a, b) -> a));
        Map<Long, UserProgress> progressMap = progressRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(p -> p.getUser().getId(), Function.identity(), (a, b) -> a));

        List<LeaderboardItemResponse> result = new ArrayList<>();
        int currentRank = 1;

        for (Object[] row : rows) {
            Long userId = ((Number) row[0]).longValue();
            long createdCount = ((Number) row[1]).longValue();
            long responsesCount = ((Number) row[2]).longValue();

            User user = userMap.get(userId);
            UserProfile profile = profileMap.get(userId);
            UserProgress progress = progressMap.get(userId);

            result.add(mapToItem(currentRank++, userId, user, profile, progress, null, null, createdCount, responsesCount));
        }

        return result;
    }

    private LeaderboardItemResponse mapToItem(
            int rank,
            Long userId,
            User user,
            UserProfile profile,
            UserProgress progress,
            Long completedSurveys,
            Long earnedCredits,
            Long createdSurveys,
            Long responsesCollected
    ) {
        String displayName = "Thành viên #" + userId;
        String avatarUrl = null;
        String school = null;
        String occupation = null;

        if (profile != null) {
            if (profile.getDisplayName() != null && !profile.getDisplayName().isBlank()) {
                displayName = profile.getDisplayName();
            }
            avatarUrl = profile.getAvatarUrl();
            school = profile.getSchool();
            occupation = profile.getOccupation();
        } else if (user != null && user.getEmail() != null) {
            displayName = user.getEmail().split("@")[0];
        }

        Integer levelNumber = 1;
        String levelTitle = "Tập sự";
        Long totalXp = 0L;

        if (progress != null) {
            totalXp = progress.getTotalXp();
            if (progress.getLevel() != null) {
                levelNumber = progress.getLevel().getLevelNumber();
                levelTitle = progress.getLevel().getName();
            }
        }

        return LeaderboardItemResponse.builder()
                .rank(rank)
                .userId(userId)
                .displayName(displayName)
                .avatarUrl(avatarUrl)
                .school(school)
                .occupation(occupation)
                .levelNumber(levelNumber)
                .levelTitle(levelTitle)
                .totalXp(totalXp)
                .completedSurveysCount(completedSurveys)
                .totalEarnedCredits(earnedCredits)
                .createdSurveysCount(createdSurveys)
                .totalResponsesCollected(responsesCollected)
                .build();
    }

    private int findUserRankInRows(List<Object[]> rows, Long targetUserId) {
        for (int i = 0; i < rows.size(); i++) {
            Long uid = ((Number) rows.get(i)[0]).longValue();
            if (uid.equals(targetUserId)) {
                return i + 1;
            }
        }
        return rows.size() + 1;
    }

    private Instant getSinceTimestamp(LeaderboardPeriod period) {
        if (period == null || period == LeaderboardPeriod.ALL_TIME) {
            return null;
        }
        Instant now = clock.instant();
        if (period == LeaderboardPeriod.WEEK) {
            return now.minus(7, ChronoUnit.DAYS);
        } else if (period == LeaderboardPeriod.MONTH) {
            return now.minus(30, ChronoUnit.DAYS);
        }
        return null;
    }
}
