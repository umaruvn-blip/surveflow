package com.surveyflow.dto.request.survey;

public record VerifyParticipationRequest(
        String completionCode,
        String respondentEmail
) {}
