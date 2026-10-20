package com.surveyflow.dto.response.feedback;

import java.util.List;
import java.util.Map;

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
public class FeedbackSummaryResponse {

    private Long totalFeedbacks;
    private Double averageRating;
    private Map<String, Long> sourceCounts;
    private List<FeedbackItemResponse> recentFeedbacks;
}
