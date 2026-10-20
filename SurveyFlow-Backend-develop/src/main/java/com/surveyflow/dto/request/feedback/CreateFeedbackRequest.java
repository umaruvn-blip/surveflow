package com.surveyflow.dto.request.feedback;

import java.util.List;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
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
public class CreateFeedbackRequest {

    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer rating;

    private List<String> sources;

    @Size(max = 255, message = "Other source description must not exceed 255 characters")
    private String otherSource;

    @Size(max = 2000, message = "Feedback content must not exceed 2000 characters")
    private String content;
}
