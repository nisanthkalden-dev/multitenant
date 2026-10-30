package com.nexora.crm.service;

import com.nexora.crm.dto.company.CompanyRequest;
import com.nexora.crm.dto.company.CompanyResponse;
import com.nexora.crm.entity.*;
import com.nexora.crm.exception.DuplicateResourceException;
import com.nexora.crm.exception.ResourceNotFoundException;
import com.nexora.crm.repository.*;
import com.nexora.crm.security.TenantContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final LeadRepository leadRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final ActivityRepository activityRepository;
    private final CompanySettingRepository companySettingRepository;
    private final PasswordEncoder passwordEncoder;
    private final TenantContext tenantContext;

    public CompanyService(
            CompanyRepository companyRepository,
            UserRepository userRepository,
            CustomerRepository customerRepository,
            LeadRepository leadRepository,
            SubscriptionRepository subscriptionRepository,
            SubscriptionPlanRepository subscriptionPlanRepository,
            ActivityRepository activityRepository,
            CompanySettingRepository companySettingRepository,
            PasswordEncoder passwordEncoder,
            TenantContext tenantContext
    ) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.leadRepository = leadRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.subscriptionPlanRepository = subscriptionPlanRepository;
        this.activityRepository = activityRepository;
        this.companySettingRepository = companySettingRepository;
        this.passwordEncoder = passwordEncoder;
        this.tenantContext = tenantContext;
    }

    @Transactional(readOnly = true)
    public Page<CompanyResponse> getCompanies(String search, String status, Pageable pageable) {
        Page<Company> page = companyRepository.searchCompanies(search, status, pageable);
        return page.map(this::mapToResponse);
    }


    @Transactional(readOnly = true)
    public CompanyResponse getCompanyById(String companyId) {
        tenantContext.validateTenantAccess(companyId);
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + companyId));
        return mapToResponse(company);
    }

    @Transactional
    public CompanyResponse createCompany(CompanyRequest request) {
        if (companyRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new DuplicateResourceException("Company with name '" + request.getName().trim() + "' already exists.");
        }

        String companyEmail = request.getEmail().trim().toLowerCase();
        if (companyRepository.existsByEmailIgnoreCase(companyEmail)) {
            throw new DuplicateResourceException("Company with email '" + companyEmail + "' already exists.");
        }

        String adminEmail = (request.getAdminEmail() != null && !request.getAdminEmail().isBlank())
                ? request.getAdminEmail().trim().toLowerCase()
                : companyEmail;
        if (userRepository.existsByEmailIgnoreCase(adminEmail)) {
            throw new DuplicateResourceException("Company Administrator email '" + adminEmail + "' already exists. Please choose a different email.");
        }

        // Generate safe unique company ID (e.g. COMP002, COMP003...)
        long count = companyRepository.count() + 1;
        String companyId = "COMP" + String.format("%03d", count);
        while (companyRepository.existsByIdIgnoreCase(companyId)) {
            count++;
            companyId = "COMP" + String.format("%03d", count);
        }

        Company company = new Company();
        company.setId(companyId);
        company.setName(request.getName().trim());
        company.setEmail(companyEmail);
        company.setPhone(request.getPhone() != null ? request.getPhone().trim() : "");
        company.setAddress(request.getAddress());
        String planName = request.getPlan() != null ? request.getPlan().trim() : "Growth";
        company.setPlan(planName);
        company.setBillingCycle(request.getBillingCycle() != null ? request.getBillingCycle() : "Monthly");
        
        // Derive user limit and default price from actual plan in database
        Optional<SubscriptionPlan> matchedPlan = subscriptionPlanRepository.findAll().stream()
                .filter(p -> p.getName() != null && p.getName().equalsIgnoreCase(planName))
                .findFirst();

        if (matchedPlan.isPresent()) {
            SubscriptionPlan planEntity = matchedPlan.get();
            company.setUserLimit(request.getUserLimit() != null && request.getUserLimit() > 0 ? request.getUserLimit() : planEntity.getUserLimit());
            if (request.getPrice() != null && !request.getPrice().isBlank()) {
                company.setPrice(cleanPrice(request.getPrice()));
            } else {
                company.setPrice("₹" + planEntity.getMonthlyPrice().stripTrailingZeros().toPlainString());
            }
        } else {
            company.setUserLimit(request.getUserLimit() != null ? request.getUserLimit() : 20);
            company.setPrice(cleanPrice(request.getPrice()));
        }
        String initialStatus = request.getStatus() != null ? request.getStatus() : "Active";
        company.setStatus(initialStatus);
        company.setIsActive("Active".equalsIgnoreCase(initialStatus));

        String domainClean = request.getName().toLowerCase().replaceAll("[^a-z0-9]", "");
        if (domainClean.isBlank()) {
            domainClean = "company" + System.currentTimeMillis();
        }
        company.setWorkspace(domainClean + ".nexora.app");
        company.setDomain(request.getDomain() != null ? request.getDomain() : domainClean + ".com");

        String initials = "";
        for (String w : request.getName().trim().split("\\s+")) {
            if (!w.isEmpty()) initials += w.charAt(0);
            if (initials.length() >= 2) break;
        }
        if (initials.isBlank()) initials = "CO";
        company.setLogo(initials.toUpperCase());
        company.setLogoColor("var(--tertiary)");
        company.setRenewalDate("Nov 24, 2026");

        Company savedCompany = companyRepository.save(company);

        // Provision Company Setting
        CompanySetting setting = new CompanySetting(savedCompany.getId());
        companySettingRepository.save(setting);

        // Provision initial Subscription
        Subscription sub = new Subscription();
        sub.setId("sub-" + System.currentTimeMillis());
        sub.setCompany(savedCompany);
        sub.setPlanName(savedCompany.getPlan());
        sub.setBillingCycle(savedCompany.getBillingCycle());
        sub.setAmount(savedCompany.getPrice());
        sub.setStatus(savedCompany.getStatus());
        sub.setStartDate("Today");
        sub.setRenewalDate(savedCompany.getRenewalDate());
        subscriptionRepository.save(sub);

        // Create Company Administrator and link to this company
        String adminName = (request.getAdminName() != null && !request.getAdminName().isBlank())
                ? request.getAdminName().trim()
                : request.getName() + " Admin";
        String adminUserId = (request.getAdminUserId() != null && !request.getAdminUserId().isBlank())
                ? request.getAdminUserId().trim()
                : "adm_" + domainClean;

        // If userId already taken, adjust userId to be unique
        int suffix = 1;
        String candidateUserId = adminUserId;
        while (userRepository.existsByUserIdIgnoreCase(candidateUserId)) {
            candidateUserId = adminUserId + suffix++;
        }
        adminUserId = candidateUserId;

        User adminUser = new User();
        adminUser.setUserId(adminUserId);
        adminUser.setFullName(adminName);
        adminUser.setEmail(adminEmail);
        String rawPassword = request.getAdminPassword();
        if (rawPassword == null || rawPassword.trim().isEmpty()) {
            throw new com.nexora.crm.exception.BusinessRuleException("Administrator Password is required.");
        }
        adminUser.setPasswordHash(passwordEncoder.encode(rawPassword.trim()));
        adminUser.setRole(RoleType.COMPANY_ADMIN);
        adminUser.setCompany(savedCompany);
        adminUser.setDepartment("Executive Leadership");
        adminUser.setAvatar(initials.toUpperCase());
        adminUser.setStatus("Active");
        adminUser.setIsActive(true);
        userRepository.save(adminUser);

        return mapToResponse(savedCompany);
    }

    @Transactional
    public CompanyResponse updateCompany(String companyId, CompanyRequest request) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + companyId));

        if (request.getName() != null) company.setName(request.getName().trim());
        if (request.getEmail() != null) company.setEmail(request.getEmail().trim());
        if (request.getPhone() != null) company.setPhone(request.getPhone().trim());
        if (request.getAddress() != null) company.setAddress(request.getAddress());
        if (request.getPlan() != null && !request.getPlan().isBlank()) {
            String newPlan = request.getPlan().trim();
            company.setPlan(newPlan);
            if (request.getUserLimit() == null) {
                subscriptionPlanRepository.findAll().stream()
                        .filter(p -> p.getName() != null && p.getName().equalsIgnoreCase(newPlan))
                        .findFirst()
                        .ifPresent(p -> company.setUserLimit(p.getUserLimit()));
            }
        }
        if (request.getBillingCycle() != null) company.setBillingCycle(request.getBillingCycle());
        if (request.getPrice() != null) company.setPrice(cleanPrice(request.getPrice()));
        if (request.getUserLimit() != null && request.getUserLimit() > 0) company.setUserLimit(request.getUserLimit());
        if (request.getStatus() != null) {
            String status = request.getStatus().trim();
            company.setStatus(status);
            if ("Suspended".equalsIgnoreCase(status) || "Inactive".equalsIgnoreCase(status) || "Cancelled".equalsIgnoreCase(status)) {
                company.setIsActive(false);
                subscriptionRepository.findTopByCompany_IdOrderByCreatedAtDesc(company.getId()).ifPresent(sub -> {
                    sub.setStatus("Suspended");
                    subscriptionRepository.save(sub);
                });
            } else if ("Active".equalsIgnoreCase(status)) {
                company.setIsActive(true);
                subscriptionRepository.findTopByCompany_IdOrderByCreatedAtDesc(company.getId()).ifPresent(sub -> {
                    sub.setStatus("Active");
                    subscriptionRepository.save(sub);
                });
            }
        }

        Company updated = companyRepository.save(company);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteOrDeactivateCompany(String companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + companyId));
        company.setIsActive(false);
        company.setStatus("Suspended");
        companyRepository.save(company);

        subscriptionRepository.findTopByCompany_IdOrderByCreatedAtDesc(company.getId()).ifPresent(sub -> {
            sub.setStatus("Suspended");
            subscriptionRepository.save(sub);
        });
    }

    public static String cleanPrice(String price) {
        if (price == null || price.isBlank()) return "₹2,499";
        String cleaned = price.replaceAll("\\s*/\\s*(mo|month|monthly|yr|year|annually|quarterly).*$", "").trim();
        if (!cleaned.startsWith("₹") && !cleaned.startsWith("INR") && !cleaned.startsWith("$")) {
            return "₹" + cleaned;
        }
        return cleaned;
    }

    private CompanyResponse mapToResponse(Company company) {
        CompanyResponse res = new CompanyResponse();
        res.setId(company.getId());
        res.setName(company.getName());
        res.setDomain(company.getDomain());
        res.setWorkspace(company.getWorkspace());
        res.setEmail(company.getEmail());
        res.setPhone(company.getPhone());
        res.setAddress(company.getAddress());
        res.setLogo(company.getLogo());
        res.setLogoColor(company.getLogoColor());
        res.setPlan(company.getPlan());
        res.setBillingCycle(company.getBillingCycle());
        res.setPrice(cleanPrice(company.getPrice()));
        res.setStatus(company.getStatus());
        res.setUserLimit(company.getUserLimit());
        res.setRenewalDate(company.getRenewalDate());

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("MMM dd, yyyy").withZone(ZoneId.systemDefault());
        res.setJoinedDate(dtf.format(company.getCreatedAt()));

        // Users count & owner
        List<User> users = userRepository.findByCompany_Id(company.getId());
        res.setUsersCount(users.size());

        User owner = users.stream()
                .filter(u -> u.getRole() == RoleType.COMPANY_ADMIN)
                .findFirst()
                .orElse(users.isEmpty() ? null : users.get(0));

        if (owner != null) {
            res.setOwner(new CompanyResponse.CompanyOwnerDto(owner.getUserId(), owner.getFullName(), owner.getEmail(), owner.getAvatar()));
        } else {
            res.setOwner(new CompanyResponse.CompanyOwnerDto(null, company.getName() + " Admin", company.getEmail(), company.getLogo()));
        }

        // Metrics - Strictly Real Scoped Counts
        long customerCount = customerRepository.countByCompany_Id(company.getId());
        long leadCount = leadRepository.countByCompany_Id(company.getId());
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("customers", customerCount);
        metrics.put("leads", leadCount);
        // Note: Real session tracking, storage disk quota measurement, and deals tables do not exist in the database.
        // We explicitly set them to null so frontend knows they are untracked rather than fabricating values.
        metrics.put("activeUsers", null);
        metrics.put("deals", null);
        metrics.put("storageUsed", null);
        res.setMetrics(metrics);

        // Recent activity
        List<Activity> acts = activityRepository.findTop10ByCompany_IdOrderByCreatedAtDesc(company.getId());
        List<Map<String, Object>> actList = new ArrayList<>();
        for (Activity a : acts) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", a.getId());
            item.put("action", a.getAction());
            item.put("user", a.getUserName());
            item.put("timestamp", a.getTarget());
            actList.add(item);
        }
        res.setRecentActivity(actList);

        return res;
    }

    
}
