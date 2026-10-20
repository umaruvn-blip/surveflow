package com.surveyflow.service;

import java.util.List;

import com.surveyflow.dto.response.survey.SurveyRecommendationResponse;

public interface SurveyRecommendationService {

    /**
     * Gợi ý danh sách khảo sát phù hợp nhất cho người dùng dựa trên AI Matching.
     *
     * @param userId ID của người dùng cần gợi ý (null nếu chưa đăng nhập)
     * @param limit Số lượng khảo sát tối đa cần lấy
     * @return Danh sách khảo sát được sắp xếp theo mức độ phù hợp giảm dần
     */
    List<SurveyRecommendationResponse> getRecommendedSurveys(Long userId, Integer limit);
}
