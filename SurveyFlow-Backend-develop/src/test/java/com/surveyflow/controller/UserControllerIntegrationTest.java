package com.surveyflow.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.surveyflow.model.Interest;
import com.surveyflow.model.User;
import com.surveyflow.repository.InterestRepository;
import com.surveyflow.repository.UserInterestRepository;
import com.surveyflow.repository.UserProfileRepository;
import com.surveyflow.repository.UserRepository;
import com.surveyflow.security.service.JwtService;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class UserControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JwtService jwtService;
    @Autowired private UserRepository userRepository;
    @Autowired private UserProfileRepository profileRepository;
    @Autowired private InterestRepository interestRepository;
    @Autowired private UserInterestRepository userInterestRepository;

    @Test
    void profileRequestReplacesEditableFieldsAndCreatesMissingProfile() throws Exception {
        User user = createUser();
        String authorization = bearer(user);

        mockMvc.perform(get("/api/v1/users/me/profile").header("Authorization", authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.userId").value(user.getId()))
                .andExpect(jsonPath("$.data.displayName").isEmpty())
                .andExpect(jsonPath("$.data.interests").isArray());

        mockMvc.perform(put("/api/v1/users/me/profile")
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"displayName\":\"  An  \",\"school\":\"School A\",\"gender\":\"MALE\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.displayName").value("An"))
                .andExpect(jsonPath("$.data.gender").value("MALE"))
                .andExpect(jsonPath("$.data.school").value("School A"));

        mockMvc.perform(put("/api/v1/users/me/profile")
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"displayName\":null,\"school\":\"School A\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.displayName").isEmpty())
                .andExpect(jsonPath("$.data.gender").isEmpty())
                .andExpect(jsonPath("$.data.school").value("School A"));

        assertThat(profileRepository.findByUserId(user.getId())).isPresent();
        assertThat(profileRepository.findByUserId(user.getId()).orElseThrow().getSchool()).isEqualTo("School A");
    }

    @Test
    void profileRejectsInvalidValuesWithoutChangingProfile() throws Exception {
        User user = createUser();
        String authorization = bearer(user);

        for (String body : new String[] {
                "{\"gender\":\"INVALID\"}",
                "{\"birthYear\":3000}"
        }) {
            mockMvc.perform(put("/api/v1/users/me/profile")
                            .header("Authorization", authorization)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
        }

        assertThat(profileRepository.findByUserId(user.getId())).isEmpty();
    }

    @Test
    void invalidGenderReturnsBadRequestDuringJsonMapping() throws Exception {
        User user = createUser();

        mockMvc.perform(put("/api/v1/users/me/profile")
                        .header("Authorization", bearer(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"gender\":\"INVALID\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
                .andExpect(jsonPath("$.message").value("Request body is invalid"));
    }

    @Test
    void replaceInterestsIsAtomicAndSupportsEmptyList() throws Exception {
        User user = createUser();
        String authorization = bearer(user);
        Interest first = createInterest(true);
        Interest second = createInterest(true);
        Interest inactive = createInterest(false);

        mockMvc.perform(put("/api/v1/users/me/interests")
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"interestIds\":[" + second.getId() + "," + first.getId() + "]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.interests[0].id").value(first.getId()))
                .andExpect(jsonPath("$.data.interests[1].id").value(second.getId()));

        for (String body : new String[] {
                "{\"interestIds\":[" + first.getId() + "," + inactive.getId() + "]}",
                "{\"interestIds\":[" + first.getId() + "," + first.getId() + "]}",
                "{\"interestIds\":[" + first.getId() + ",999999999]}"
        }) {
            mockMvc.perform(put("/api/v1/users/me/interests")
                            .header("Authorization", authorization)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isBadRequest());
            assertThat(userInterestRepository.findByUserId(user.getId())).hasSize(2);
        }

        mockMvc.perform(put("/api/v1/users/me/interests")
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"interestIds\":[]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.interests").isEmpty());
        assertThat(userInterestRepository.findByUserId(user.getId())).isEmpty();
    }

    @Test
    void profileRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/v1/users/me/profile"))
                .andExpect(status().isUnauthorized());
    }

    private User createUser() {
        User user = new User();
        user.setEmail("profile-" + UUID.randomUUID() + "@example.test");
        return userRepository.saveAndFlush(user);
    }

    private Interest createInterest(boolean active) {
        String slug = "test-" + UUID.randomUUID();
        Interest interest = new Interest();
        interest.setName(slug);
        interest.setSlug(slug);
        interest.setActive(active);
        return interestRepository.saveAndFlush(interest);
    }

    private String bearer(User user) {
        return "Bearer " + jwtService.generateAccessToken(user.getEmail(), Map.of());
    }
}
