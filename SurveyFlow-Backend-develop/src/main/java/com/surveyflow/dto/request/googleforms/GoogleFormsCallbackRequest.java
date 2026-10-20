package com.surveyflow.dto.request.googleforms;

import jakarta.validation.constraints.NotBlank;
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
public class GoogleFormsCallbackRequest {

    @NotBlank(message = "Authorization code is required")
    private String code;

    private String redirectUri;
}
