package com.surveyflow.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.surveyflow.model.Interest;
import com.surveyflow.model.Badge;
import com.surveyflow.model.Level;
import com.surveyflow.model.SurveyCategory;
import com.surveyflow.model.SurveyTag;
import com.surveyflow.repository.InterestRepository;
import com.surveyflow.repository.BadgeRepository;
import com.surveyflow.repository.LevelRepository;
import com.surveyflow.repository.SurveyCategoryRepository;
import com.surveyflow.repository.SurveyTagRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ReferenceDataControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SurveyCategoryRepository categoryRepository;

    @Autowired
    private InterestRepository interestRepository;

    @Autowired
    private SurveyTagRepository tagRepository;

    @Autowired
    private BadgeRepository badgeRepository;

    @Autowired
    private LevelRepository levelRepository;

    @Test
    void categoriesArePublicAndExcludeInactiveRecords() throws Exception {
        SurveyCategory active = new SurveyCategory();
        active.setName("AAA Test Category");
        active.setSlug("aaa-test-category");
        active.setDescription("Visible category");
        categoryRepository.saveAndFlush(active);

        SurveyCategory inactive = new SurveyCategory();
        inactive.setName("AAA Hidden Category");
        inactive.setSlug("aaa-hidden-category");
        inactive.setActive(false);
        categoryRepository.saveAndFlush(inactive);

        String body = mockMvc.perform(get("/api/v1/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value(active.getId()))
                .andExpect(jsonPath("$.data[0].slug").value("aaa-test-category"))
                .andExpect(jsonPath("$.data[0].description").value("Visible category"))
                .andReturn().getResponse().getContentAsString();

        assertThat(body).doesNotContain("aaa-hidden-category");
    }

    @Test
    void interestsArePublicAndExcludeInactiveRecords() throws Exception {
        Interest active = new Interest();
        active.setName("AAA Test Interest");
        active.setSlug("aaa-test-interest");
        active.setDescription("Visible interest");
        interestRepository.saveAndFlush(active);

        Interest inactive = new Interest();
        inactive.setName("AAA Hidden Interest");
        inactive.setSlug("aaa-hidden-interest");
        inactive.setActive(false);
        interestRepository.saveAndFlush(inactive);

        String body = mockMvc.perform(get("/api/v1/interests"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value(active.getId()))
                .andExpect(jsonPath("$.data[0].slug").value("aaa-test-interest"))
                .andExpect(jsonPath("$.data[0].description").value("Visible interest"))
                .andReturn().getResponse().getContentAsString();

        assertThat(body).doesNotContain("aaa-hidden-interest");
    }

    @Test
    void tagsArePublicAndSortedByName() throws Exception {
        SurveyTag second = new SurveyTag();
        second.setName("AAB Test Tag");
        second.setSlug("aab-test-tag");
        tagRepository.saveAndFlush(second);

        SurveyTag first = new SurveyTag();
        first.setName("AAA Test Tag");
        first.setSlug("aaa-test-tag");
        tagRepository.saveAndFlush(first);

        mockMvc.perform(get("/api/v1/tags"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value(first.getId()))
                .andExpect(jsonPath("$.data[0].slug").value("aaa-test-tag"))
                .andExpect(jsonPath("$.data[1].id").value(second.getId()));
    }

    @Test
    void badgesArePublicAndExcludeInactiveRecords() throws Exception {
        Badge active = new Badge();
        active.setCode("AAA_TEST_BADGE");
        active.setName("AAA Test Badge");
        active.setDescription("Visible badge");
        active.setIconUrl("https://example.com/badge.svg");
        badgeRepository.saveAndFlush(active);

        Badge inactive = new Badge();
        inactive.setCode("AAA_HIDDEN_BADGE");
        inactive.setName("AAA Hidden Badge");
        inactive.setActive(false);
        badgeRepository.saveAndFlush(inactive);

        String body = mockMvc.perform(get("/api/v1/badges"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value(active.getId()))
                .andExpect(jsonPath("$.data[0].code").value("AAA_TEST_BADGE"))
                .andExpect(jsonPath("$.data[0].iconUrl").value("https://example.com/badge.svg"))
                .andReturn().getResponse().getContentAsString();

        assertThat(body).doesNotContain("AAA_HIDDEN_BADGE");
    }

    @Test
    void levelsArePublicAndSortedByLevelNumber() throws Exception {
        Level second = new Level();
        second.setLevelNumber(10_001);
        second.setName("Second test level");
        second.setMinXp(1_000_000L);
        levelRepository.saveAndFlush(second);

        Level first = new Level();
        first.setLevelNumber(10_000);
        first.setName("First test level");
        first.setMinXp(900_000L);
        levelRepository.saveAndFlush(first);

        String body = mockMvc.perform(get("/api/v1/levels"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andReturn().getResponse().getContentAsString();

        assertThat(body).contains("\"levelNumber\":10000", "\"levelNumber\":10001");
        assertThat(body.indexOf("\"levelNumber\":10000"))
                .isLessThan(body.indexOf("\"levelNumber\":10001"));
        assertThat(body).contains("\"minXp\":900000");
    }
}
