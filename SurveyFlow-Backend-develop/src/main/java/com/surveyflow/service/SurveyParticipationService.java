package com.surveyflow.service;

import com.surveyflow.dto.request.survey.VerifyParticipationRequest;
import com.surveyflow.dto.response.survey.CompletionCodeResponse;
import com.surveyflow.dto.response.survey.ParticipationResponse;

public interface SurveyParticipationService {

    /** Giữ một slot tham gia survey cho user. */
    ParticipationResponse reserve(Long userId, Long surveyId);

    /** Lấy lượt tham gia thuộc user hiện tại. */
    ParticipationResponse get(Long userId, String publicId);

    /** Phát completion code cho lượt tham gia đủ điều kiện. */
    CompletionCodeResponse issueCompletionCode(Long userId, String publicId);

    /** Xác nhận hoàn thành khảo sát và nhận thưởng credits. */
    ParticipationResponse verify(Long userId, String publicId, VerifyParticipationRequest request);

    /** Hủy lượt tham gia đang giữ slot. */
    ParticipationResponse cancel(Long userId, String publicId);
}

