package com.surveyflow.service;

import java.util.List;

import com.surveyflow.dto.response.metadata.TagResponse;

public interface SurveyTagService {

    /** Lấy danh sách nhãn khảo sát. */
    List<TagResponse> getTags();
}
