package com.surveyflow.dto.request.survey;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

class SurveyUpsertRequestValidationTest {

    private static ValidatorFactory validatorFactory;
    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        validatorFactory = Validation.buildDefaultValidatorFactory();
        validator = validatorFactory.getValidator();
    }

    @AfterAll
    static void closeValidatorFactory() {
        validatorFactory.close();
    }

    @Test
    void reportsAllowedValuesForInvalidEnums() {
        SurveyUpsertRequest request = validRequest(
                "TYPEFORM",
                "WEBHOOK",
                new SurveyUpsertRequest.TargetingRequest(null, null, "UNKNOWN", null, null, Set.of()));

        Map<String, String> violations = validator.validate(request).stream()
                .collect(Collectors.toMap(
                        violation -> violation.getPropertyPath().toString(),
                        ConstraintViolation::getMessage));

        assertThat(violations.get("provider"))
                .isEqualTo("must be one of [GOOGLE_FORMS, INTERNAL, OTHER]");
        assertThat(violations.get("verification.method"))
                .isEqualTo("must be one of [EXTERNAL_CODE, INTERNAL_SUBMISSION, MANUAL_REVIEW]");
        assertThat(violations.get("targeting.gender"))
                .isEqualTo("must be one of [FEMALE, MALE, OTHER, PREFER_NOT_TO_SAY]");
    }

    @Test
    void reportsRequiredMessageWhenEnumIsMissing() {
        SurveyUpsertRequest request = validRequest(
                null,
                null,
                null);

        Map<String, String> violations = validator.validate(request).stream()
                .collect(Collectors.toMap(
                        violation -> violation.getPropertyPath().toString(),
                        ConstraintViolation::getMessage));

        assertThat(violations.get("provider")).isEqualTo("is required");
        assertThat(violations.get("verification.method")).isEqualTo("is required");
    }

    @Test
    void rejectsEnumValuesWithWhitespace() {
        SurveyUpsertRequest request = validRequest(" GOOGLE_FORMS ", "EXTERNAL_CODE", null);

        Map<String, String> violations = validator.validate(request).stream()
                .collect(Collectors.toMap(
                        violation -> violation.getPropertyPath().toString(),
                        ConstraintViolation::getMessage));

        assertThat(violations.get("provider"))
                .isEqualTo("must be one of [GOOGLE_FORMS, INTERNAL, OTHER]");
    }

    private SurveyUpsertRequest validRequest(
            String provider,
            String verificationMethod,
            SurveyUpsertRequest.TargetingRequest targeting) {
        return new SurveyUpsertRequest(
                null,
                "Survey title",
                null,
                null,
                null,
                provider,
                "https://docs.google.com/forms/d/e/form-id/viewform",
                300,
                10,
                "vi",
                false,
                null,
                100,
                1_800,
                Instant.now().plusSeconds(3_600),
                new SurveyUpsertRequest.VerificationRequest(verificationMethod, 0, 900, 3),
                targeting);
    }
}
