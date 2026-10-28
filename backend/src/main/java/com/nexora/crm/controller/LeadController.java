package com.nexora.crm.controller;

import com.nexora.crm.dto.common.ApiResponse;
import com.nexora.crm.dto.common.PaginationMetadata;
import com.nexora.crm.dto.lead.LeadRequest;
import com.nexora.crm.dto.lead.LeadResponse;
import com.nexora.crm.service.LeadService;
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
@RequestMapping("/api/leads")
@Tag(name = "Lead Management", description = "Multi-tenant CRM commercial leads and pipeline")
public class LeadController {

    private final LeadService leadService;

    public LeadController(LeadService leadService) {
        this.leadService = leadService;
    }

    @GetMapping
    @Operation(summary = "Get list of leads with filtering, search, and pagination")
    public ResponseEntity<ApiResponse<List<LeadResponse>>> getLeads(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String stage,
            @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<LeadResponse> leadPage = leadService.getLeads(search, stage, pageable);
        PaginationMetadata meta = new PaginationMetadata(
                leadPage.getNumber(),
                leadPage.getSize(),
                leadPage.getTotalElements(),
                leadPage.getTotalPages(),
                leadPage.isLast()
        );
        return ResponseEntity.ok(ApiResponse.ok("Leads retrieved successfully", leadPage.getContent(), meta));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get lead by ID")
    public ResponseEntity<ApiResponse<LeadResponse>> getLeadById(@PathVariable String id) {
        LeadResponse res = leadService.getLeadById(id);
        return ResponseEntity.ok(ApiResponse.ok("Lead retrieved successfully", res));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('COMPANY_ADMIN', 'MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Create lead / deal")
    public ResponseEntity<ApiResponse<LeadResponse>> createLead(@Valid @RequestBody LeadRequest request) {
        LeadResponse created = leadService.createLead(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Lead created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('COMPANY_ADMIN', 'MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Update lead / deal")
    public ResponseEntity<ApiResponse<LeadResponse>> updateLead(@PathVariable String id, @RequestBody LeadRequest request) {
        LeadResponse updated = leadService.updateLead(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Lead updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('COMPANY_ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Delete lead")
    public ResponseEntity<ApiResponse<Void>> deleteLead(@PathVariable String id) {
        leadService.deleteLead(id);
        return ResponseEntity.ok(ApiResponse.ok("Lead deleted successfully", null));
    }
}
