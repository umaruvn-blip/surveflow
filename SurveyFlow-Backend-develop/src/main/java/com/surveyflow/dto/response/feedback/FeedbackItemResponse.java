package com.surveyflow.dto.response.feedback;

import java.time.Instant;
import java.util.List;

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
public class FeedbackItemResponse {

    private Long id;
    private Long userId;
    private String userEmail;
    private Integer rating;
    private List<String> sources;
    private String otherSource;
    private String content;
    private Instant createdAt;
}
