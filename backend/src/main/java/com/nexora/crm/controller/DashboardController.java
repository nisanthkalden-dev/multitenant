package com.nexora.crm.controller;

import com.nexora.crm.dto.common.ApiResponse;
import com.nexora.crm.dto.dashboard.CompanyDashboardDto;
import com.nexora.crm.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@Tag(name = "Dashboard", description = "Role-based dashboards for Company Admin, Manager, and Employee")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/company/dashboard")
    @PreAuthorize("hasAnyRole('COMPANY_ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Company Admin executive dashboard with team metrics, revenue, and activities")
    public ResponseEntity<ApiResponse<CompanyDashboardDto>> getCompanyAdminDashboard() {
        CompanyDashboardDto dashboard = dashboardService.getCompanyAdminDashboard();
        return ResponseEntity.ok(ApiResponse.ok("Company Admin dashboard retrieved successfully", dashboard));
    }

    @GetMapping("/manager/dashboard")
    @PreAuthorize("hasAnyRole('MANAGER', 'COMPANY_ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Manager sales pipeline and team quota dashboard")
    public ResponseEntity<ApiResponse<CompanyDashboardDto>> getManagerDashboard() {
        CompanyDashboardDto dashboard = dashboardService.getManagerDashboard();
        return ResponseEntity.ok(ApiResponse.ok("Manager dashboard retrieved successfully", dashboard));
    }

    @GetMapping("/employee/dashboard")
    @Operation(summary = "Employee assigned workload, deals, and daily tasks dashboard")
    public ResponseEntity<ApiResponse<CompanyDashboardDto>> getEmployeeDashboard() {
        CompanyDashboardDto dashboard = dashboardService.getEmployeeDashboard();
        return ResponseEntity.ok(ApiResponse.ok("Employee dashboard retrieved successfully", dashboard));
    }
}
