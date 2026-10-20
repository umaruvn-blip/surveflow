package com.surveyflow.service.impl;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.surveyflow.dto.response.googleforms.GoogleFormItemResponse;
import com.surveyflow.dto.response.googleforms.GoogleFormVerifyResponse;
import com.surveyflow.dto.response.googleforms.GoogleFormsConnectionStatusResponse;
import com.surveyflow.exception.BusinessException;
import com.surveyflow.model.User;
import com.surveyflow.model.UserGoogleFormsConnection;
import com.surveyflow.repository.UserGoogleFormsConnectionRepository;
import com.surveyflow.repository.UserRepository;
import com.surveyflow.service.GoogleFormsClientService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j(topic = "GOOGLE-FORMS-CLIENT-SERVICE")
@Service
@RequiredArgsConstructor
public class GoogleFormsClientServiceImpl implements GoogleFormsClientService {

    private final UserGoogleFormsConnectionRepository connectionRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String clientSecret;

    private static final String GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
    private static final String GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
    private static final String GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";
    private static final String GOOGLE_DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files";
    private static final String GOOGLE_FORMS_API_URL = "https://forms.googleapis.com/v1/forms";

    private static final String FORMS_SCOPES = "https://www.googleapis.com/auth/forms.responses.readonly https://www.googleapis.com/auth/forms.body.readonly https://www.googleapis.com/auth/drive.metadata.readonly email profile";

    @Override
    public String buildAuthorizationUrl(Long userId, String redirectUri) {
        String encodedRedirect = URLEncoder.encode(redirectUri, StandardCharsets.UTF_8);
        String encodedScope = URLEncoder.encode(FORMS_SCOPES, StandardCharsets.UTF_8);
        String state = "user_" + userId + "_" + System.currentTimeMillis();

        return String.format(
                "%s?client_id=%s&redirect_uri=%s&response_type=code&scope=%s&access_type=offline&prompt=consent&state=%s",
                GOOGLE_AUTH_URL, clientId, encodedRedirect, encodedScope, state);
    }

