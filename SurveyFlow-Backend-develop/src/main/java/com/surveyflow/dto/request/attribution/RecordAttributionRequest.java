package com.surveyflow.dto.request.attribution;

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
public class RecordAttributionRequest {

    private String sessionId;

    @NotBlank(message = "utmSource is required")
    private String utmSource;

    private String utmMedium;

    private String utmCampaign;

    private String utmContent;

    private String utmTerm;

    private String landingPage;

    private String referrerUrl;
}
