package com.surveyflow.service;

import java.util.List;

import com.surveyflow.dto.response.metadata.CategoryResponse;

public interface SurveyCategoryService {

    /** Lấy danh sách danh mục khảo sát đang hoạt động. */
    List<CategoryResponse> getCategories();
}
