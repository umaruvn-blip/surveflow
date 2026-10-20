package com.surveyflow.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.surveyflow.dto.response.ApiResponse;
import com.surveyflow.dto.response.metadata.LevelResponse;
import com.surveyflow.factory.ApiResponseFactory;
import com.surveyflow.service.LevelService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/levels")
@RequiredArgsConstructor
@Tag(name = "Level")
public class LevelController {

    private final LevelService service;
    private final ApiResponseFactory responseFactory;

    /** Liệt kê các cấp độ theo thứ tự tăng dần. */
    @GetMapping
    @Operation(summary = "List levels")
    public ResponseEntity<ApiResponse<List<LevelResponse>>> getLevels() {
        return ResponseEntity.ok(responseFactory.success(service.getLevels()));
    }
}
