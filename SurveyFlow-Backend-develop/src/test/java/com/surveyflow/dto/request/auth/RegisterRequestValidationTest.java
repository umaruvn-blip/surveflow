package com.surveyflow.dto.request.auth;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Set;
import java.util.stream.Collectors;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

class RegisterRequestValidationTest {

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
    void rejectsInvalidEmailAndShortPassword() {
        RegisterRequest request = new RegisterRequest("not-an-email", "short", null, null);

        Set<String> invalidFields = validator.validate(request).stream()
                .map(ConstraintViolation::getPropertyPath)
                .map(Object::toString)
                .collect(Collectors.toSet());

        assertThat(invalidFields).contains("email", "password");
    }

    @Test
    void acceptsMinimalValidRequest() {
        RegisterRequest request = new RegisterRequest("person@example.com", "password123", null, null);

        assertThat(validator.validate(request)).isEmpty();
    }

    @Test
    void reportsAllowedValuesForInvalidGender() {
        RegisterRequest request = new RegisterRequest(
                "person@example.com", "password123", null, "UNKNOWN");

        ConstraintViolation<RegisterRequest> violation = validator.validate(request).iterator().next();

        assertThat(violation.getPropertyPath().toString()).isEqualTo("gender");
        assertThat(violation.getMessage())
                .isEqualTo("must be one of [FEMALE, MALE, OTHER, PREFER_NOT_TO_SAY]");
    }
}
