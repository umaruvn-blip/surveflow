package com.surveyflow.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.surveyflow.common.enums.SurveyStatus;
import com.surveyflow.config.properties.AppAiMatchingProperties;
import com.surveyflow.dto.request.aimatching.AiMatchRequest;
import com.surveyflow.dto.response.aimatching.AiMatchResponse;
import com.surveyflow.dto.response.aimatching.SurveyScoreDto;
import com.surveyflow.dto.response.survey.SurveyRecommendationResponse;
import com.surveyflow.model.Interest;
import com.surveyflow.model.Survey;
import com.surveyflow.model.SurveyTargetInterest;
import com.surveyflow.model.User;
import com.surveyflow.model.UserInterest;
import com.surveyflow.model.UserProfile;
import com.surveyflow.repository.SurveyRepository;
import com.surveyflow.repository.SurveyTargetInterestRepository;
import com.surveyflow.repository.UserInterestRepository;
import com.surveyflow.repository.UserProfileRepository;
import com.surveyflow.service.client.AiMatchingClient;

@ExtendWith(MockitoExtension.class)
class SurveyRecommendationServiceImplTest {

    @Mock
    private UserProfileRepository userProfileRepository;
    @Mock
    private UserInterestRepository userInterestRepository;
    @Mock
    private SurveyRepository surveyRepository;
    @Mock
    private SurveyTargetInterestRepository surveyTargetInterestRepository;
    @Mock
    private AiMatchingClient aiMatchingClient;

    private Clock clock;
    private AppAiMatchingProperties aiProperties;
    private SurveyRecommendationServiceImpl recommendationService;

    @BeforeEach
    void setUp() {
        clock = Clock.fixed(Instant.parse("2026-10-06T10:00:00Z"), ZoneId.of("UTC"));
        aiProperties = new AppAiMatchingProperties("http://localhost:8000", 10, 5000);
        recommendationService = new SurveyRecommendationServiceImpl(
                userProfileRepository,
                userInterestRepository,
                surveyRepository,
                surveyTargetInterestRepository,
                aiMatchingClient,
                aiProperties,
                clock
        );
    }

    @Test
    void getRecommendedSurveys_returnsSortedResults_whenAiServiceSucceeds() {
        Long userId = 1L;
        User user = new User();
        user.setId(userId);

        UserProfile profile = new UserProfile();
        profile.setUser(user);
        profile.setSchool("FPT University");
        profile.setOccupation("Student");
        profile.setBio("AI student");

        Interest interestAI = new Interest();
        interestAI.setName("Artificial Intelligence");
        interestAI.setSlug("ai");
        interestAI.setDescription("AI interest");
        interestAI.setActive(true);
        UserInterest userInterest = new UserInterest();
        userInterest.setUser(user);
        userInterest.setInterest(interestAI);

        when(userProfileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));
        when(userInterestRepository.findByUserIdWithInterest(userId)).thenReturn(List.of(userInterest));

        Survey survey1 = new Survey();
        survey1.setId(101L);
        survey1.setTitle("AI in Education");
        survey1.setDescription("Study of AI tools");
        survey1.setStatus(SurveyStatus.PUBLISHED);

        Survey survey2 = new Survey();
        survey2.setId(102L);
        survey2.setTitle("Cooking Habits");
        survey2.setDescription("Study of food");
        survey2.setStatus(SurveyStatus.PUBLISHED);

        when(surveyRepository.findAvailableForRecommendation(eq(userId), any(Instant.class)))
                .thenReturn(List.of(survey1, survey2));

        SurveyTargetInterest targetInterest = new SurveyTargetInterest();
        targetInterest.setSurvey(survey1);
        targetInterest.setInterest(interestAI);
        when(surveyTargetInterestRepository.findBySurveyIdInWithInterest(any()))
                .thenReturn(List.of(targetInterest));

        AiMatchResponse aiResponse = new AiMatchResponse(List.of(
                new SurveyScoreDto(101L, 0.85),
                new SurveyScoreDto(102L, 0.20)
        ));
        when(aiMatchingClient.matchSurveys(any(AiMatchRequest.class))).thenReturn(aiResponse);

        List<SurveyRecommendationResponse> recommendations = recommendationService.getRecommendedSurveys(userId, 5);

        assertThat(recommendations).hasSize(2);
        assertThat(recommendations.get(0).id()).isEqualTo(101L);
        assertThat(recommendations.get(0).matchScore()).isEqualTo(0.85);
        assertThat(recommendations.get(0).targetInterests()).containsExactly("Artificial Intelligence");

        assertThat(recommendations.get(1).id()).isEqualTo(102L);
        assertThat(recommendations.get(1).matchScore()).isEqualTo(0.20);

        ArgumentCaptor<AiMatchRequest> requestCaptor = ArgumentCaptor.forClass(AiMatchRequest.class);
        verify(aiMatchingClient).matchSurveys(requestCaptor.capture());
        AiMatchRequest capturedRequest = requestCaptor.getValue();
        assertThat(capturedRequest.userText()).contains("FPT University", "Student", "AI student", "Artificial Intelligence");
        assertThat(capturedRequest.surveys()).hasSize(2);
        assertThat(capturedRequest.topK()).isEqualTo(5);
    }

    @Test
    void getRecommendedSurveys_usesFallback_whenAiServiceFails() {
        Long userId = 1L;
        when(userProfileRepository.findByUserId(userId)).thenReturn(Optional.empty());
        when(userInterestRepository.findByUserIdWithInterest(userId)).thenReturn(List.of());

        Survey survey = new Survey();
        survey.setId(101L);
        survey.setTitle("Survey 1");
        survey.setStatus(SurveyStatus.PUBLISHED);

        when(surveyRepository.findAvailableForRecommendation(eq(userId), any(Instant.class)))
                .thenReturn(List.of(survey));
        when(surveyTargetInterestRepository.findBySurveyIdInWithInterest(any()))
                .thenReturn(List.of());
        when(aiMatchingClient.matchSurveys(any())).thenReturn(null); // Service offline

        List<SurveyRecommendationResponse> recommendations = recommendationService.getRecommendedSurveys(userId, 10);

        assertThat(recommendations).hasSize(1);
        assertThat(recommendations.get(0).id()).isEqualTo(101L);
        assertThat(recommendations.get(0).matchScore()).isNull();
    }

    @Test
    void getRecommendedSurveys_returnsEmpty_whenNoSurveysPublished() {
        when(surveyRepository.findAvailableForRecommendation(any(), any())).thenReturn(List.of());

        List<SurveyRecommendationResponse> recommendations = recommendationService.getRecommendedSurveys(1L, 10);

        assertThat(recommendations).isEmpty();
    }
}
