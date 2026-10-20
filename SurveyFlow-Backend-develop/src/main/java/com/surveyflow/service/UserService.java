package com.surveyflow.service;

import com.surveyflow.dto.request.user.ProfileUpdateRequest;
import com.surveyflow.dto.request.user.ReplaceInterestsRequest;
import com.surveyflow.dto.response.user.InterestsResponse;
import com.surveyflow.dto.response.user.UserProfileResponse;

public interface UserService {

    /** Lấy tài khoản, hồ sơ và sở thích của user hiện tại. */
    UserProfileResponse getProfile(Long userId);

    /** Cập nhật toàn bộ thông tin hồ sơ từ request của client. */
    UserProfileResponse updateProfile(Long userId, ProfileUpdateRequest request);

    /** Thay thế toàn bộ sở thích của user hiện tại. */
    InterestsResponse replaceInterests(Long userId, ReplaceInterestsRequest request);
}
