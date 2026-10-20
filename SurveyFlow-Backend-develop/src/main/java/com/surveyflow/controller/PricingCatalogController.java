package com.surveyflow.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.surveyflow.dto.response.ApiResponse;
import com.surveyflow.dto.response.pricing.CreditPackageResponse;
import com.surveyflow.dto.response.pricing.RewardCatalogItemResponse;
import com.surveyflow.dto.response.pricing.SubscriptionPlanResponse;
import com.surveyflow.factory.ApiResponseFactory;
import com.surveyflow.service.PricingCatalogService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/pricing")
@RequiredArgsConstructor
@Tag(name = "Pricing")
public class PricingCatalogController {

    private final PricingCatalogService service;
    private final ApiResponseFactory responseFactory;

    /** Liệt kê các gói Credits đang bán. */
    @GetMapping("/credit-packages")
    @Operation(summary = "List active Credit packages")
    public ApiResponse<List<CreditPackageResponse>> getCreditPackages() {
        return responseFactory.success(service.getCreditPackages());
    }

    /** Liệt kê giá và quyền lợi của các gói subscription đang bán. */
    @GetMapping("/subscription-plans")
    @Operation(summary = "List active subscription plans with current prices and entitlements")
    public ApiResponse<List<SubscriptionPlanResponse>> getSubscriptionPlans() {
        return responseFactory.success(service.getSubscriptionPlans());
    }

    /** Liệt kê các phần thưởng đang hiển thị trong danh mục. */
    @GetMapping("/rewards")
    @Operation(summary = "List active reward catalog items")
    public ApiResponse<List<RewardCatalogItemResponse>> getRewards() {
        return responseFactory.success(service.getRewards());
    }
}
