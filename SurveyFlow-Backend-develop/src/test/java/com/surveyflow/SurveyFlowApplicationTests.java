package com.surveyflow;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;

import static org.assertj.core.api.Assertions.assertThat;

import com.surveyflow.controller.DemoCreditTopupController;

@SpringBootTest
@ActiveProfiles("test")
class SurveyFlowApplicationTests {

    @Autowired
    private ApplicationContext context;

    @Test
    void contextLoads() {
        assertThat(context.getBeansOfType(DemoCreditTopupController.class)).isEmpty();
    }

}
