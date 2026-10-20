package com.surveyflow.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.surveyflow.dto.response.ApiResponse;
import com.surveyflow.dto.response.metadata.InterestResponse;
import com.surveyflow.factory.ApiResponseFactory;
import com.surveyflow.service.InterestService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/interests")
@RequiredArgsConstructor
@Tag(name = "Interest")
public class InterestController {

    private final InterestService service;
    private final ApiResponseFactory responseFactory;

    /** Liệt kê sở thích có thể dùng để nhắm đối tượng. */
    @GetMapping
    @Operation(summary = "List active interests")
    public ResponseEntity<ApiResponse<List<InterestResponse>>> getInterests() {
        return ResponseEntity.ok(responseFactory.success(service.getInterests()));
    }
}
