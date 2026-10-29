package com.nexora.crm.service;

import com.nexora.crm.dto.company.CompanySettingDto;
import com.nexora.crm.dto.subscription.SubscriptionDto;
import com.nexora.crm.dto.subscription.SubscriptionPlanDto;
import com.nexora.crm.entity.Company;
import com.nexora.crm.entity.CompanySetting;
import com.nexora.crm.entity.Subscription;
import com.nexora.crm.entity.SubscriptionPlan;
import com.nexora.crm.exception.ResourceNotFoundException;
import com.nexora.crm.repository.CompanyRepository;
import com.nexora.crm.repository.CompanySettingRepository;
import com.nexora.crm.repository.SubscriptionPlanRepository;
import com.nexora.crm.repository.SubscriptionRepository;
import com.nexora.crm.security.TenantContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionPlanRepository planRepository;
    private final CompanyRepository companyRepository;
    private final CompanySettingRepository settingRepository;
    private final TenantContext tenantContext;

    public SubscriptionService(
            SubscriptionRepository subscriptionRepository,
            SubscriptionPlanRepository planRepository,
            CompanyRepository companyRepository,
            CompanySettingRepository settingRepository,
            TenantContext tenantContext
    ) {
        this.subscriptionRepository = subscriptionRepository;
        this.planRepository = planRepository;
        this.companyRepository = companyRepository;
        this.settingRepository = settingRepository;
        this.tenantContext = tenantContext;
    }

    @Transactional(readOnly = true)
    public List<SubscriptionPlanDto> getAvailablePlans() {
        return planRepository.findAll().stream().map(this::mapToPlanDto).toList();
    }

    @Transactional(readOnly = true)
    public SubscriptionDto getCurrentSubscription() {
        String companyId = tenantContext.getCurrentCompanyId();
        return subscriptionRepository.findTopByCompany_IdOrderByCreatedAtDesc(companyId)
                .map(this::mapToSubscriptionDto)
                .orElseGet(() -> {
                    // Fallback to company plan definition
                    Company c = companyRepository.findById(companyId)
                            .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + companyId));
                    SubscriptionDto dto = new SubscriptionDto();
                    dto.setCompanyId(c.getId());
                    dto.setCompanyName(c.getName());
                    dto.setPlan(c.getPlan());
                    dto.setBillingCycle(c.getBillingCycle());
                    dto.setAmount(c.getPrice());
                    dto.setStatus(c.getStatus());
                    dto.setRenewalDate(c.getRenewalDate());
                    dto.setAutoRenew(true);
                    return dto;
                });
    }

    @Transactional(readOnly = true)
    public List<SubscriptionDto> getSubscriptionHistory() {
        String companyId = tenantContext.getCurrentCompanyId();
        return subscriptionRepository.findByCompany_IdOrderByCreatedAtDesc(companyId).stream()
                .map(this::mapToSubscriptionDto)
                .toList();
    }

    @Transactional
    public SubscriptionDto createOrUpgradeSubscription(SubscriptionDto request) {
        String companyId = tenantContext.getCurrentCompanyId();
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + companyId));

        Subscription sub = new Subscription();
        sub.setId("sub-" + System.currentTimeMillis());
        sub.setCompany(company);
        sub.setPlanName(request.getPlan());
        sub.setBillingCycle(request.getBillingCycle() != null ? request.getBillingCycle() : "Monthly");
        sub.setAmount(request.getAmount() != null ? request.getAmount() : "₹2,499");
        sub.setStatus("Active");
        sub.setStartDate("Today");
        sub.setRenewalDate("Nov 24, 2026");
        sub.setAutoRenew(request.getAutoRenew() != null ? request.getAutoRenew() : true);

        // Update company profile accordingly
        company.setPlan(sub.getPlanName());
        company.setBillingCycle(sub.getBillingCycle());
        company.setPrice(sub.getAmount() + ("Annual".equalsIgnoreCase(sub.getBillingCycle()) ? " / yr" : " / mo"));
        companyRepository.save(company);

        Subscription saved = subscriptionRepository.save(sub);
        return mapToSubscriptionDto(saved);
    }

    // Super Admin endpoints
    @Transactional(readOnly = true)
    public Page<SubscriptionDto> getAllCompanySubscriptions(Pageable pageable) {
        return subscriptionRepository.findAll(pageable).map(this::mapToSubscriptionDto);
    }

    @Transactional(readOnly = true)
    public SubscriptionDto getSubscriptionById(String id) {
        Subscription sub = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found: " + id));
        return mapToSubscriptionDto(sub);
    }

    @Transactional
    public SubscriptionDto updateSubscription(String id, SubscriptionDto request) {
        Subscription sub = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found: " + id));

        if (request.getPlan() != null) sub.setPlanName(request.getPlan());
        if (request.getBillingCycle() != null) sub.setBillingCycle(request.getBillingCycle());
        if (request.getAmount() != null) sub.setAmount(request.getAmount());
        if (request.getStatus() != null) sub.setStatus(request.getStatus());
        if (request.getRenewalDate() != null) sub.setRenewalDate(request.getRenewalDate());
        if (request.getAutoRenew() != null) sub.setAutoRenew(request.getAutoRenew());

        Subscription updated = subscriptionRepository.save(sub);

        // Keep company profile in sync
        Company company = sub.getCompany();
        if (company != null) {
            if (request.getPlan() != null) company.setPlan(request.getPlan());
            if (request.getBillingCycle() != null) company.setBillingCycle(request.getBillingCycle());
            if (request.getAmount() != null) company.setPrice(request.getAmount());
            if (request.getStatus() != null) company.setStatus(request.getStatus());
            if (request.getRenewalDate() != null) company.setRenewalDate(request.getRenewalDate());
            companyRepository.save(company);
        }

        return mapToSubscriptionDto(updated);
    }

    // Company Settings
    @Transactional(readOnly = true)
    public CompanySettingDto getCompanySettings() {
        String companyId = tenantContext.getCurrentCompanyId();
        CompanySetting setting = settingRepository.findById(companyId)
                .orElseGet(() -> settingRepository.save(new CompanySetting(companyId)));

        CompanySettingDto dto = new CompanySettingDto();
        dto.setCompanyId(setting.getCompanyId());
        dto.setCurrency(setting.getCurrency());
        dto.setTimezone(setting.getTimezone());
        dto.setDateFormat(setting.getDateFormat());
        dto.setNotificationsEnabled(setting.getNotificationsEnabled());
        dto.setAutoAssignLeads(setting.getAutoAssignLeads());
        dto.setLeadRoutingRule(setting.getLeadRoutingRule());
        return dto;
    }

    @Transactional
    public CompanySettingDto updateCompanySettings(CompanySettingDto request) {
        String companyId = tenantContext.getCurrentCompanyId();
        CompanySetting setting = settingRepository.findById(companyId)
                .orElseGet(() -> new CompanySetting(companyId));

        if (request.getCurrency() != null) setting.setCurrency(request.getCurrency());
        if (request.getTimezone() != null) setting.setTimezone(request.getTimezone());
        if (request.getDateFormat() != null) setting.setDateFormat(request.getDateFormat());
        if (request.getNotificationsEnabled() != null) setting.setNotificationsEnabled(request.getNotificationsEnabled());
        if (request.getAutoAssignLeads() != null) setting.setAutoAssignLeads(request.getAutoAssignLeads());
        if (request.getLeadRoutingRule() != null) setting.setLeadRoutingRule(request.getLeadRoutingRule());

        CompanySetting updated = settingRepository.save(setting);

        CompanySettingDto dto = new CompanySettingDto();
        dto.setCompanyId(updated.getCompanyId());
        dto.setCurrency(updated.getCurrency());
        dto.setTimezone(updated.getTimezone());
        dto.setDateFormat(updated.getDateFormat());
        dto.setNotificationsEnabled(updated.getNotificationsEnabled());
        dto.setAutoAssignLeads(updated.getAutoAssignLeads());
        dto.setLeadRoutingRule(updated.getLeadRoutingRule());
        return dto;
    }

    private SubscriptionDto mapToSubscriptionDto(Subscription s) {
        SubscriptionDto dto = new SubscriptionDto();
        dto.setId(s.getId());
        dto.setCompanyId(s.getCompanyId());
        dto.setCompanyName(s.getCompanyName());
        dto.setPlan(s.getPlanName());
        dto.setBillingCycle(s.getBillingCycle());
        dto.setAmount(s.getAmount());
        dto.setStatus(s.getStatus());
        dto.setStartDate(s.getStartDate());
        dto.setRenewalDate(s.getRenewalDate());
        dto.setAutoRenew(s.getAutoRenew());
        return dto;
    }

    private SubscriptionPlanDto mapToPlanDto(SubscriptionPlan p) {
        SubscriptionPlanDto dto = new SubscriptionPlanDto();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setTypeTag(p.getTypeTag());
        dto.setBadge(p.getBadge());
        dto.setSubtitle(p.getSubtitle());
        dto.setMonthlyPrice(p.getMonthlyPrice());
        dto.setAnnualPrice(p.getAnnualPrice());
        dto.setPriceDisplay(p.getPriceDisplay());
        dto.setUserLimitText(p.getUserLimitText());
        dto.setUserLimit(p.getUserLimit());
        dto.setPopular(p.getIsPopular());
        dto.setBadgeColor(p.getBadgeColor());
        if (p.getFeatures() != null) {
            dto.setFeatures(Arrays.asList(p.getFeatures().split(",\\s*")));
        }
        return dto;
    }
}
