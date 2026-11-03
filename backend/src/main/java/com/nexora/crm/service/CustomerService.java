package com.nexora.crm.service;

import com.nexora.crm.dto.customer.ContractPaymentSummaryDto;
import com.nexora.crm.dto.customer.CustomerPaymentDto;
import com.nexora.crm.dto.customer.CustomerPaymentRequest;
import com.nexora.crm.dto.customer.CustomerRequest;
import com.nexora.crm.dto.customer.CustomerResponse;
import com.nexora.crm.entity.Activity;
import com.nexora.crm.entity.Company;
import com.nexora.crm.entity.Customer;
import com.nexora.crm.entity.CustomerPayment;
import com.nexora.crm.exception.BusinessRuleException;
import com.nexora.crm.exception.ResourceNotFoundException;
import com.nexora.crm.repository.ActivityRepository;
import com.nexora.crm.repository.CompanyRepository;
import com.nexora.crm.repository.CustomerPaymentRepository;
import com.nexora.crm.repository.CustomerRepository;
import com.nexora.crm.security.CustomUserDetails;
import com.nexora.crm.security.TenantContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.DecimalFormat;
import java.time.LocalDate;
import java.util.List;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerPaymentRepository customerPaymentRepository;
    private final CompanyRepository companyRepository;
    private final ActivityRepository activityRepository;
    private final TenantContext tenantContext;

    public CustomerService(CustomerRepository customerRepository,
                           CustomerPaymentRepository customerPaymentRepository,
                           CompanyRepository companyRepository,
                           ActivityRepository activityRepository,
                           TenantContext tenantContext) {
        this.customerRepository = customerRepository;
        this.customerPaymentRepository = customerPaymentRepository;
        this.companyRepository = companyRepository;
        this.activityRepository = activityRepository;
        this.tenantContext = tenantContext;
    }

    @Transactional(readOnly = true)
    public Page<CustomerResponse> getCustomers(String search, String tier, Pageable pageable) {
        String companyId = tenantContext.getCurrentCompanyId();
        // Role check: Employee sees only assigned customers; CompanyAdmin & Manager see company customers
        String assignedToFilter = null;
        if (tenantContext.isEmployee()) {
            assignedToFilter = tenantContext.getCurrentUserId();
        }

        Page<Customer> page = customerRepository.searchCustomers(companyId, assignedToFilter, tier, search, pageable);
        return page.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<CustomerResponse> getAllCustomersList() {
        String companyId = tenantContext.getCurrentCompanyId();
        List<Customer> list = customerRepository.findByCompany_Id(companyId);
        if (tenantContext.isEmployee()) {
            String userId = tenantContext.getCurrentUserId();
            list = list.stream().filter(c -> userId.equalsIgnoreCase(c.getAssignedTo())).toList();
        }
        return list.stream().map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public CustomerResponse getCustomerById(String id) {
        String companyId = tenantContext.getCurrentCompanyId();
        Customer customer = customerRepository.findByIdAndCompany_Id(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));

        // Employee access check
        if (tenantContext.isEmployee() && !tenantContext.getCurrentUserId().equalsIgnoreCase(customer.getAssignedTo())) {
            throw new ResourceNotFoundException("Customer not found or not assigned to you: " + id);
        }

        CustomerResponse response = mapToResponse(customer);
        populateFinancialSummary(customer, response);

        // Include recent 5 payments in details response
        List<CustomerPayment> payments = customerPaymentRepository.findByCustomer_IdAndCompany_Id(
                id, companyId, Sort.by(Sort.Direction.DESC, "paymentDate", "createdAt")
        );
        response.setRecentPayments(payments.stream().limit(5).map(this::mapToPaymentDto).toList());

        return response;
    }

    @Transactional
    public CustomerResponse createCustomer(CustomerRequest request) {
        String companyId = tenantContext.getCurrentCompanyId();
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + companyId));

        Customer customer = new Customer();
        customer.setId("CUST-" + String.format("%03d", (int)(Math.random() * 899 + 100)));
        customer.setCompany(company);
        customer.setName(request.getName().trim());
        customer.setContactPerson(request.getContactPerson());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setIndustry(request.getIndustry());
        customer.setStatus(request.getStatus() != null ? request.getStatus() : "Active");
        customer.setTier(request.getTier() != null ? request.getTier() : "Standard");
        customer.setContractValue(request.getContractValue());
        customer.setAddress(request.getAddress());
        customer.setContractStartDate(request.getContractStartDate());
        customer.setContractEndDate(request.getContractEndDate());

        String assigned = request.getAssignedTo();
        if (assigned == null || assigned.isBlank()) {
            assigned = tenantContext.getCurrentUserId();
        }
        customer.setAssignedTo(assigned);
        customer.setManagerId(request.getManagerId());
        customer.setLastContact("Just now");

        Customer saved = customerRepository.save(customer);
        return mapToResponse(saved);
    }

    @Transactional
    public CustomerResponse updateCustomer(String id, CustomerRequest request) {
        String companyId = tenantContext.getCurrentCompanyId();
        Customer customer = customerRepository.findByIdAndCompany_Id(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));

        if (request.getName() != null) customer.setName(request.getName().trim());
        if (request.getContactPerson() != null) customer.setContactPerson(request.getContactPerson().trim());
        if (request.getEmail() != null) customer.setEmail(request.getEmail().trim());
        if (request.getPhone() != null) customer.setPhone(request.getPhone().trim());
        if (request.getIndustry() != null) customer.setIndustry(request.getIndustry().trim());
        if (request.getStatus() != null) customer.setStatus(request.getStatus().trim());
        if (request.getTier() != null) customer.setTier(request.getTier().trim());
        if (request.getContractValue() != null) customer.setContractValue(request.getContractValue().trim());
        if (request.getAssignedTo() != null) customer.setAssignedTo(request.getAssignedTo().trim());
        if (request.getManagerId() != null) customer.setManagerId(request.getManagerId().trim());
        if (request.getLastContact() != null) customer.setLastContact(request.getLastContact().trim());
        if (request.getAddress() != null) customer.setAddress(request.getAddress().trim());
        if (request.getContractStartDate() != null) customer.setContractStartDate(request.getContractStartDate().trim());
        if (request.getContractEndDate() != null) customer.setContractEndDate(request.getContractEndDate().trim());

        Customer updated = customerRepository.save(customer);
        CustomerResponse res = mapToResponse(updated);
        populateFinancialSummary(updated, res);
        return res;
    }

    @Transactional
    public void deleteCustomer(String id) {
        String companyId = tenantContext.getCurrentCompanyId();
        Customer customer = customerRepository.findByIdAndCompany_Id(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        customerRepository.delete(customer);
    }

    // =========================================================================
    // Contract Payment Tracking & Calculation Methods
    // =========================================================================

    @Transactional(readOnly = true)
    public ContractPaymentSummaryDto getPaymentSummary(String customerId) {
        String companyId = tenantContext.getCurrentCompanyId();
        Customer customer = customerRepository.findByIdAndCompany_Id(customerId, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));

        BigDecimal contractTotal = parseContractValue(customer.getContractValue());
        BigDecimal totalPaid = customerPaymentRepository.sumAmountByCustomerAndCompany(customerId, companyId);
        if (totalPaid == null) totalPaid = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal remaining = contractTotal.subtract(totalPaid);
        if (remaining.compareTo(BigDecimal.ZERO) < 0) remaining = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        long count = customerPaymentRepository.countByCustomer_IdAndCompany_Id(customerId, companyId);

        ContractPaymentSummaryDto summary = new ContractPaymentSummaryDto();
        summary.setCustomerId(customer.getId());
        summary.setCustomerName(customer.getName());
        summary.setTotalContractAmount(contractTotal);
        summary.setTotalAmountPaid(totalPaid);
        summary.setRemainingBalance(remaining);
        summary.setFormattedContractValue(formatCurrency(contractTotal));
        summary.setFormattedAmountPaid(formatCurrency(totalPaid));
        summary.setFormattedRemainingBalance(formatCurrency(remaining));
        summary.setPaymentCount((int) count);
        return summary;
    }

    @Transactional(readOnly = true)
    public List<CustomerPaymentDto> getPaymentHistory(String customerId) {
        String companyId = tenantContext.getCurrentCompanyId();
        // Tenant isolation: verify customer belongs to company
        if (!customerRepository.findByIdAndCompany_Id(customerId, companyId).isPresent()) {
            throw new ResourceNotFoundException("Customer not found with id: " + customerId);
        }

        List<CustomerPayment> list = customerPaymentRepository.findByCustomer_IdAndCompany_Id(
                customerId, companyId, Sort.by(Sort.Direction.DESC, "paymentDate", "createdAt")
        );
        return list.stream().map(this::mapToPaymentDto).toList();
    }

    @Transactional
    public CustomerPaymentDto recordPayment(String customerId, CustomerPaymentRequest request) {
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessRuleException("Payment amount must be greater than zero.");
        }

        String companyId = tenantContext.getCurrentCompanyId();
        Customer customer = customerRepository.findByIdAndCompany_Id(customerId, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));

        Company company = customer.getCompany();

        BigDecimal contractTotal = parseContractValue(customer.getContractValue());
        BigDecimal totalPaid = customerPaymentRepository.sumAmountByCustomerAndCompany(customerId, companyId);
        if (totalPaid == null) totalPaid = BigDecimal.ZERO;
        BigDecimal remaining = contractTotal.subtract(totalPaid);

        // Reject payments exceeding remaining contract balance
        if (contractTotal.compareTo(BigDecimal.ZERO) > 0 && request.getAmount().compareTo(remaining) > 0) {
            throw new BusinessRuleException(
                    String.format("Payment amount (₹%s) exceeds the remaining contract balance of ₹%s.",
                            request.getAmount().toPlainString(), remaining.toPlainString())
            );
        }

        CustomerPayment payment = new CustomerPayment();
        payment.setId("PAY-" + System.currentTimeMillis());
        payment.setPaymentReference("REF-" + (int)(Math.random() * 89999 + 10000));
        payment.setCustomer(customer);
        payment.setCompany(company);
        payment.setAmount(request.getAmount().setScale(2, RoundingMode.HALF_UP));
        payment.setPaymentDate(request.getPaymentDate() != null ? request.getPaymentDate() : LocalDate.now());
        payment.setPaymentMethod(request.getPaymentMethod().trim());
        payment.setTransactionId(request.getTransactionId() != null ? request.getTransactionId().trim() : null);
        payment.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);

        CustomUserDetails userDetails = tenantContext.getCurrentUserDetails();
        payment.setCreatedBy(userDetails != null ? userDetails.getUsername() : "system");

        CustomerPayment saved = customerPaymentRepository.save(payment);

        // Also record an audit activity log for this company
        try {
            Activity act = new Activity();
            act.setId("ACT-" + System.currentTimeMillis());
            act.setCompany(company);
            act.setUserId(userDetails != null ? userDetails.getUsername() : "system");
            act.setUserName(userDetails != null ? userDetails.getFullName() : "Administrator");
            act.setUserRole(userDetails != null && userDetails.getRole() != null ? userDetails.getRole().name() : "COMPANY_ADMIN");
            act.setAction(String.format("Recorded payment of %s for customer %s (%s)",
                    formatCurrency(saved.getAmount()), customer.getName(), customer.getId()));
            act.setTarget(customer.getName());
            act.setActivityType("PAYMENT");
            activityRepository.save(act);
        } catch (Exception ignored) {
            // Non-critical audit logging failure should not abort payment transaction
        }

        return mapToPaymentDto(saved);
    }

    // =========================================================================
    // Helper mapping and formatting
    // =========================================================================

    private void populateFinancialSummary(Customer c, CustomerResponse res) {
        BigDecimal contractTotal = parseContractValue(c.getContractValue());
        BigDecimal totalPaid = customerPaymentRepository.sumAmountByCustomerAndCompany(c.getId(), c.getCompanyId());
        if (totalPaid == null) totalPaid = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal remaining = contractTotal.subtract(totalPaid);
        if (remaining.compareTo(BigDecimal.ZERO) < 0) remaining = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        res.setTotalContractAmount(contractTotal);
        res.setTotalAmountPaid(totalPaid);
        res.setRemainingBalance(remaining);
        res.setFormattedContractValue(formatCurrency(contractTotal));
        res.setFormattedAmountPaid(formatCurrency(totalPaid));
        res.setFormattedRemainingBalance(formatCurrency(remaining));
    }

    public static BigDecimal parseContractValue(String valueStr) {
        if (valueStr == null || valueStr.isBlank() || "—".equals(valueStr.trim())) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        String clean = valueStr.replaceAll("[^0-9.]", "").trim();
        if (clean.isEmpty()) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        try {
            return new BigDecimal(clean).setScale(2, RoundingMode.HALF_UP);
        } catch (NumberFormatException e) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
    }

    public static String formatCurrency(BigDecimal amount) {
        if (amount == null) return "₹0";
        long val = amount.setScale(0, RoundingMode.HALF_UP).longValue();
        return "₹" + formatIndianNumber(val);
    }

    private static String formatIndianNumber(long n) {
        if (n < 0) return "-" + formatIndianNumber(-n);
        if (n < 1000) return String.valueOf(n);
        long lastThree = n % 1000;
        long rest = n / 1000;
        java.text.DecimalFormat dfRest = new java.text.DecimalFormat("#,##");
        java.text.DecimalFormat dfLast = new java.text.DecimalFormat("000");
        return dfRest.format(rest) + "," + dfLast.format(lastThree);
    }

    private CustomerPaymentDto mapToPaymentDto(CustomerPayment p) {
        CustomerPaymentDto dto = new CustomerPaymentDto();
        dto.setId(p.getId());
        dto.setPaymentReference(p.getPaymentReference());
        dto.setCustomerId(p.getCustomer() != null ? p.getCustomer().getId() : null);
        dto.setCompanyId(p.getCompany() != null ? p.getCompany().getId() : null);
        dto.setAmount(p.getAmount());
        dto.setFormattedAmount(formatCurrency(p.getAmount()));
        dto.setPaymentDate(p.getPaymentDate());
        dto.setPaymentMethod(p.getPaymentMethod());
        dto.setTransactionId(p.getTransactionId());
        dto.setNotes(p.getNotes());
        dto.setCreatedBy(p.getCreatedBy());
        dto.setCreatedAt(p.getCreatedAt());
        return dto;
    }

    private CustomerResponse mapToResponse(Customer c) {
        CustomerResponse res = new CustomerResponse();
        res.setId(c.getId());
        res.setCompanyId(c.getCompanyId());
        res.setName(c.getName());
        res.setContactPerson(c.getContactPerson());
        res.setEmail(c.getEmail());
        res.setPhone(c.getPhone());
        res.setIndustry(c.getIndustry());
        res.setStatus(c.getStatus());
        res.setTier(c.getTier());
        res.setContractValue(c.getContractValue());
        res.setValue(c.getContractValue());
        res.setAssignedTo(c.getAssignedTo());
        res.setManagerId(c.getManagerId());
        res.setLastContact(c.getLastContact());
        res.setAddress(c.getAddress());
        res.setContractStartDate(c.getContractStartDate());
        res.setContractEndDate(c.getContractEndDate());
        return res;
    }
}
