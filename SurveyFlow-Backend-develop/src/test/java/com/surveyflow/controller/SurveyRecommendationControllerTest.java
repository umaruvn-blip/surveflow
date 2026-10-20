package com.surveyflow.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import com.surveyflow.common.enums.SurveyStatus;
import com.surveyflow.dto.response.ApiResponse;
import com.surveyflow.dto.response.survey.SurveyRecommendationResponse;
import com.surveyflow.factory.ApiResponseFactory;
import com.surveyflow.model.User;
import com.surveyflow.security.model.UserPrincipal;
import com.surveyflow.service.SurveyRecommendationService;

@ExtendWith(MockitoExtension.class)
class SurveyRecommendationControllerTest {

    @Mock
    private SurveyRecommendationService surveyRecommendationService;

    private SurveyRecommendationController controller;

    @BeforeEach
    void setUp() {
        controller = new SurveyRecommendationController(
                surveyRecommendationService,
                new ApiResponseFactory()
        );
    }

    @Test
    void getRecommendations_returnsSuccessWithRecommendations() {
        User user = new User();
        user.setId(5L);
        user.setEmail("user5@example.com");
        UserPrincipal principal = new UserPrincipal(user);

        SurveyRecommendationResponse item = new SurveyRecommendationResponse(
                10L,
                "AI Tools Study",
                "Survey description",
                "Technology",
                SurveyStatus.PUBLISHED,
                10L,
                100,
                5,
                Instant.now(),
                List.of("AI", "Machine Learning"),
                0.92
        );

        when(surveyRecommendationService.getRecommendedSurveys(5L, 10))
                .thenReturn(List.of(item));

        ResponseEntity<ApiResponse<List<SurveyRecommendationResponse>>> response =
                controller.getRecommendations(principal, 10);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().success()).isTrue();
        assertThat(response.getBody().data()).hasSize(1);
        assertThat(response.getBody().data().get(0).id()).isEqualTo(10L);
        assertThat(response.getBody().data().get(0).matchScore()).isEqualTo(0.92);
    }
}
