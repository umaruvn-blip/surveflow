package com.surveyflow.validation;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class EnumValueValidator implements ConstraintValidator<EnumValue, String> {

    private Set<String> allowedValues;
    private String validationMessage;

    @Override
    public void initialize(EnumValue annotation) {
        allowedValues = Arrays.stream(annotation.enumClass().getEnumConstants())
                .map(Enum::name)
                .collect(Collectors.toUnmodifiableSet());
        validationMessage = annotation.message().isBlank()
                ? "must be one of " + allowedValues.stream().sorted().toList()
                : annotation.message();
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) {
            return true;
        }
        if (allowedValues.contains(value)) {
            return true;
        }

        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(validationMessage)
                .addConstraintViolation();
        return false;
    }
}
