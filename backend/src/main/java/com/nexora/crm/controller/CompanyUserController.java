package com.nexora.crm.controller;

import com.nexora.crm.dto.auth.UserSummaryDto;
import com.nexora.crm.dto.common.ApiResponse;
import com.nexora.crm.dto.common.PaginationMetadata;
import com.nexora.crm.dto.user.UserCreateRequest;
import com.nexora.crm.dto.user.UserUpdateRequest;
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

@RestController
@RequestMapping("/api/companies/{companyId}/users")
@Tag(name = "Company Users", description = "Workforce and team member management per tenant")
public class CompanyUserController {

    private final UserService userService;

    public CompanyUserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
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

    @PostMapping
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

    @GetMapping("/{userId}")
    @Operation(summary = "Get user details")
    public ResponseEntity<ApiResponse<UserSummaryDto>> getCompanyUser(
            @PathVariable String companyId,
            @PathVariable String userId
    ) {
        UserSummaryDto user = userService.getCompanyUser(companyId, userId);
        return ResponseEntity.ok(ApiResponse.ok("User retrieved successfully", user));
    }

    @PutMapping("/{userId}")
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

    @DeleteMapping("/{userId}")
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
