package com.surveyflow.service.impl;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

import com.surveyflow.exception.InvalidRequestException;
import lombok.extern.slf4j.Slf4j;

@Slf4j(topic = "SURVEY-SECURITY-SUPPORT-SERVICE")
@Component
class SurveySecuritySupport {

    private static final Pattern GOOGLE_FORM_ID = Pattern.compile("/forms/d/(?:e/)?([^/]+)");
    private static final char[] CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ".toCharArray();

    private final SecureRandom secureRandom = new SecureRandom();

    /** Sinh webhook token ngẫu nhiên để xác thực Apps Script. */
    String newWebhookToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    /** Sinh completion code dễ đọc và tránh ký tự gây nhầm lẫn. */
    String newCompletionCode() {
        char[] value = new char[10];
        for (int i = 0; i < value.length; i++) {
            value[i] = CODE_ALPHABET[secureRandom.nextInt(CODE_ALPHABET.length)];
        }
        return new String(value);
    }

    /** Tạo SHA-256 hash cho giá trị cần lưu an toàn. */
    String sha256(String rawValue) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(rawValue.getBytes(StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is not available", ex);
        }
    }

    /** So sánh giá trị thô với hash theo cách chống timing attack. */
    boolean matches(String rawValue, String expectedHash) {
        if (rawValue == null || expectedHash == null) {
            return false;
        }
        return MessageDigest.isEqual(
                sha256(rawValue).getBytes(StandardCharsets.US_ASCII),
                expectedHash.getBytes(StandardCharsets.US_ASCII));
    }

    /** Trích xuất Google Form ID từ URL hợp lệ. */
    String extractGoogleFormId(String url) {
        if (url == null || url.isBlank()) {
            log.warn("Google Form URL validation failed: reason=missing_url");
            throw new InvalidRequestException("Google Form URL is required");
        }
        Matcher matcher = GOOGLE_FORM_ID.matcher(url);
        if (!matcher.find()) {
            log.warn("Google Form URL validation failed: reason=invalid_format");
            throw new InvalidRequestException("Invalid Google Form URL");
        }
        return matcher.group(1);
    }
}
