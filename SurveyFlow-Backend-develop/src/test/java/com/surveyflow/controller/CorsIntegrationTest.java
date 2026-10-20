package com.surveyflow.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = "app.cors.allowed-origins=http://localhost:5173")
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CorsIntegrationTest {
    @Autowired private MockMvc mockMvc;

    @Test
    void allowsProfilePreflightWithoutAuthentication() throws Exception {
        for (String method : new String[] { "GET", "PUT" }) {
            mockMvc.perform(options("/api/v1/users/me/profile")
                            .header("Origin", "http://localhost:5173")
                            .header("Access-Control-Request-Method", method)
                            .header("Access-Control-Request-Headers", "authorization,content-type"))
                    .andExpect(status().isOk())
                    .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"))
                    .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
        }
    }

    @Test
    void protectedRequestStillRequiresAuthenticationAndIncludesCorsHeaders() throws Exception {
        mockMvc.perform(get("/api/v1/users/me/profile").header("Origin", "http://localhost:5173"))
                .andExpect(status().isUnauthorized())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
    }

    @Test
    void rejectsUnconfiguredOrigin() throws Exception {
        mockMvc.perform(options("/api/v1/users/me/profile")
                        .header("Origin", "https://untrusted.example")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isForbidden())
                .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }
}
