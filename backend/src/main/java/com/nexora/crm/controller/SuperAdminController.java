package com.nexora.crm.controller;

import com.nexora.crm.dto.common.ApiResponse;
import com.nexora.crm.dto.common.PaginationMetadata;
import com.nexora.crm.dto.company.CompanyRequest;
import com.nexora.crm.dto.company.CompanyResponse;
import com.nexora.crm.dto.dashboard.SuperAdminDashboardDto;
import com.nexora.crm.dto.subscription.SubscriptionDto;
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
@PreAuthorize("hasRole('SUPER_ADMIN')")
@Tag(name = "Super Admin", description = "Global multi-tenant platform management and stats")
public class SuperAdminController {

    private final DashboardService dashboardService;
    private final CompanyService companyService;
    private final SubscriptionService subscriptionService;

    public SuperAdminController(
            DashboardService dashboardService,
            CompanyService companyService,
            SubscriptionService subscriptionService
    ) {
        this.dashboardService = dashboardService;
        this.companyService = companyService;
        this.subscriptionService = subscriptionService;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Super Admin platform command metrics, MRR, and platform distribution")
    public ResponseEntity<ApiResponse<SuperAdminDashboardDto>> getDashboard() {
        SuperAdminDashboardDto dashboard = dashboardService.getSuperAdminDashboard();
        return ResponseEntity.ok(ApiResponse.ok("Platform metrics retrieved successfully", dashboard));
    }

    @GetMapping("/companies")
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
    @Operation(summary = "Get company details by ID")
    public ResponseEntity<ApiResponse<CompanyResponse>> getCompanyById(@PathVariable String id) {
        CompanyResponse res = companyService.getCompanyById(id);
        return ResponseEntity.ok(ApiResponse.ok("Company details retrieved successfully", res));
    }

    @PostMapping("/companies")
    @Operation(summary = "Provision a new tenant company workspace")
    public ResponseEntity<ApiResponse<CompanyResponse>> createCompany(@Valid @RequestBody CompanyRequest request) {
        CompanyResponse created = companyService.createCompany(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Company provisioned successfully", created));
    }

    @PutMapping("/companies/{id}")
    @Operation(summary = "Update tenant company configuration")
    public ResponseEntity<ApiResponse<CompanyResponse>> updateCompany(@PathVariable String id, @RequestBody CompanyRequest request) {
        CompanyResponse updated = companyService.updateCompany(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Company updated successfully", updated));
    }

    @DeleteMapping("/companies/{id}")
    @Operation(summary = "Soft-delete or suspend tenant company")
    public ResponseEntity<ApiResponse<Void>> deleteCompany(@PathVariable String id) {
        companyService.deleteOrDeactivateCompany(id);
        return ResponseEntity.ok(ApiResponse.ok("Company deactivated successfully", null));
    }

    @GetMapping("/subscriptions")
    @Operation(summary = "View all active/expired subscriptions across platform")
    public ResponseEntity<ApiResponse<List<SubscriptionDto>>> getSubscriptions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<SubscriptionDto> subs = subscriptionService.getAllCompanySubscriptions(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        PaginationMetadata meta = new PaginationMetadata(subs.getNumber(), subs.getSize(), subs.getTotalElements(), subs.getTotalPages(), subs.isLast());
        return ResponseEntity.ok(ApiResponse.ok("Subscriptions retrieved successfully", subs.getContent(), meta));
    }

    @GetMapping("/subscriptions/{id}")
    @Operation(summary = "Get subscription by ID")
    public ResponseEntity<ApiResponse<SubscriptionDto>> getSubscriptionById(@PathVariable String id) {
        SubscriptionDto dto = subscriptionService.getSubscriptionById(id);
        return ResponseEntity.ok(ApiResponse.ok("Subscription retrieved successfully", dto));
    }

    @PutMapping("/subscriptions/{id}")
    @Operation(summary = "Update company subscription terms")
    public ResponseEntity<ApiResponse<SubscriptionDto>> updateSubscription(@PathVariable String id, @RequestBody SubscriptionDto request) {
        SubscriptionDto updated = subscriptionService.updateSubscription(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Subscription updated successfully", updated));
    }
}
