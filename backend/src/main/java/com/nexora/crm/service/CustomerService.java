package com.nexora.crm.service;

import com.nexora.crm.dto.customer.CustomerRequest;
import com.nexora.crm.dto.customer.CustomerResponse;
import com.nexora.crm.entity.Company;
import com.nexora.crm.entity.Customer;
import com.nexora.crm.exception.ResourceNotFoundException;
import com.nexora.crm.repository.CompanyRepository;
import com.nexora.crm.repository.CustomerRepository;
import com.nexora.crm.security.TenantContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CompanyRepository companyRepository;
    private final TenantContext tenantContext;

    public CustomerService(CustomerRepository customerRepository, CompanyRepository companyRepository, TenantContext tenantContext) {
        this.customerRepository = customerRepository;
        this.companyRepository = companyRepository;
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

        return mapToResponse(customer);
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

        Customer updated = customerRepository.save(customer);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteCustomer(String id) {
        String companyId = tenantContext.getCurrentCompanyId();
        Customer customer = customerRepository.findByIdAndCompany_Id(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        customerRepository.delete(customer);
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
        return res;
    }
}
