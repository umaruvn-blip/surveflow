package com.surveyflow.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.surveyflow.dto.response.ApiResponse;
import com.surveyflow.dto.response.metadata.TagResponse;
import com.surveyflow.factory.ApiResponseFactory;
import com.surveyflow.service.SurveyTagService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/tags")
@RequiredArgsConstructor
@Tag(name = "SurveyTag")
public class SurveyTagController {

    private final SurveyTagService service;
    private final ApiResponseFactory responseFactory;

    /** Liệt kê nhãn khảo sát hiện có. */
    @GetMapping
    @Operation(summary = "List survey tags")
    public ResponseEntity<ApiResponse<List<TagResponse>>> getTags() {
        return ResponseEntity.ok(responseFactory.success(service.getTags()));
    }
}
