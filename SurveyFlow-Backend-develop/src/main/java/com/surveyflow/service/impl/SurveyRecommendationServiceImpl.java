package com.surveyflow.service.impl;

import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.surveyflow.config.properties.AppAiMatchingProperties;
import com.surveyflow.dto.request.aimatching.AiMatchRequest;
import com.surveyflow.dto.request.aimatching.SurveyItemDto;
import com.surveyflow.dto.response.aimatching.AiMatchResponse;
import com.surveyflow.dto.response.aimatching.SurveyScoreDto;
import com.surveyflow.dto.response.survey.SurveyRecommendationResponse;
import com.surveyflow.model.Survey;
import com.surveyflow.model.SurveyTargetInterest;
import com.surveyflow.model.UserInterest;
import com.surveyflow.model.UserProfile;
import com.surveyflow.repository.SurveyRepository;
import com.surveyflow.repository.SurveyTargetInterestRepository;
import com.surveyflow.repository.UserInterestRepository;
import com.surveyflow.repository.UserProfileRepository;
import com.surveyflow.service.SurveyRecommendationService;
import com.surveyflow.service.client.AiMatchingClient;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j(topic = "SURVEY-RECOMMENDATION-SERVICE")
@Service
@RequiredArgsConstructor
public class SurveyRecommendationServiceImpl implements SurveyRecommendationService {

    private static final long SURVEY_COMPLETION_REWARD = 10L;

    private final UserProfileRepository userProfileRepository;
    private final UserInterestRepository userInterestRepository;
    private final SurveyRepository surveyRepository;
    private final SurveyTargetInterestRepository surveyTargetInterestRepository;
    private final AiMatchingClient aiMatchingClient;
    private final AppAiMatchingProperties aiProperties;
    private final Clock clock;

    @Override
    @Transactional(readOnly = true)
    public List<SurveyRecommendationResponse> getRecommendedSurveys(Long userId, Integer limit) {
        int topK = (limit != null && limit > 0) ? limit : aiProperties.defaultTopK();
        Instant now = Instant.now(clock);

        // 1. Lấy danh sách khảo sát hợp lệ (chưa hết hạn, chưa đủ slot, không phải của chính user)
        // Eager fetch category và creator để loại bỏ hoàn toàn N+1 queries
        List<Survey> availableSurveys = surveyRepository.findAvailableForRecommendation(userId, now);
        if (availableSurveys.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> surveyIds = availableSurveys.stream().map(Survey::getId).toList();

        // 2. Batch fetch toàn bộ target interests trong đúng 1 query duy nhất
        List<SurveyTargetInterest> allTargetInterests = surveyTargetInterestRepository.findBySurveyIdInWithInterest(surveyIds);
        Map<Long, List<String>> surveyInterestsMap = allTargetInterests.stream()
                .collect(Collectors.groupingBy(
                        sti -> sti.getSurvey().getId(),
                        Collectors.mapping(sti -> sti.getInterest().getName(), Collectors.toList())
                ));

        List<SurveyItemDto> surveyItemDtos = new ArrayList<>(availableSurveys.size());
        for (Survey survey : availableSurveys) {
            List<String> interestNames = surveyInterestsMap.getOrDefault(survey.getId(), Collections.emptyList());
            String surveyText = buildSurveyText(survey.getTitle(), survey.getDescription(), interestNames);
            surveyItemDtos.add(new SurveyItemDto(survey.getId(), surveyText));
        }

        // 3. Lấy profile và interests của User (tối ưu eager fetch)
        String school = "";
        String occupation = "";
        String bio = "";
        List<String> userInterests = Collections.emptyList();

        if (userId != null) {
            UserProfile profile = userProfileRepository.findByUserId(userId).orElse(null);
            if (profile != null) {
                school = profile.getSchool() != null ? profile.getSchool() : "";
                occupation = profile.getOccupation() != null ? profile.getOccupation() : "";
                bio = profile.getBio() != null ? profile.getBio() : "";
            }

            List<UserInterest> uInterests = userInterestRepository.findByUserIdWithInterest(userId);
            userInterests = uInterests.stream()
                    .map(ui -> ui.getInterest().getName())
                    .toList();
        }

        String userText = buildUserText(school, occupation, bio, userInterests);

        // 4. Gọi AI Matching Service
        AiMatchRequest matchRequest = new AiMatchRequest(userText, surveyItemDtos, topK);
        AiMatchResponse matchResponse = aiMatchingClient.matchSurveys(matchRequest);

        // Map danh sách khảo sát theo ID để O(1) lookup
        Map<Long, Survey> surveyMap = availableSurveys.stream()
                .collect(Collectors.toMap(Survey::getId, s -> s));

        // 5. Kết hợp kết quả từ AI hoặc fallback
        if (matchResponse != null && matchResponse.results() != null && !matchResponse.results().isEmpty()) {
            List<SurveyRecommendationResponse> recommendations = new ArrayList<>(matchResponse.results().size());
            for (SurveyScoreDto item : matchResponse.results()) {
                Survey survey = surveyMap.get(item.surveyId());
                if (survey != null) {
                    List<String> interests = surveyInterestsMap.getOrDefault(survey.getId(), Collections.emptyList());
                    recommendations.add(toResponse(survey, interests, item.score()));
                }
            }
            return recommendations;
        }

        // Fallback: Thứ tự mặc định nếu AI Service offline
        log.info("Using fallback survey recommendation (database order)");
        return availableSurveys.stream()
                .limit(topK)
                .map(s -> toResponse(s, surveyInterestsMap.getOrDefault(s.getId(), Collections.emptyList()), null))
                .toList();
    }

    private String buildUserText(String school, String occupation, String bio, List<String> interests) {
        String interestsStr = String.join(", ", interests);
        return String.format("Student at %s. Occupation: %s. %s Interests: %s.",
                school, occupation, bio, interestsStr).trim();
    }

    private String buildSurveyText(String title, String description, List<String> targetInterests) {
        String interestsStr = String.join(", ", targetInterests);
        String desc = description != null ? description : "";
        return String.format("%s. %s Target interests: %s.",
                title, desc, interestsStr).trim();
    }

    private SurveyRecommendationResponse toResponse(Survey survey, List<String> targetInterests, Double score) {
        String categoryName = survey.getCategory() != null ? survey.getCategory().getName() : null;
        return new SurveyRecommendationResponse(
                survey.getId(),
                survey.getTitle(),
                survey.getDescription(),
                categoryName,
                survey.getStatus(),
                SURVEY_COMPLETION_REWARD,
                survey.getTargetResponseCount(),
                survey.getCurrentResponseCount(),
                survey.getDeadline(),
                targetInterests != null ? targetInterests : Collections.emptyList(),
                score
        );
    }
}
