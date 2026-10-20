package com.surveyflow.service;

import com.surveyflow.dto.request.feedback.CreateFeedbackRequest;
import com.surveyflow.dto.response.feedback.FeedbackSummaryResponse;

public interface FeedbackService {

    /**
     * Lưu phản hồi từ người dùng (đã đăng nhập hoặc ẩn danh).
     */
    void createFeedback(Long userId, CreateFeedbackRequest request);

    /**
     * Lấy tổng hợp thống kê và phản hồi gần nhất cho báo cáo.
     */
    FeedbackSummaryResponse getFeedbackSummary();
}
