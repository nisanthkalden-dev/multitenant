package com.nexora.crm.controller;

import com.nexora.crm.dto.auth.AuthResponse;
import com.nexora.crm.dto.auth.AuthTokenResponse;
import com.nexora.crm.dto.auth.SuperAdminLoginRequest;
import com.nexora.crm.dto.common.ApiResponse;
import com.nexora.crm.dto.common.PaginationMetadata;
import com.nexora.crm.dto.company.CompanyRequest;
import com.nexora.crm.dto.company.CompanyResponse;
import com.nexora.crm.dto.dashboard.SuperAdminDashboardDto;
import com.nexora.crm.dto.subscription.SubscriptionDto;
import com.nexora.crm.entity.Company;
import com.nexora.crm.service.AuthService;
import com.nexora.crm.service.CompanyService;
import com.nexora.crm.service.DashboardService;
import com.nexora.crm.service.SubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/super-admin")
@Tag(name = "Super Admin", description = "Global multi-tenant platform management and stats")
public class SuperAdminController {

    private final AuthService authService;
    private final DashboardService dashboardService;
    private final CompanyService companyService;
    private final SubscriptionService subscriptionService;
    private final com.nexora.crm.service.PlatformSettingService platformSettingService;

    public SuperAdminController(
            AuthService authService,
            DashboardService dashboardService,
            CompanyService companyService,
            SubscriptionService subscriptionService,
            com.nexora.crm.service.PlatformSettingService platformSettingService
    ) {
        this.authService = authService;
        this.dashboardService = dashboardService;
        this.companyService = companyService;
        this.subscriptionService = subscriptionService;
        this.platformSettingService = platformSettingService;
    }

