package com.nexora.crm.controller;

import com.nexora.crm.dto.common.ApiResponse;
import com.nexora.crm.dto.company.CompanySettingDto;
import com.nexora.crm.dto.subscription.SubscriptionDto;
import com.nexora.crm.dto.subscription.SubscriptionPlanDto;
import com.nexora.crm.service.SubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "Subscription & Settings", description = "Company subscription plans, licensing, and workspace preferences")
public class SubscriptionAndSettingsController {

    private final SubscriptionService subscriptionService;

    public SubscriptionAndSettingsController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @GetMapping("/subscription/plans")
    @Operation(summary = "Get available subscription plans")
    public ResponseEntity<ApiResponse<List<SubscriptionPlanDto>>> getPlans() {
        List<SubscriptionPlanDto> plans = subscriptionService.getAvailablePlans();
        return ResponseEntity.ok(ApiResponse.ok("Plans retrieved successfully", plans));
    }

    @GetMapping("/subscription")
    @Operation(summary = "Get active company subscription and seat quota")
    public ResponseEntity<ApiResponse<SubscriptionDto>> getCurrentSubscription() {
        SubscriptionDto sub = subscriptionService.getCurrentSubscription();
        return ResponseEntity.ok(ApiResponse.ok("Subscription retrieved successfully", sub));
    }

    @PostMapping("/subscription")
    @PreAuthorize("hasRole('COMPANY_ADMIN')")
    @Operation(summary = "Upgrade or change subscription plan")
    public ResponseEntity<ApiResponse<SubscriptionDto>> upgradeSubscription(@Valid @RequestBody SubscriptionDto request) {
        SubscriptionDto created = subscriptionService.createOrUpgradeSubscription(request);
        return ResponseEntity.ok(ApiResponse.ok("Subscription updated successfully", created));
    }

    @GetMapping("/subscription/history")
    @Operation(summary = "Get company subscription billing history")
    public ResponseEntity<ApiResponse<List<SubscriptionDto>>> getSubscriptionHistory() {
        List<SubscriptionDto> history = subscriptionService.getSubscriptionHistory();
        return ResponseEntity.ok(ApiResponse.ok("Subscription history retrieved successfully", history));
    }

    @GetMapping("/company/settings")
    @Operation(summary = "Get company workspace settings (currency, timezone, lead routing)")
    public ResponseEntity<ApiResponse<CompanySettingDto>> getCompanySettings() {
        CompanySettingDto settings = subscriptionService.getCompanySettings();
        return ResponseEntity.ok(ApiResponse.ok("Settings retrieved successfully", settings));
    }

    @PutMapping("/company/settings")
    @PreAuthorize("hasRole('COMPANY_ADMIN')")
    @Operation(summary = "Update company workspace settings (Company Admin only)")
    public ResponseEntity<ApiResponse<CompanySettingDto>> updateCompanySettings(@RequestBody CompanySettingDto request) {
        CompanySettingDto updated = subscriptionService.updateCompanySettings(request);
        return ResponseEntity.ok(ApiResponse.ok("Settings updated successfully", updated));
    }
}
