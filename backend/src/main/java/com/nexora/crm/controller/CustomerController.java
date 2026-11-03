package com.nexora.crm.controller;

import com.nexora.crm.dto.common.ApiResponse;
import com.nexora.crm.dto.common.PaginationMetadata;
import com.nexora.crm.dto.customer.ContractPaymentSummaryDto;
import com.nexora.crm.dto.customer.CustomerPaymentDto;
import com.nexora.crm.dto.customer.CustomerPaymentRequest;
import com.nexora.crm.dto.customer.CustomerRequest;
import com.nexora.crm.dto.customer.CustomerResponse;
import com.nexora.crm.service.CustomerService;
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
@RequestMapping("/api/customers")
@Tag(name = "Customer Management", description = "Multi-tenant CRM customer accounts and contract payments")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    @Operation(summary = "Get list of customer accounts with filtering, search, and pagination")
    public ResponseEntity<ApiResponse<List<CustomerResponse>>> getCustomers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String tier,
            @RequestParam(defaultValue = "name,asc") String sort
    ) {
        String[] sortParts = sort.split(",");
        Sort sorting = Sort.by(sortParts.length > 1 && sortParts[1].equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortParts[0]);
        Pageable pageable = PageRequest.of(page, size, sorting);

        Page<CustomerResponse> customerPage = customerService.getCustomers(search, tier, pageable);
        PaginationMetadata meta = new PaginationMetadata(
                customerPage.getNumber(),
                customerPage.getSize(),
                customerPage.getTotalElements(),
                customerPage.getTotalPages(),
                customerPage.isLast()
        );
        return ResponseEntity.ok(ApiResponse.ok("Customers retrieved successfully", customerPage.getContent(), meta));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get customer by ID with contract payment financial summary")
    public ResponseEntity<ApiResponse<CustomerResponse>> getCustomerById(@PathVariable String id) {
        CustomerResponse res = customerService.getCustomerById(id);
        return ResponseEntity.ok(ApiResponse.ok("Customer retrieved successfully", res));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('COMPANY_ADMIN', 'MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Create customer account")
    public ResponseEntity<ApiResponse<CustomerResponse>> createCustomer(@Valid @RequestBody CustomerRequest request) {
        CustomerResponse created = customerService.createCustomer(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Customer created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('COMPANY_ADMIN', 'MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Update customer account")
    public ResponseEntity<ApiResponse<CustomerResponse>> updateCustomer(@PathVariable String id, @RequestBody CustomerRequest request) {
        CustomerResponse updated = customerService.updateCustomer(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Customer updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('COMPANY_ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Delete customer account")
    public ResponseEntity<ApiResponse<Void>> deleteCustomer(@PathVariable String id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.ok(ApiResponse.ok("Customer deleted successfully", null));
    }

    // =========================================================================
    // Contract Payment Tracking APIs
    // =========================================================================

    @GetMapping("/{id}/payment-summary")
    @PreAuthorize("hasAnyRole('COMPANY_ADMIN', 'MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Get contract payment summary (Total Contract Value, Total Paid, Remaining Balance)")
    public ResponseEntity<ApiResponse<ContractPaymentSummaryDto>> getPaymentSummary(@PathVariable String id) {
        ContractPaymentSummaryDto summary = customerService.getPaymentSummary(id);
        return ResponseEntity.ok(ApiResponse.ok("Payment summary retrieved successfully", summary));
    }

    @GetMapping("/{id}/payments")
    @PreAuthorize("hasAnyRole('COMPANY_ADMIN', 'MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Get customer payment history")
    public ResponseEntity<ApiResponse<List<CustomerPaymentDto>>> getPaymentHistory(@PathVariable String id) {
        List<CustomerPaymentDto> history = customerService.getPaymentHistory(id);
        return ResponseEntity.ok(ApiResponse.ok("Payment history retrieved successfully", history));
    }

    @PostMapping("/{id}/payments")
    @PreAuthorize("hasAnyRole('COMPANY_ADMIN', 'MANAGER', 'SUPER_ADMIN')")
    @Operation(summary = "Record a contract payment for customer")
    public ResponseEntity<ApiResponse<CustomerPaymentDto>> addPayment(
            @PathVariable String id,
            @Valid @RequestBody CustomerPaymentRequest request
    ) {
        CustomerPaymentDto payment = customerService.recordPayment(id, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Payment recorded successfully", payment));
    }
}
