package com.nexora.crm.controller;

import com.nexora.crm.dto.auth.UserSummaryDto;
import com.nexora.crm.dto.common.ApiResponse;
import com.nexora.crm.dto.common.PaginationMetadata;
import com.nexora.crm.dto.user.EmployeeDetailsDto;
import com.nexora.crm.dto.user.UserCreateRequest;
import com.nexora.crm.dto.user.UserUpdateRequest;
import com.nexora.crm.security.TenantContext;
import com.nexora.crm.service.UserService;
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
import java.util.Map;

@RestController
@RequestMapping("/api")
@Tag(name = "Employee & Team Management", description = "Multi-tenant workforce administration APIs")
public class CompanyUserController {

    private final UserService userService;
    private final TenantContext tenantContext;

    public CompanyUserController(UserService userService, TenantContext tenantContext) {
        this.userService = userService;
        this.tenantContext = tenantContext;
    }

    // =========================================================================
    // DEDICATED COMPANY-ADMIN EMPLOYEE APIS (/api/company-admin/employees)
    // =========================================================================

    @GetMapping("/company-admin/employees")
    @PreAuthorize("hasAnyRole('COMPANY_ADMIN', 'SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Get list of employees for authenticated company with filtering, search, pagination, and sorting")
    public ResponseEntity<ApiResponse<List<UserSummaryDto>>> getCompanyAdminEmployees(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String managerId,
            @RequestParam(defaultValue = "id,asc") String sort
    ) {
        String[] sortParts = sort.split(",");
        String sortField = sortParts[0].trim();
        if ("name".equalsIgnoreCase(sortField)) {
            sortField = "fullName";
        }
        Sort.Direction direction = (sortParts.length > 1 && sortParts[1].equalsIgnoreCase("desc"))
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField));
        Page<UserSummaryDto> pageResult = userService.searchCompanyEmployees(search, role, department, status, managerId, pageable);

        PaginationMetadata meta = new PaginationMetadata(
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements(),
                pageResult.getTotalPages(),
                pageResult.isLast()
        );
        return ResponseEntity.ok(ApiResponse.ok("Employees retrieved successfully", pageResult.getContent(), meta));
    }

    @GetMapping("/company-admin/employees/{id}")
    @PreAuthorize("hasAnyRole('COMPANY_ADMIN', 'SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Get comprehensive employee profile and assigned CRM relationships")
    public ResponseEntity<ApiResponse<EmployeeDetailsDto>> getEmployeeDetails(@PathVariable String id) {
        EmployeeDetailsDto details = userService.getEmployeeDetails(id);
        return ResponseEntity.ok(ApiResponse.ok("Employee details retrieved successfully", details));
    }

    @PostMapping("/company-admin/employees")
    @PreAuthorize("hasAnyRole('COMPANY_ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Add a new employee to the authenticated company")
    public ResponseEntity<ApiResponse<UserSummaryDto>> addEmployee(@Valid @RequestBody UserCreateRequest request) {
        String companyId = tenantContext.getCurrentCompanyId();
        UserSummaryDto created = userService.createCompanyUser(companyId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Employee created successfully", created));
    }

    @PutMapping("/company-admin/employees/{id}")
    @PreAuthorize("hasAnyRole('COMPANY_ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Edit employee information")
    public ResponseEntity<ApiResponse<UserSummaryDto>> updateEmployee(
            @PathVariable String id,
            @RequestBody UserUpdateRequest request
    ) {
        String companyId = tenantContext.getCurrentCompanyId();
        UserSummaryDto updated = userService.updateCompanyUser(companyId, id, request);
        return ResponseEntity.ok(ApiResponse.ok("Employee updated successfully", updated));
    }

    @PatchMapping("/company-admin/employees/{id}/status")
    @PreAuthorize("hasAnyRole('COMPANY_ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Activate or deactivate an employee")
    public ResponseEntity<ApiResponse<UserSummaryDto>> updateEmployeeStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body
    ) {
        String newStatus = body != null ? body.get("status") : "Active";
        UserSummaryDto updated = userService.updateEmployeeStatus(id, newStatus);
        return ResponseEntity.ok(ApiResponse.ok("Employee status updated successfully", updated));
    }

    // =========================================================================
    // LEGACY & SCOPED TENANT ENDPOINTS (/api/companies/{companyId}/users)
    // =========================================================================

    @GetMapping("/companies/{companyId}/users")
    @Operation(summary = "List users belonging to a company")
    public ResponseEntity<ApiResponse<List<UserSummaryDto>>> getCompanyUsers(
            @PathVariable String companyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());
        Page<UserSummaryDto> usersPage = userService.getCompanyUsers(companyId, search, role, pageable);
        PaginationMetadata meta = new PaginationMetadata(
                usersPage.getNumber(),
                usersPage.getSize(),
                usersPage.getTotalElements(),
                usersPage.getTotalPages(),
                usersPage.isLast()
        );
        return ResponseEntity.ok(ApiResponse.ok("Users retrieved successfully", usersPage.getContent(), meta));
    }

    @PostMapping("/companies/{companyId}/users")
    @PreAuthorize("hasAnyRole('COMPANY_ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Provision a new employee/user in company workspace")
    public ResponseEntity<ApiResponse<UserSummaryDto>> createCompanyUser(
            @PathVariable String companyId,
            @Valid @RequestBody UserCreateRequest request
    ) {
        UserSummaryDto created = userService.createCompanyUser(companyId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("User created successfully", created));
    }

    @GetMapping("/companies/{companyId}/users/{userId}")
    @Operation(summary = "Get user details")
    public ResponseEntity<ApiResponse<UserSummaryDto>> getCompanyUser(
            @PathVariable String companyId,
            @PathVariable String userId
    ) {
        UserSummaryDto user = userService.getCompanyUser(companyId, userId);
        return ResponseEntity.ok(ApiResponse.ok("User retrieved successfully", user));
    }

    @PutMapping("/companies/{companyId}/users/{userId}")
    @PreAuthorize("hasAnyRole('COMPANY_ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Update employee role, department, or profile")
    public ResponseEntity<ApiResponse<UserSummaryDto>> updateCompanyUser(
            @PathVariable String companyId,
            @PathVariable String userId,
            @RequestBody UserUpdateRequest request
    ) {
        UserSummaryDto updated = userService.updateCompanyUser(companyId, userId, request);
        return ResponseEntity.ok(ApiResponse.ok("User updated successfully", updated));
    }

    @DeleteMapping("/companies/{companyId}/users/{userId}")
    @PreAuthorize("hasAnyRole('COMPANY_ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Deactivate employee in organization")
    public ResponseEntity<ApiResponse<Void>> deleteCompanyUser(
            @PathVariable String companyId,
            @PathVariable String userId
    ) {
        userService.deleteCompanyUser(companyId, userId);
        return ResponseEntity.ok(ApiResponse.ok("User deactivated successfully", null));
    }
}
