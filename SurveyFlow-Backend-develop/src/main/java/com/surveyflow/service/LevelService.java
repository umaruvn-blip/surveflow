package com.surveyflow.service;

import java.util.List;

import com.surveyflow.dto.response.metadata.LevelResponse;

public interface LevelService {

    /** Lấy danh sách cấp độ theo ngưỡng XP. */
    List<LevelResponse> getLevels();
}
