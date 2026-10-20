package com.surveyflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class SurveyFlowApplication {

    public static void main(String[] args) {
        SpringApplication.run(SurveyFlowApplication.class, args);
    }
}