    /**
     * Dedicated Super Admin Login Endpoint
     * POST /api/super-admin/login (Publicly accessible)
     */
    @PostMapping("/login")
    @Operation(summary = "Dedicated Super Admin login returning Access and Refresh tokens")
    public ResponseEntity<AuthTokenResponse> superAdminLogin(@Valid @RequestBody SuperAdminLoginRequest request) {
        AuthTokenResponse response = authService.superAdminLogin(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Super Admin platform command metrics, MRR, and platform distribution")
    public ResponseEntity<ApiResponse<SuperAdminDashboardDto>> getDashboard(
            @RequestParam(required = false, defaultValue = "6M") String period
    ) {
        SuperAdminDashboardDto dashboard = dashboardService.getSuperAdminDashboard(period);
        return ResponseEntity.ok(ApiResponse.ok("Platform metrics retrieved successfully", dashboard));
    }


    @GetMapping("/companies")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Get paginated, searchable companies list")
    public ResponseEntity<ApiResponse<List<CompanyResponse>>> getCompanies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        String[] sortParts = sort.split(",");
        Sort sorting = Sort.by(sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, sortParts[0]);
        Pageable pageable = PageRequest.of(page, size, sorting);

        Page<CompanyResponse> companyPage = companyService.getCompanies(search, status, pageable);
        PaginationMetadata meta = new PaginationMetadata(
                companyPage.getNumber(),
                companyPage.getSize(),
                companyPage.getTotalElements(),
                companyPage.getTotalPages(),
                companyPage.isLast()
        );
        return ResponseEntity.ok(ApiResponse.ok("Companies retrieved successfully", companyPage.getContent(), meta));
    }

    @GetMapping("/companies/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Get company details by ID")
    public ResponseEntity<ApiResponse<CompanyResponse>> getCompanyById(@PathVariable String id) {
        CompanyResponse res = companyService.getCompanyById(id);
        return ResponseEntity.ok(ApiResponse.ok("Company details retrieved successfully", res));
    }

    @PostMapping("/companies")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Provision a new tenant company workspace")
    public ResponseEntity<ApiResponse<CompanyResponse>> createCompany(@Valid @RequestBody CompanyRequest request) {
        CompanyResponse created = companyService.createCompany(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Company provisioned successfully", created));
    }

    @PutMapping("/companies/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Update tenant company configuration")
    public ResponseEntity<ApiResponse<CompanyResponse>> updateCompany(@PathVariable String id, @RequestBody CompanyRequest request) {
        CompanyResponse updated = companyService.updateCompany(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Company updated successfully", updated));
    }

    @DeleteMapping("/companies/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Soft-delete or suspend tenant company")
    public ResponseEntity<ApiResponse<Void>> deleteCompany(@PathVariable String id) {
        companyService.deleteOrDeactivateCompany(id);
        return ResponseEntity.ok(ApiResponse.ok("Company deactivated successfully", null));
    }

    @GetMapping("/subscriptions")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "View all active/expired subscriptions across platform")
    public ResponseEntity<ApiResponse<List<SubscriptionDto>>> getSubscriptions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size
    ) {
        Page<SubscriptionDto> subs = subscriptionService.getAllCompanySubscriptions(PageRequest.of(page, size));
        PaginationMetadata meta = new PaginationMetadata(subs.getNumber(), subs.getSize(), subs.getTotalElements(), subs.getTotalPages(), subs.isLast());
        return ResponseEntity.ok(ApiResponse.ok("Subscriptions retrieved successfully", subs.getContent(), meta));
    }

    @GetMapping("/subscriptions/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Get subscription by ID")
    public ResponseEntity<ApiResponse<SubscriptionDto>> getSubscriptionById(@PathVariable String id) {
        SubscriptionDto dto = subscriptionService.getSubscriptionById(id);
        return ResponseEntity.ok(ApiResponse.ok("Subscription retrieved successfully", dto));
    }

    @PutMapping("/subscriptions/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Update company subscription terms")
    public ResponseEntity<ApiResponse<SubscriptionDto>> updateSubscription(
            @PathVariable String id,
            @Valid @RequestBody com.nexora.crm.dto.subscription.SubscriptionUpdateRequest request
    ) {
        SubscriptionDto updated = subscriptionService.updateSubscription(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Subscription updated successfully", updated));
    }

    @DeleteMapping("/subscriptions/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Delete subscription record")
    public ResponseEntity<ApiResponse<Void>> deleteSubscription(@PathVariable String id) {
        subscriptionService.deleteSubscription(id);
        return ResponseEntity.ok(ApiResponse.ok("Subscription deleted successfully", null));
    }

    // ==========================================
    // Super Admin Plan Management
    // ==========================================
    @GetMapping("/plans")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Get all subscription plans from MySQL")
    public ResponseEntity<ApiResponse<List<com.nexora.crm.dto.subscription.SubscriptionPlanDto>>> getPlans() {
        List<com.nexora.crm.dto.subscription.SubscriptionPlanDto> plans = subscriptionService.getAvailablePlans();
        return ResponseEntity.ok(ApiResponse.ok("Plans retrieved successfully", plans));
    }

    @PostMapping("/plans")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Create a new subscription plan in MySQL")
    public ResponseEntity<ApiResponse<com.nexora.crm.dto.subscription.SubscriptionPlanDto>> createPlan(
            @RequestBody com.nexora.crm.dto.subscription.SubscriptionPlanDto request
    ) {
        com.nexora.crm.dto.subscription.SubscriptionPlanDto created = subscriptionService.createPlan(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Plan created successfully", created));
    }

    @PutMapping("/plans/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Update an existing subscription plan in MySQL")
    public ResponseEntity<ApiResponse<com.nexora.crm.dto.subscription.SubscriptionPlanDto>> updatePlan(
            @PathVariable String id,
            @RequestBody com.nexora.crm.dto.subscription.SubscriptionPlanDto request
    ) {
        com.nexora.crm.dto.subscription.SubscriptionPlanDto updated = subscriptionService.updatePlan(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Plan updated successfully", updated));
    }

    @DeleteMapping("/plans/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Safely delete an unused plan from MySQL")
    public ResponseEntity<ApiResponse<Void>> deletePlan(@PathVariable String id) {
        subscriptionService.deletePlan(id);
        return ResponseEntity.ok(ApiResponse.ok("Plan deleted successfully", null));
    }

    // ==========================================
    // Super Admin General Platform Settings
    // ==========================================
    @GetMapping("/settings")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Get platform general settings from MySQL")
    public ResponseEntity<ApiResponse<com.nexora.crm.dto.settings.PlatformSettingsDto>> getPlatformSettings() {
        com.nexora.crm.dto.settings.PlatformSettingsDto settings = platformSettingService.getPlatformSettings();
        return ResponseEntity.ok(ApiResponse.ok("Platform settings retrieved successfully", settings));
    }

    @PutMapping("/settings")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Save and update platform general settings in MySQL")
    public ResponseEntity<ApiResponse<com.nexora.crm.dto.settings.PlatformSettingsDto>> updatePlatformSettings(
            @RequestBody com.nexora.crm.dto.settings.PlatformSettingsDto request
    ) {
        com.nexora.crm.dto.settings.PlatformSettingsDto updated = platformSettingService.updatePlatformSettings(request);
        return ResponseEntity.ok(ApiResponse.ok("Platform settings saved successfully to MySQL", updated));
    }

    @DeleteMapping("/settings/logo")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Remove platform brand logo from MySQL")
    public ResponseEntity<ApiResponse<com.nexora.crm.dto.settings.PlatformSettingsDto>> removePlatformLogo() {
        com.nexora.crm.dto.settings.PlatformSettingsDto updated = platformSettingService.removeLogo();
        return ResponseEntity.ok(ApiResponse.ok("Platform brand logo removed successfully from MySQL", updated));
    }
}
