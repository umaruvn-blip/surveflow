package com.surveyflow.dto.response.googleforms;

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
public class GoogleFormItemResponse {

    private String id;
    private String formId;
    private String title;
    private String description;
    private String responderUri;
    private String editUri;
    private Integer questionCount;
    private Boolean hasCompletionCodeQuestion;
}
