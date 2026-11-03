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
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionPlanRepository planRepository;
    private final CompanyRepository companyRepository;
    private final CompanySettingRepository settingRepository;
    private final SubscriptionRevenueService subscriptionRevenueService;
    private final TenantContext tenantContext;

    public SubscriptionService(
            SubscriptionRepository subscriptionRepository,
            SubscriptionPlanRepository planRepository,
            CompanyRepository companyRepository,
            CompanySettingRepository settingRepository,
            SubscriptionRevenueService subscriptionRevenueService,
            TenantContext tenantContext
    ) {
        this.subscriptionRepository = subscriptionRepository;
        this.planRepository = planRepository;
        this.companyRepository = companyRepository;
        this.settingRepository = settingRepository;
        this.subscriptionRevenueService = subscriptionRevenueService;
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
        sub.setAmount(CompanyService.cleanPrice(request.getAmount() != null ? request.getAmount() : "₹2,499"));
        sub.setStatus("Active");
        java.time.LocalDate startDate = java.time.LocalDate.now();
        java.time.format.DateTimeFormatter dtf = java.time.format.DateTimeFormatter.ofPattern("MMM dd, yyyy", java.util.Locale.ENGLISH);
        sub.setStartDate(startDate.format(dtf));

        // Calculate next renewal date based on billing cycle
        java.time.LocalDate renewal;
        if ("Annual".equalsIgnoreCase(sub.getBillingCycle())) {
            renewal = startDate.plusYears(1);
        } else if ("Quarterly".equalsIgnoreCase(sub.getBillingCycle())) {
            renewal = startDate.plusMonths(3);
        } else {
            renewal = startDate.plusMonths(1);
        }
        sub.setRenewalDate(renewal.format(dtf));
        sub.setAutoRenew(request.getAutoRenew() != null ? request.getAutoRenew() : true);

        // Update company profile accordingly and restore Active status upon successful payment/renewal
        company.setPlan(sub.getPlanName());
        company.setBillingCycle(sub.getBillingCycle());
        company.setPrice(CompanyService.cleanPrice(sub.getAmount()));
        company.setRenewalDate(sub.getRenewalDate());
        company.setStatus("Active");
        company.setIsActive(true);
        companyRepository.save(company);

        Subscription saved = subscriptionRepository.save(sub);
        return mapToSubscriptionDto(saved);
    }

    // Super Admin endpoints
    @Transactional(readOnly = true)
    public Page<SubscriptionDto> getAllCompanySubscriptions(Pageable pageable) {
        List<Subscription> subscriptions = subscriptionRepository.findAll();
        List<SubscriptionDto> dtos = new ArrayList<>();
        Set<String> coveredCompanyIds = new HashSet<>();

        long centralizedMrr = subscriptionRevenueService.calculateMonthlyRecurringRevenue();

        for (Subscription s : subscriptions) {
            SubscriptionDto dto = mapToSubscriptionDto(s);
            dto.setMonthlyRecurringRevenue(centralizedMrr);
            dtos.add(dto);
            if (s.getCompany() != null && s.getCompany().getId() != null) {
                coveredCompanyIds.add(s.getCompany().getId());
            }
        }

        // Include any companies that do not yet have an explicit subscription row as 'No subscription'
        List<Company> allCompanies = companyRepository.findAll();
        for (Company c : allCompanies) {
            if (!coveredCompanyIds.contains(c.getId())) {
                SubscriptionDto dto = new SubscriptionDto();
                dto.setId("no-sub-" + c.getId());
                dto.setCompanyId(c.getId());
                dto.setCompanyName(c.getName());
                dto.setCompanyStatus(c.getStatus());
                dto.setPlan("No subscription");
                dto.setBillingCycle("—");
                dto.setAmount("—");
                dto.setStatus("—");
                dto.setRenewalDate(c.getRenewalDate());
                dto.setAutoRenew(false);
                dto.setMonthlyRecurringRevenue(centralizedMrr);
                dtos.add(dto);
            }
        }

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), dtos.size());
        List<SubscriptionDto> pageContent = start > dtos.size() ? List.of() : dtos.subList(start, end);

        return new PageImpl<>(pageContent, pageable, dtos.size());
    }

    @Transactional(readOnly = true)
    public SubscriptionDto getSubscriptionById(String id) {
        Subscription sub = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found: " + id));
        return mapToSubscriptionDto(sub);
    }

    @Transactional
    public SubscriptionDto updateSubscription(String id, com.nexora.crm.dto.subscription.SubscriptionUpdateRequest request) {
        Subscription sub = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found: " + id));

        if (request.getPlan() != null && !request.getPlan().isBlank()) {
            sub.setPlanName(request.getPlan().trim());
        }
        if (request.getBillingCycle() != null && !request.getBillingCycle().isBlank()) {
            sub.setBillingCycle(request.getBillingCycle().trim());
        }
        if (request.getPrice() != null) {
            if (request.getPrice().compareTo(java.math.BigDecimal.ZERO) < 0) {
                throw new com.nexora.crm.exception.BusinessRuleException("Price must not be negative");
            }
            sub.setAmount(request.getPrice().stripTrailingZeros().toPlainString());
        }
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            sub.setStatus(request.getStatus().trim());
        }
        if (request.getRenewalDate() != null) {
            sub.setRenewalDate(request.getRenewalDate().trim());
        }
        if (request.getAutoRenew() != null) {
            sub.setAutoRenew(request.getAutoRenew());
        }

        Subscription updated = subscriptionRepository.save(sub);

        // Keep company profile in sync without overriding company account status if already suspended
        Company company = sub.getCompany();
        if (company != null) {
            if (request.getPlan() != null && !request.getPlan().isBlank()) {
                company.setPlan(request.getPlan().trim());
            }
            if (request.getBillingCycle() != null && !request.getBillingCycle().isBlank()) {
                company.setBillingCycle(request.getBillingCycle().trim());
            }
            if (request.getPrice() != null) {
                company.setPrice(request.getPrice().stripTrailingZeros().toPlainString());
            }
            if (request.getRenewalDate() != null) {
                company.setRenewalDate(request.getRenewalDate().trim());
            }
            companyRepository.save(company);
        }

        return mapToSubscriptionDto(updated);
    }

    @Transactional
    public void deleteSubscription(String id) {
        Subscription sub = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found: " + id));
        subscriptionRepository.delete(sub);
    }

    // ==========================================
    // Super Admin Plan Management CRUD
    // ==========================================
    @Transactional
    public SubscriptionPlanDto createPlan(SubscriptionPlanDto request) {
        if (request.getName() == null || request.getName().trim().isBlank()) {
            throw new com.nexora.crm.exception.BusinessRuleException("Plan name is required");
        }
        String cleanName = request.getName().trim();
        String planId = request.getId() != null && !request.getId().isBlank()
                ? request.getId().trim().toLowerCase().replaceAll("[^a-z0-9-]", "")
                : "plan-" + cleanName.toLowerCase().replaceAll("[^a-z0-9]", "");

        if (planRepository.existsById(planId)) {
            throw new com.nexora.crm.exception.DuplicateResourceException("Plan with ID '" + planId + "' already exists");
        }

        SubscriptionPlan plan = new SubscriptionPlan();
        plan.setId(planId);
        plan.setName(cleanName);
        plan.setTypeTag(request.getTypeTag() != null ? request.getTypeTag().trim() : "TIER");
        plan.setBadge(request.getBadge() != null ? request.getBadge().trim() : null);
        plan.setSubtitle(request.getSubtitle() != null ? request.getSubtitle().trim() : "");

        java.math.BigDecimal monthly = request.getMonthlyPrice() != null ? request.getMonthlyPrice() : java.math.BigDecimal.ZERO;
        plan.setMonthlyPrice(monthly);
        plan.setAnnualPrice(request.getAnnualPrice() != null ? request.getAnnualPrice() : monthly.multiply(new java.math.BigDecimal("12")));
        plan.setPriceDisplay("₹" + monthly.stripTrailingZeros().toPlainString());
        plan.setUserLimitText((request.getUserLimit() != null ? request.getUserLimit() : 20) + " Team Members");
        plan.setUserLimit(request.getUserLimit() != null ? request.getUserLimit() : 20);
        plan.setIsPopular(Boolean.TRUE.equals(request.getPopular()));
        plan.setBadgeColor(request.getBadgeColor() != null ? request.getBadgeColor() : "var(--tertiary)");

        if (request.getFeatures() != null && !request.getFeatures().isEmpty()) {
            plan.setFeatures(String.join("\n", request.getFeatures()));
        } else {
            plan.setFeatures("");
        }

        SubscriptionPlan saved = planRepository.save(plan);
        return mapToPlanDto(saved);
    }

    @Transactional
    public SubscriptionPlanDto updatePlan(String id, SubscriptionPlanDto request) {
        SubscriptionPlan plan = planRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found: " + id));

        if (request.getName() != null && !request.getName().trim().isBlank()) {
            plan.setName(request.getName().trim());
        }
        if (request.getTypeTag() != null) plan.setTypeTag(request.getTypeTag().trim());
        if (request.getBadge() != null) plan.setBadge(request.getBadge().trim());
        if (request.getSubtitle() != null) plan.setSubtitle(request.getSubtitle().trim());

        if (request.getMonthlyPrice() != null) {
            plan.setMonthlyPrice(request.getMonthlyPrice());
            plan.setPriceDisplay("₹" + request.getMonthlyPrice().stripTrailingZeros().toPlainString());
            if (request.getAnnualPrice() != null) {
                plan.setAnnualPrice(request.getAnnualPrice());
            } else {
                plan.setAnnualPrice(request.getMonthlyPrice().multiply(new java.math.BigDecimal("12")));
            }
        } else if (request.getAnnualPrice() != null) {
            plan.setAnnualPrice(request.getAnnualPrice());
        }

        if (request.getUserLimit() != null) {
            plan.setUserLimit(request.getUserLimit());
            plan.setUserLimitText(request.getUserLimit() + " Team Members");
        }
        if (request.getPopular() != null) plan.setIsPopular(request.getPopular());
        if (request.getBadgeColor() != null) plan.setBadgeColor(request.getBadgeColor());

        if (request.getFeatures() != null) {
            plan.setFeatures(String.join("\n", request.getFeatures()));
        }

        SubscriptionPlan updated = planRepository.save(plan);
        return mapToPlanDto(updated);
    }

    @Transactional
    public void deletePlan(String id) {
        SubscriptionPlan plan = planRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found: " + id));

        // Business Rule: Cannot delete a plan if any active companies or subscriptions currently use it
        long companyUsage = companyRepository.findAll().stream()
                .filter(c -> c.getPlan() != null && c.getPlan().equalsIgnoreCase(plan.getName()))
                .count();
        long subUsage = subscriptionRepository.findAll().stream()
                .filter(s -> s.getPlanName() != null && s.getPlanName().equalsIgnoreCase(plan.getName()))
                .count();

        if (companyUsage > 0 || subUsage > 0) {
            throw new com.nexora.crm.exception.BusinessRuleException(
                    "Cannot delete plan '" + plan.getName() + "': It is actively assigned to " +
                    (companyUsage + subUsage) + " organization(s) or subscription record(s)."
            );
        }

        planRepository.delete(plan);
    }

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
        dto.setCompanyStatus(s.getCompany() != null ? s.getCompany().getStatus() : null);
        dto.setPlan(s.getPlanName());
        dto.setBillingCycle(s.getBillingCycle());
        
        String cleaned = CompanyService.cleanPrice(s.getAmount());
        dto.setAmount(cleaned);
        
        // Extract numeric price decimal
        if (cleaned != null) {
            String digits = cleaned.replaceAll("[^0-9.]", "");
            if (!digits.isBlank()) {
                try {
                    dto.setPrice(new java.math.BigDecimal(digits));
                } catch (Exception ignored) {}
            }
        }
        
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
        if (p.getFeatures() != null && !p.getFeatures().isBlank()) {
            dto.setFeatures(Arrays.stream(p.getFeatures().split("[\n,]+"))
                    .map(String::trim)
                    .filter(f -> !f.isEmpty())
                    .toList());
        } else {
            dto.setFeatures(new ArrayList<>());
        }
        return dto;
    }
}