    @Override
    @Transactional
    public GoogleFormsConnectionStatusResponse exchangeCodeAndConnect(Long userId, String code, String redirectUri) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("User not found"));

        try {
            // 1. Đổi code lấy Access Token & Refresh Token
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("code", code);
            body.add("client_id", clientId);
            body.add("client_secret", clientSecret);
            body.add("redirect_uri", redirectUri);
            body.add("grant_type", "authorization_code");

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> tokenResponse = restTemplate.postForEntity(GOOGLE_TOKEN_URL, request, String.class);

            JsonNode tokenJson = objectMapper.readTree(tokenResponse.getBody());
            String accessToken = tokenJson.path("access_token").asText();
            String refreshToken = tokenJson.has("refresh_token") ? tokenJson.path("refresh_token").asText() : null;
            long expiresIn = tokenJson.path("expires_in").asLong(3600);
            Instant tokenExpiresAt = Instant.now().plusSeconds(expiresIn);
            String scope = tokenJson.path("scope").asText(FORMS_SCOPES);

            // 2. Lấy thông tin email của tài khoản Google vừa ủy quyền
            HttpHeaders userInfoHeaders = new HttpHeaders();
            userInfoHeaders.setBearerAuth(accessToken);
            HttpEntity<Void> userInfoReq = new HttpEntity<>(userInfoHeaders);
            ResponseEntity<String> userInfoResp = restTemplate.exchange(GOOGLE_USERINFO_URL, HttpMethod.GET, userInfoReq, String.class);

            JsonNode userInfoJson = objectMapper.readTree(userInfoResp.getBody());
            String googleEmail = userInfoJson.path("email").asText();
            String googleUserId = userInfoJson.path("sub").asText();

            // 3. Lưu hoặc cập nhật Connection
            Optional<UserGoogleFormsConnection> existing = connectionRepository.findByUserId(userId);
            UserGoogleFormsConnection connection;
            if (existing.isPresent()) {
                connection = existing.get();
                connection.setGoogleEmail(googleEmail);
                connection.setGoogleUserId(googleUserId);
                connection.setAccessToken(accessToken);
                if (refreshToken != null) {
                    connection.setRefreshToken(refreshToken);
                }
                connection.setTokenExpiresAt(tokenExpiresAt);
                connection.setScope(scope);
            } else {
                connection = UserGoogleFormsConnection.builder()
                        .user(user)
                        .googleEmail(googleEmail)
                        .googleUserId(googleUserId)
                        .accessToken(accessToken)
                        .refreshToken(refreshToken)
                        .tokenExpiresAt(tokenExpiresAt)
                        .scope(scope)
                        .build();
            }

            connectionRepository.save(connection);
            log.info("User {} successfully connected Google Forms account: {}", userId, googleEmail);

            return GoogleFormsConnectionStatusResponse.builder()
                    .connected(true)
                    .googleEmail(googleEmail)
                    .googleUserId(googleUserId)
                    .connectedAt(connection.getCreatedAt() != null ? connection.getCreatedAt() : Instant.now())
                    .build();

        } catch (Exception e) {
            log.error("Failed to exchange code with Google for user {}: {}", userId, e.getMessage(), e);
            throw new BusinessException("Không thể kết nối với tài khoản Google. Vui lòng thử lại!");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public GoogleFormsConnectionStatusResponse getConnectionStatus(Long userId) {
        Optional<UserGoogleFormsConnection> conn = connectionRepository.findByUserId(userId);
        if (conn.isEmpty()) {
            return GoogleFormsConnectionStatusResponse.builder()
                    .connected(false)
                    .build();
        }
        UserGoogleFormsConnection connection = conn.get();
        return GoogleFormsConnectionStatusResponse.builder()
                .connected(true)
                .googleEmail(connection.getGoogleEmail())
                .googleUserId(connection.getGoogleUserId())
                .connectedAt(connection.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public void disconnect(Long userId) {
        connectionRepository.deleteByUserId(userId);
        log.info("User {} disconnected Google Forms account", userId);
    }

    @Override
    @Transactional
    public List<GoogleFormItemResponse> listUserForms(Long userId) {
        String accessToken = getValidAccessToken(userId);
        if (accessToken == null) {
            throw new BusinessException("Chưa kết nối tài khoản Google Forms hoặc phiên làm việc đã hết hạn");
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            HttpEntity<Void> request = new HttpEntity<>(headers);

            java.net.URI uri = org.springframework.web.util.UriComponentsBuilder.fromUriString(GOOGLE_DRIVE_FILES_URL)
                    .queryParam("q", "mimeType = 'application/vnd.google-apps.form' and trashed = false")
                    .queryParam("fields", "files(id,name,description,webViewLink,createdTime,modifiedTime)")
                    .queryParam("pageSize", 50)
                    .queryParam("orderBy", "modifiedTime desc")
                    .queryParam("supportsAllDrives", true)
                    .queryParam("includeItemsFromAllDrives", true)
                    .build()
                    .toUri();

            ResponseEntity<String> response = restTemplate.exchange(uri, HttpMethod.GET, request, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode files = root.path("files");

            List<GoogleFormItemResponse> items = new ArrayList<>();
            if (files.isArray()) {
                for (JsonNode file : files) {
                    String id = file.path("id").asText();
                    String name = file.path("name").asText();
                    String description = file.path("description").asText(null);
                    String webViewLink = file.path("webViewLink").asText(null);
                    String responderUri = "https://docs.google.com/forms/d/e/" + id + "/viewform";

                    items.add(GoogleFormItemResponse.builder()
                            .id(id)
                            .formId(id)
                            .title(name != null && !name.isBlank() ? name : "Google Form (" + id + ")")
                            .description(description)
                            .responderUri(webViewLink != null ? webViewLink : responderUri)
                            .editUri("https://docs.google.com/forms/d/" + id + "/edit")
                            .build());
                }
            }
            return items;

        } catch (Exception e) {
            log.error("Failed to list Google Forms for user {}: {}", userId, e.getMessage(), e);
            throw new BusinessException("Không thể lấy danh sách biểu mẫu từ Google Drive. Vui lòng kiểm tra quyền kết nối!");
        }
    }

    @Override
    @Transactional
    public GoogleFormItemResponse getFormDetails(Long userId, String formId) {
        String actualFormId = extractFormId(formId);
        if (actualFormId == null || actualFormId.isBlank()) {
            throw new BusinessException("Mã biểu mẫu Google Form không hợp lệ");
        }

        String accessToken = getValidAccessToken(userId);
        if (accessToken == null) {
            throw new BusinessException("Chưa kết nối tài khoản Google Forms");
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            HttpEntity<Void> request = new HttpEntity<>(headers);

            String url = GOOGLE_FORMS_API_URL + "/" + actualFormId;
            ResponseEntity<String> response;
            try {
                response = restTemplate.exchange(url, HttpMethod.GET, request, String.class);
            } catch (Exception e) {
                // If direct form ID fails (e.g. if it's responder ID /d/e/...), try finding Drive form
                String resolvedId = resolveDriveFormId(userId, actualFormId, accessToken);
                if (resolvedId != null && !resolvedId.equals(actualFormId)) {
                    actualFormId = resolvedId;
                    url = GOOGLE_FORMS_API_URL + "/" + actualFormId;
                    response = restTemplate.exchange(url, HttpMethod.GET, request, String.class);
                } else {
                    throw e;
                }
            }

            JsonNode root = objectMapper.readTree(response.getBody());
            String title = root.path("info").path("title").asText("Google Form");
            String description = root.path("info").path("description").asText(null);
            String responderUri = root.path("responderUri").asText("https://docs.google.com/forms/d/" + actualFormId + "/viewform");

            int questionCount = 0;
            boolean hasCodeQuestion = false;
            JsonNode items = root.path("items");
            if (items.isArray()) {
                for (JsonNode item : items) {
                    if (item.has("questionItem") || item.has("questionGroupItem")) {
                        questionCount++;
                    }
                    String itemTitle = item.path("title").asText("");
                    String itemDesc = item.path("description").asText("");
                    if (isCompletionCodeText(itemTitle) || isCompletionCodeText(itemDesc)) {
                        hasCodeQuestion = true;
                    }
                }
            }

            return GoogleFormItemResponse.builder()
                    .id(actualFormId)
                    .formId(actualFormId)
                    .title(title)
                    .description(description)
                    .responderUri(responderUri)
                    .editUri("https://docs.google.com/forms/d/" + actualFormId + "/edit")
                    .questionCount(questionCount)
                    .hasCompletionCodeQuestion(hasCodeQuestion)
                    .build();

        } catch (Exception e) {
            log.error("Failed to get Google Form details for form {}: {}", formId, e.getMessage());
            throw new BusinessException("Không thể lấy thông tin chi tiết Google Form ID: " + formId);
        }
    }

    @Override
    @Transactional
    public boolean hasCompletionCodeQuestion(Long userId, String formId) {
        if (formId == null || formId.isBlank()) {
            return false;
        }
        try {
            GoogleFormItemResponse details = getFormDetails(userId, formId);
            return Boolean.TRUE.equals(details.getHasCompletionCodeQuestion());
        } catch (Exception e) {
            log.warn("Could not check completion code question for user {} and form {}: {}", userId, formId, e.getMessage());
            return false;
        }
    }

    @Override
    @Transactional
    public GoogleFormVerifyResponse verifyResponse(Long creatorUserId, String formId, String targetCode, Instant afterTimestamp) {
        return verifyResponse(creatorUserId, formId, targetCode, null, afterTimestamp);
    }

    @Override
    @Transactional
    public GoogleFormVerifyResponse verifyResponse(Long creatorUserId, String formId, String targetCode, String targetEmail, Instant afterTimestamp) {
        String accessToken = getValidAccessToken(creatorUserId);
        if (accessToken == null) {
            return GoogleFormVerifyResponse.builder()
                    .verified(false)
                    .message("Chủ khảo sát chưa kết nối hoặc đã ngắt quyền Google Forms")
                    .build();
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            HttpEntity<Void> request = new HttpEntity<>(headers);

            String cleanFormId = extractFormId(formId);
            String url = GOOGLE_FORMS_API_URL + "/" + cleanFormId + "/responses";

            ResponseEntity<String> response;
            try {
                response = restTemplate.exchange(url, HttpMethod.GET, request, String.class);
            } catch (Exception e) {
                // If direct form ID fails (e.g. responder ID /d/e/...), try finding Drive form
                String resolvedId = resolveDriveFormId(creatorUserId, cleanFormId, accessToken);
                if (resolvedId != null && !resolvedId.equals(cleanFormId)) {
                    cleanFormId = resolvedId;
                    url = GOOGLE_FORMS_API_URL + "/" + cleanFormId + "/responses";
                    response = restTemplate.exchange(url, HttpMethod.GET, request, String.class);
                } else {
                    throw e;
                }
            }

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode responses = root.path("responses");

            if (!responses.isArray() || responses.isEmpty()) {
                return GoogleFormVerifyResponse.builder()
                        .verified(false)
                        .message("Chưa tìm thấy phản hồi nào trên Google Form này")
                        .build();
            }

            String searchEmail = targetEmail != null && !targetEmail.isBlank() ? targetEmail.trim().toLowerCase() : null;
            String searchCode = targetCode != null && !targetCode.isBlank() ? targetCode.trim().toLowerCase() : null;

            for (JsonNode resp : responses) {
                String responseId = resp.path("responseId").asText();
                String respondentEmail = resp.path("respondentEmail").asText(null);
                String createTimeStr = resp.path("createTime").asText();
                Instant submittedAt = (createTimeStr != null && !createTimeStr.isBlank())
                        ? Instant.parse(createTimeStr)
                        : Instant.now();

                // Nếu có sau thời điểm bắt đầu (cho phép sai lệch 3 phút)
                if (afterTimestamp != null && submittedAt.isBefore(afterTimestamp.minusSeconds(180))) {
                    continue; // Bỏ qua các phản hồi cũ trước khi tham gia
                }

                // 1. Kiểm tra khớp Email Google của người nộp
                if (searchEmail != null) {
                    boolean emailMatched = false;
                    if (respondentEmail != null && respondentEmail.trim().equalsIgnoreCase(searchEmail)) {
                        emailMatched = true;
                    } else {
                        // Kiểm tra nếu người dùng điền email vào một câu hỏi trong form
                        JsonNode answers = resp.path("answers");
                        if (answers.isObject()) {
                            for (JsonNode answerItem : answers) {
                                JsonNode textAnswers = answerItem.path("textAnswers").path("answers");
                                if (textAnswers.isArray()) {
                                    for (JsonNode val : textAnswers) {
                                        String text = val.path("value").asText("");
                                        if (text.trim().equalsIgnoreCase(searchEmail)) {
                                            emailMatched = true;
                                            break;
                                        }
                                    }
                                }
                                if (emailMatched) break;
                            }
                        }
                    }

                    if (emailMatched) {
                        return GoogleFormVerifyResponse.builder()
                                .verified(true)
                                .responseId(responseId)
                                .submittedAt(submittedAt)
                                .message("Đã tìm thấy phản hồi hợp lệ từ email " + searchEmail + "!")
                                .build();
                    }
                }

                // 2. Kiểm tra khớp Mã xác nhận (nếu có)
                if (searchCode != null) {
                    boolean codeFound = false;
                    JsonNode answers = resp.path("answers");
                    if (answers.isObject()) {
                        for (JsonNode answerItem : answers) {
                            JsonNode textAnswers = answerItem.path("textAnswers").path("answers");
                            if (textAnswers.isArray()) {
                                for (JsonNode val : textAnswers) {
                                    String text = val.path("value").asText("");
                                    if (text.toLowerCase().contains(searchCode)) {
                                        codeFound = true;
                                        break;
                                    }
                                }
                            }
                            if (codeFound) break;
                        }
                    }

                    if (codeFound) {
                        return GoogleFormVerifyResponse.builder()
                                .verified(true)
                                .responseId(responseId)
                                .submittedAt(submittedAt)
                                .message("Đã tìm thấy phản hồi hợp lệ khớp mã xác nhận!")
                                .build();
                    }
                }

                // 3. Nếu không chỉ định cả email lẫn mã (chỉ kiểm tra có phản hồi mới sau timestamp)
                if (searchEmail == null && searchCode == null) {
                    return GoogleFormVerifyResponse.builder()
                            .verified(true)
                            .responseId(responseId)
                            .submittedAt(submittedAt)
                            .message("Đã xác nhận phản hồi Google Form thành công!")
                            .build();
                }
            }

            String failMessage = searchEmail != null
                    ? "Chưa tìm thấy phản hồi từ email " + searchEmail + " trên Google Form. Hãy đảm bảo bạn đã bấm 'Gửi' và sử dụng đúng tài khoản Google này!"
                    : "Không tìm thấy phản hồi khớp với thông tin của bạn trên Google Form";

            return GoogleFormVerifyResponse.builder()
                    .verified(false)
                    .message(failMessage)
                    .build();

        } catch (Exception e) {
            log.error("Failed to verify Google Form response for form {}: {}", formId, e.getMessage());
            return GoogleFormVerifyResponse.builder()
                    .verified(false)
                    .message("Lỗi khi kiểm tra phản hồi từ Google Forms API: " + e.getMessage())
                    .build();
        }
    }

    private String getValidAccessToken(Long userId) {
        Optional<UserGoogleFormsConnection> connOpt = connectionRepository.findByUserId(userId);
        if (connOpt.isEmpty()) return null;

        UserGoogleFormsConnection conn = connOpt.get();
        // Nếu token còn hạn ít nhất 3 phút thì dùng luôn
        if (conn.getTokenExpiresAt() != null && conn.getTokenExpiresAt().isAfter(Instant.now().plusSeconds(180))) {
            return conn.getAccessToken();
        }

        // Token hết hạn -> làm mới bằng Refresh Token
        if (conn.getRefreshToken() == null || conn.getRefreshToken().isBlank()) {
            return conn.getAccessToken();
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("client_id", clientId);
            body.add("client_secret", clientSecret);
            body.add("refresh_token", conn.getRefreshToken());
            body.add("grant_type", "refresh_token");

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> tokenResponse = restTemplate.postForEntity(GOOGLE_TOKEN_URL, request, String.class);

            JsonNode tokenJson = objectMapper.readTree(tokenResponse.getBody());
            String newAccessToken = tokenJson.path("access_token").asText();
            long expiresIn = tokenJson.path("expires_in").asLong(3600);

            conn.setAccessToken(newAccessToken);
            conn.setTokenExpiresAt(Instant.now().plusSeconds(expiresIn));
            connectionRepository.save(conn);

            log.info("Refreshed Google Forms access token for user {}", userId);
            return newAccessToken;

        } catch (Exception e) {
            log.error("Failed to refresh Google token for user {}: {}", userId, e.getMessage());
            return conn.getAccessToken();
        }
    }

    private String extractFormId(String urlOrId) {
        if (urlOrId == null) return "";
        String trimmed = urlOrId.trim();
        String id;
        if (trimmed.contains("/d/e/")) {
            int start = trimmed.indexOf("/d/e/") + 5;
            int end = trimmed.indexOf("/", start);
            id = end != -1 ? trimmed.substring(start, end) : trimmed.substring(start);
        } else if (trimmed.contains("/d/")) {
            int start = trimmed.indexOf("/d/") + 3;
            int end = trimmed.indexOf("/", start);
            id = end != -1 ? trimmed.substring(start, end) : trimmed.substring(start);
        } else {
            id = trimmed;
        }
        if (id.contains("?")) {
            id = id.substring(0, id.indexOf("?"));
        }
        return id.trim();
    }

    private boolean isCompletionCodeText(String text) {
        if (text == null || text.isBlank()) return false;
        String lower = text.toLowerCase().trim();
        return lower.contains("mã xác nhận")
                || lower.contains("ma xac nhan")
                || lower.contains("mã hoàn thành")
                || lower.contains("ma hoan thanh")
                || lower.contains("mã xác thực")
                || lower.contains("ma xac thuc")
                || lower.contains("mã surveyflow")
                || lower.contains("ma surveyflow")
                || lower.contains("completion code")
                || lower.contains("verification code")
                || lower.contains("confirmation code")
                || (lower.contains("surveyflow") && (lower.contains("mã") || lower.contains("code") || lower.contains("xác nhận") || lower.contains("xac nhan")));
    }

    private String resolveDriveFormId(Long userId, String searchIdOrUrl, String accessToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            HttpEntity<Void> request = new HttpEntity<>(headers);

            java.net.URI uri = org.springframework.web.util.UriComponentsBuilder.fromUriString(GOOGLE_DRIVE_FILES_URL)
                    .queryParam("q", "mimeType = 'application/vnd.google-apps.form' and trashed = false")
                    .queryParam("fields", "files(id,name,webViewLink)")
                    .queryParam("pageSize", 50)
                    .queryParam("supportsAllDrives", true)
                    .queryParam("includeItemsFromAllDrives", true)
                    .build()
                    .toUri();

            ResponseEntity<String> response = restTemplate.exchange(uri, HttpMethod.GET, request, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode files = root.path("files");
            if (files.isArray()) {
                for (JsonNode file : files) {
                    String fileId = file.path("id").asText("");
                    String webViewLink = file.path("webViewLink").asText("");
                    if (fileId.equalsIgnoreCase(searchIdOrUrl) || webViewLink.contains(searchIdOrUrl)) {
                        return fileId;
                    }
                }
                // Try inspecting responderUri of each form in Drive
                for (JsonNode file : files) {
                    String fileId = file.path("id").asText("");
                    try {
                        String formUrl = GOOGLE_FORMS_API_URL + "/" + fileId;
                        ResponseEntity<String> formResp = restTemplate.exchange(formUrl, HttpMethod.GET, request, String.class);
                        JsonNode formRoot = objectMapper.readTree(formResp.getBody());
                        String responderUri = formRoot.path("responderUri").asText("");
                        if (responderUri.contains(searchIdOrUrl)) {
                            return fileId;
                        }
                    } catch (Exception ignored) {}
                }
            }
        } catch (Exception e) {
            log.warn("Failed to resolve Drive Form ID for user {}: {}", userId, e.getMessage());
        }
        return null;
    }
}
