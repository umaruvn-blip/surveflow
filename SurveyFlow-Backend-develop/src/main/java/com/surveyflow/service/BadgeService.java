package com.surveyflow.service;

import java.util.List;

import com.surveyflow.dto.response.metadata.BadgeResponse;

public interface BadgeService {

    /** Lấy danh sách huy hiệu đang hoạt động. */
    List<BadgeResponse> getBadges();
}
