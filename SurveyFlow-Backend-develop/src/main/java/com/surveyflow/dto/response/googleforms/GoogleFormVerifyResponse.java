package com.surveyflow.dto.response.googleforms;

import java.time.Instant;

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
public class GoogleFormVerifyResponse {

    private boolean verified;
    private String responseId;
    private Instant submittedAt;
    private String message;
}
