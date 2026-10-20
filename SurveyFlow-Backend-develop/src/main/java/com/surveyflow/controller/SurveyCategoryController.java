package com.surveyflow.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.surveyflow.dto.response.ApiResponse;
import com.surveyflow.dto.response.metadata.CategoryResponse;
import com.surveyflow.factory.ApiResponseFactory;
import com.surveyflow.service.SurveyCategoryService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@Tag(name = "SurveyCategory")
public class SurveyCategoryController {

    private final SurveyCategoryService service;
    private final ApiResponseFactory responseFactory;

    /** Liệt kê danh mục có thể dùng cho khảo sát. */
    @GetMapping
    @Operation(summary = "List active survey categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories() {
        return ResponseEntity.ok(responseFactory.success(service.getCategories()));
    }
}
