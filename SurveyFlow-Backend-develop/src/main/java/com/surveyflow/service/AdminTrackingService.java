package com.surveyflow.service;

import com.surveyflow.dto.response.admin.AdminTrackingStatsResponse;

public interface AdminTrackingService {

    /**
     * Lấy báo cáo thống kê toàn diện dành riêng cho Quản trị viên (Admin Dashboard).
     */
    AdminTrackingStatsResponse getAdminTrackingSummary();
}
