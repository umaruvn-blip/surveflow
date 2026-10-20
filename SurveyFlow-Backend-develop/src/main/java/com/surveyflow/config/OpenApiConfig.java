package com.surveyflow.config;

import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI(@Value("${app.swagger.title}") String title,
                           @Value("${app.swagger.version}") String version,
                           @Value("${app.swagger.description}") String description,
                           @Value("${app.swagger.contact-name}") String contactName,
                           @Value("${app.swagger.contact-email}") String contactEmail) {
        return new OpenAPI()
                .info(new Info()
                        .title(title)
                        .version(version)
                        .description(description)
                        .contact(new Contact().name(contactName).email(contactEmail)));
    }

    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
                .group("public")
                .pathsToMatch("/api/**")
                .build();
    }
}
