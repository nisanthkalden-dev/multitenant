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
        String companyId = "COMP" + String.format("%03d", (companyRepository.count() + 1));
        if (companyRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new DuplicateResourceException("Company with name '" + request.getName() + "' already exists.");
        }

        Company company = new Company();
        company.setId(companyId);
        company.setName(request.getName().trim());
        company.setEmail(request.getEmail().trim().toLowerCase());
        company.setPhone(request.getPhone().trim());
        company.setAddress(request.getAddress());
        company.setPlan(request.getPlan() != null ? request.getPlan() : "Growth");
        company.setBillingCycle(request.getBillingCycle() != null ? request.getBillingCycle() : "Monthly");
        company.setPrice(request.getPrice() != null ? request.getPrice() : "₹2,499 / mo");
        company.setStatus(request.getStatus() != null ? request.getStatus() : "Active");
        company.setUserLimit(request.getUserLimit() != null ? request.getUserLimit() : 20);

        String domainClean = request.getName().toLowerCase().replaceAll("[^a-z0-9]", "");
        company.setWorkspace(domainClean + ".nexora.app");
        company.setDomain(request.getDomain() != null ? request.getDomain() : domainClean + ".com");

        String initials = "";
        for (String w : request.getName().trim().split("\\s+")) {
            if (!w.isEmpty()) initials += w.charAt(0);
            if (initials.length() >= 2) break;
        }
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
        sub.setStatus("Active");
        sub.setStartDate("Today");
        sub.setRenewalDate(savedCompany.getRenewalDate());
        subscriptionRepository.save(sub);

        // If admin credentials provided or auto-create company admin
        String adminEmail = request.getAdminEmail() != null ? request.getAdminEmail().trim() : request.getEmail().trim();
        String adminName = request.getAdminName() != null ? request.getAdminName().trim() : request.getName() + " Admin";
        String adminUserId = request.getAdminUserId() != null ? request.getAdminUserId().trim() : "adm_" + domainClean;

        if (!userRepository.existsByUserIdIgnoreCase(adminUserId) && !userRepository.existsByEmailIgnoreCase(adminEmail)) {
            User adminUser = new User();
            adminUser.setUserId(adminUserId);
            adminUser.setFullName(adminName);
            adminUser.setEmail(adminEmail);
            String pwd = request.getAdminPassword() != null ? request.getAdminPassword() : "Password123";
            adminUser.setPasswordHash(passwordEncoder.encode(pwd));
            adminUser.setRole(RoleType.COMPANY_ADMIN);
            adminUser.setCompany(savedCompany);
            adminUser.setDepartment("Executive Leadership");
            adminUser.setAvatar(initials.toUpperCase());
            adminUser.setStatus("Active");
            userRepository.save(adminUser);
        }

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
        if (request.getPlan() != null) company.setPlan(request.getPlan());
        if (request.getBillingCycle() != null) company.setBillingCycle(request.getBillingCycle());
        if (request.getPrice() != null) company.setPrice(request.getPrice());
        if (request.getUserLimit() != null) company.setUserLimit(request.getUserLimit());
        if (request.getStatus() != null) company.setStatus(request.getStatus());

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
        res.setPrice(company.getPrice());
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
            res.setOwner(new CompanyResponse.CompanyOwnerDto(owner.getFullName(), owner.getEmail(), owner.getAvatar()));
        } else {
            res.setOwner(new CompanyResponse.CompanyOwnerDto(company.getName() + " Admin", company.getEmail(), company.getLogo()));
        }

        // Metrics
        long customerCount = customerRepository.countByCompany_Id(company.getId());
        long leadCount = leadRepository.countByCompany_Id(company.getId());
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("activeUsers", users.size());
        metrics.put("customers", customerCount);
        metrics.put("leads", leadCount);
        metrics.put("deals", Math.round(leadCount * 0.6));
        metrics.put("storageUsed", (users.size() * 1.5) + " GB / 100 GB");
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
