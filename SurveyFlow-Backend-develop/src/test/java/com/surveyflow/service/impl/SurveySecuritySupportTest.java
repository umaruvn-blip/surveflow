package com.surveyflow.service.impl;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class SurveySecuritySupportTest {

    private final SurveySecuritySupport support = new SurveySecuritySupport();

    @Test
    void generatedCompletionCodeUsesReadableTenCharacterAlphabet() {
        String code = support.newCompletionCode();

        assertThat(code).hasSize(10).matches("[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]+");
        assertThat(support.matches(code, support.sha256(code))).isTrue();
    }

    @Test
    void extractsGoogleFormIdFromPublicUrl() {
        assertThat(support.extractGoogleFormId(
                "https://docs.google.com/forms/d/e/1FAIpQLScodex/viewform"))
                .isEqualTo("1FAIpQLScodex");
    }
}
