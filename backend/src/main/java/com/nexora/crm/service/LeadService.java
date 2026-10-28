package com.nexora.crm.service;

import com.nexora.crm.dto.lead.LeadRequest;
import com.nexora.crm.dto.lead.LeadResponse;
import com.nexora.crm.entity.Company;
import com.nexora.crm.entity.Lead;
import com.nexora.crm.exception.ResourceNotFoundException;
import com.nexora.crm.repository.CompanyRepository;
import com.nexora.crm.repository.LeadRepository;
import com.nexora.crm.security.TenantContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LeadService {

    private final LeadRepository leadRepository;
    private final CompanyRepository companyRepository;
    private final TenantContext tenantContext;

    public LeadService(LeadRepository leadRepository, CompanyRepository companyRepository, TenantContext tenantContext) {
        this.leadRepository = leadRepository;
        this.companyRepository = companyRepository;
        this.tenantContext = tenantContext;
    }

    @Transactional(readOnly = true)
    public Page<LeadResponse> getLeads(String search, String stage, Pageable pageable) {
        String companyId = tenantContext.getCurrentCompanyId();
        String assignedToFilter = null;
        if (tenantContext.isEmployee()) {
            assignedToFilter = tenantContext.getCurrentUserId();
        }

        Page<Lead> page = leadRepository.searchLeads(companyId, assignedToFilter, stage, search, pageable);
        return page.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<LeadResponse> getAllLeadsList() {
        String companyId = tenantContext.getCurrentCompanyId();
        List<Lead> list = leadRepository.findByCompany_Id(companyId);
        if (tenantContext.isEmployee()) {
            String userId = tenantContext.getCurrentUserId();
            list = list.stream().filter(l -> userId.equalsIgnoreCase(l.getAssignedTo())).toList();
        }
        return list.stream().map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public LeadResponse getLeadById(String id) {
        String companyId = tenantContext.getCurrentCompanyId();
        Lead lead = leadRepository.findByIdAndCompany_Id(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found with id: " + id));

        if (tenantContext.isEmployee() && !tenantContext.getCurrentUserId().equalsIgnoreCase(lead.getAssignedTo())) {
            throw new ResourceNotFoundException("Lead not found or not assigned to you: " + id);
        }

        return mapToResponse(lead);
    }

    @Transactional
    public LeadResponse createLead(LeadRequest request) {
        String companyId = tenantContext.getCurrentCompanyId();
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + companyId));

        Lead lead = new Lead();
        lead.setId("LEAD-" + String.format("%03d", (int)(Math.random() * 899 + 100)));
        lead.setCompany(company);
        lead.setTitle(request.getTitle().trim());
        lead.setCompanyName(request.getCompanyName() != null ? request.getCompanyName() : request.getCompany());
        lead.setContactName(request.getContactName());
        lead.setEmail(request.getEmail());
        lead.setPhone(request.getPhone());
        lead.setEstimatedValue(request.getEstimatedValue());
        lead.setStage(request.getStage() != null ? request.getStage() : "Prospecting");
        lead.setPriority(request.getPriority() != null ? request.getPriority() : "Medium");
        lead.setSource(request.getSource());

        String assigned = request.getAssignedTo();
        if (assigned == null || assigned.isBlank()) {
            assigned = tenantContext.getCurrentUserId();
        }
        lead.setAssignedTo(assigned);
        lead.setManagerId(request.getManagerId());

        Lead saved = leadRepository.save(lead);
        return mapToResponse(saved);
    }

    @Transactional
    public LeadResponse updateLead(String id, LeadRequest request) {
        String companyId = tenantContext.getCurrentCompanyId();
        Lead lead = leadRepository.findByIdAndCompany_Id(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found with id: " + id));

        if (request.getTitle() != null) lead.setTitle(request.getTitle().trim());
        if (request.getCompanyName() != null) lead.setCompanyName(request.getCompanyName().trim());
        if (request.getCompany() != null) lead.setCompanyName(request.getCompany().trim());
        if (request.getContactName() != null) lead.setContactName(request.getContactName().trim());
        if (request.getEmail() != null) lead.setEmail(request.getEmail().trim());
        if (request.getPhone() != null) lead.setPhone(request.getPhone().trim());
        if (request.getEstimatedValue() != null) lead.setEstimatedValue(request.getEstimatedValue().trim());
        if (request.getStage() != null) lead.setStage(request.getStage().trim());
        if (request.getPriority() != null) lead.setPriority(request.getPriority().trim());
        if (request.getSource() != null) lead.setSource(request.getSource().trim());
        if (request.getAssignedTo() != null) lead.setAssignedTo(request.getAssignedTo().trim());
        if (request.getManagerId() != null) lead.setManagerId(request.getManagerId().trim());

        Lead updated = leadRepository.save(lead);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteLead(String id) {
        String companyId = tenantContext.getCurrentCompanyId();
        Lead lead = leadRepository.findByIdAndCompany_Id(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found with id: " + id));
        leadRepository.delete(lead);
    }

    private LeadResponse mapToResponse(Lead l) {
        LeadResponse res = new LeadResponse();
        res.setId(l.getId());
        res.setCompanyId(l.getCompanyId());
        res.setTitle(l.getTitle());
        res.setCompany(l.getCompanyName());
        res.setCompanyName(l.getCompanyName());
        res.setContactName(l.getContactName());
        res.setEmail(l.getEmail());
        res.setPhone(l.getPhone());
        res.setEstimatedValue(l.getEstimatedValue());
        res.setStage(l.getStage());
        res.setPriority(l.getPriority());
        res.setSource(l.getSource());
        res.setAssignedTo(l.getAssignedTo());
        res.setManagerId(l.getManagerId());
        res.setCreatedAt("Recently");
        return res;
    }
}
