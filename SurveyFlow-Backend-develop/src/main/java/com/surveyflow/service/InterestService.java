package com.surveyflow.service;

import java.util.List;

import com.surveyflow.dto.response.metadata.InterestResponse;

public interface InterestService {

    /** Lấy danh sách sở thích đang hoạt động. */
    List<InterestResponse> getInterests();
}
