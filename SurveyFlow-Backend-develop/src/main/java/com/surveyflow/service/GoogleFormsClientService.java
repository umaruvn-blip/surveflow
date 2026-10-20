package com.surveyflow.service;

import java.time.Instant;
import java.util.List;

import com.surveyflow.dto.response.googleforms.GoogleFormItemResponse;
import com.surveyflow.dto.response.googleforms.GoogleFormVerifyResponse;
import com.surveyflow.dto.response.googleforms.GoogleFormsConnectionStatusResponse;

public interface GoogleFormsClientService {

    String buildAuthorizationUrl(Long userId, String redirectUri);

    GoogleFormsConnectionStatusResponse exchangeCodeAndConnect(Long userId, String code, String redirectUri);

    GoogleFormsConnectionStatusResponse getConnectionStatus(Long userId);

    void disconnect(Long userId);

    List<GoogleFormItemResponse> listUserForms(Long userId);

    GoogleFormItemResponse getFormDetails(Long userId, String formId);

    boolean hasCompletionCodeQuestion(Long userId, String formId);

    GoogleFormVerifyResponse verifyResponse(Long creatorUserId, String formId, String targetCode, Instant afterTimestamp);

    GoogleFormVerifyResponse verifyResponse(Long creatorUserId, String formId, String targetCode, String targetEmail, Instant afterTimestamp);
}
