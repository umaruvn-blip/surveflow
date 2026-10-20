package com.surveyflow.service;

import com.surveyflow.dto.request.survey.SurveyUpsertRequest;
import com.surveyflow.dto.response.PageResponse;
import com.surveyflow.dto.response.survey.SurveyResponse;
import com.surveyflow.dto.response.survey.SurveySummaryResponse;
import com.surveyflow.dto.response.survey.SurveyTrackingSummaryResponse;
import com.surveyflow.dto.response.survey.WebhookConfigurationResponse;

public interface SurveyService {

    /** Tạo survey mới ở trạng thái draft. */
    SurveyResponse create(Long creatorId, SurveyUpsertRequest request);

    /** Cập nhật toàn bộ cấu hình của survey draft. */
    SurveyResponse update(Long creatorId, Long surveyId, SurveyUpsertRequest request);

    /** Lấy danh sách survey của creator hiện tại. */
    PageResponse<SurveySummaryResponse> findMine(Long creatorId, int page, int size, String sortBy, String sortDir);

    /** Lấy danh sách survey user có thể tham gia. */
    PageResponse<SurveySummaryResponse> discover(Long userId, int page, int size, String sortBy, String sortDir);

    /** Lấy chi tiết survey user được phép xem. */
    SurveyResponse get(Long userId, Long surveyId);

    /** Lấy báo cáo tổng hợp theo dõi khảo sát (scope: "mine" hoặc "global"). */
    SurveyTrackingSummaryResponse getTrackingSummary(Long creatorId, String scope);

    /** Tạo lại webhook token và cấu hình kết nối Google Forms. */
    WebhookConfigurationResponse configureWebhook(Long creatorId, Long surveyId);

    /** Publish survey sau khi các điều kiện nghiệp vụ được đáp ứng. */
    SurveyResponse publish(Long creatorId, Long surveyId);

    /** Đóng survey đang hoạt động. */
    SurveyResponse close(Long creatorId, Long surveyId);
}
