package com.surveyflow.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.surveyflow.dto.response.ApiResponse;
import com.surveyflow.dto.response.metadata.BadgeResponse;
import com.surveyflow.factory.ApiResponseFactory;
import com.surveyflow.service.BadgeService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/badges")
@RequiredArgsConstructor
@Tag(name = "Badge")
public class BadgeController {

    private final BadgeService service;
    private final ApiResponseFactory responseFactory;

    /** Liệt kê huy hiệu có thể hiển thị cho người dùng. */
    @GetMapping
    @Operation(summary = "List active badges")
    public ResponseEntity<ApiResponse<List<BadgeResponse>>> getBadges() {
        return ResponseEntity.ok(responseFactory.success(service.getBadges()));
    }
}
