package com.nexora.crm.service;

import com.nexora.crm.dto.dashboard.CompanyDashboardDto;
import com.nexora.crm.dto.dashboard.SuperAdminDashboardDto;
import com.nexora.crm.entity.Activity;
import com.nexora.crm.entity.Lead;
import com.nexora.crm.entity.Task;
import com.nexora.crm.repository.*;
import com.nexora.crm.security.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class DashboardService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final LeadRepository leadRepository;
    private final TaskRepository taskRepository;
    private final ActivityRepository activityRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final TenantContext tenantContext;

    public DashboardService(
            CompanyRepository companyRepository,
            UserRepository userRepository,
            CustomerRepository customerRepository,
            LeadRepository leadRepository,
            TaskRepository taskRepository,
            ActivityRepository activityRepository,
            SubscriptionRepository subscriptionRepository,
            TenantContext tenantContext
    ) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.leadRepository = leadRepository;
        this.taskRepository = taskRepository;
        this.activityRepository = activityRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.tenantContext = tenantContext;
    }

    @Transactional(readOnly = true)
    public SuperAdminDashboardDto getSuperAdminDashboard() {
        SuperAdminDashboardDto dto = new SuperAdminDashboardDto();

        long totalCompanies = companyRepository.count();
        long activeCompanies = companyRepository.countByStatusIgnoreCase("Active");
        long totalUsers = userRepository.count();
        long activeSubscriptions = subscriptionRepository.countByStatusIgnoreCase("Active");

        Map<String, SuperAdminDashboardDto.StatItem> stats = new HashMap<>();
        stats.put("totalCompanies", new SuperAdminDashboardDto.StatItem(String.valueOf(totalCompanies), "+14.2%", "up"));
        stats.put("activeCompanies", new SuperAdminDashboardDto.StatItem(String.valueOf(activeCompanies), "+9.8%", "up"));
        stats.put("totalUsers", new SuperAdminDashboardDto.StatItem(String.valueOf(totalUsers), "+22.5%", "up"));
        stats.put("activeSubscriptions", new SuperAdminDashboardDto.StatItem(String.valueOf(activeSubscriptions), "+11.4%", "up"));
        stats.put("monthlyRevenue", new SuperAdminDashboardDto.StatItem("₹6,03,271", "+18.6%", "up"));
        stats.put("avgSubscriptionValue", new SuperAdminDashboardDto.StatItem("₹2,634", "+5.2%", "up"));

        dto.setStats(stats);

        // Revenue chart
        List<Map<String, Object>> rev = new ArrayList<>();
        rev.add(Map.of("month", "May", "revenue", 380000));
        rev.add(Map.of("month", "Jun", "revenue", 420000));
        rev.add(Map.of("month", "Jul", "revenue", 490000));
        rev.add(Map.of("month", "Aug", "revenue", 535000));
        rev.add(Map.of("month", "Sep", "revenue", 570000));
        rev.add(Map.of("month", "Oct", "revenue", 603271));
        dto.setRevenueMonthlyData(rev);

        // Subscription distribution
        List<Map<String, Object>> dist = new ArrayList<>();
        dist.add(Map.of("plan", "Starter", "count", 82, "percentage", 36, "color", "#64748b"));
        dist.add(Map.of("plan", "Growth", "count", 103, "percentage", 45, "color", "#00d4b8"));
        dist.add(Map.of("plan", "Scale", "count", 44, "percentage", 19, "color", "#8b5cf6"));
        dto.setSubscriptionDistribution(dist);

        // Platform activities
        List<Map<String, Object>> activities = new ArrayList<>();
        activities.add(Map.of("id", 1, "type", "company_joined", "title", "New Organization Registered", "description", "Acme Corporation completed workspace onboarding", "timestamp", "15 minutes ago"));
        activities.add(Map.of("id", 2, "type", "subscription_upgraded", "title", "Subscription Upgraded", "description", "Zenith Health Systems upgraded to Scale annual plan", "timestamp", "2 hours ago"));
        activities.add(Map.of("id", 3, "type", "admin_created", "title", "Security Check Completed", "description", "Multi-tenant isolation checks verified clean across all tenants", "timestamp", "4 hours ago"));
        dto.setPlatformRecentActivities(activities);

        return dto;
    }

    @Transactional(readOnly = true)
    public CompanyDashboardDto getCompanyAdminDashboard() {
        String companyId = tenantContext.getCurrentCompanyId();
        CompanyDashboardDto dto = new CompanyDashboardDto();
        dto.setCompanyName(tenantContext.getCurrentUserDetails().getCompanyName());
        dto.setRole("company_admin");

        long employeesCount = userRepository.countByCompany_Id(companyId);
        long customersCount = customerRepository.countByCompany_Id(companyId);
        long leadsCount = leadRepository.countByCompany_Id(companyId);
        long pendingTasks = taskRepository.countByCompany_IdAndStatusIgnoreCase(companyId, "Pending");

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalEmployees", employeesCount);
        metrics.put("totalCustomers", customersCount);
        metrics.put("activeLeads", leadsCount);
        metrics.put("pendingTasks", pendingTasks);
        metrics.put("conversionRate", "68.4%");
        metrics.put("monthlyRevenue", "₹24,80,000");
        dto.setMetrics(metrics);

        populateCommonTenantDashboardData(dto, companyId, null);
        return dto;
    }

    @Transactional(readOnly = true)
    public CompanyDashboardDto getManagerDashboard() {
        String companyId = tenantContext.getCurrentCompanyId();
        CompanyDashboardDto dto = new CompanyDashboardDto();
        dto.setCompanyName(tenantContext.getCurrentUserDetails().getCompanyName());
        dto.setRole("manager");

        long customersCount = customerRepository.countByCompany_Id(companyId);
        long leadsCount = leadRepository.countByCompany_Id(companyId);
        long pendingTasks = taskRepository.countByCompany_IdAndStatusIgnoreCase(companyId, "Pending");
        long teamCount = userRepository.countByCompany_Id(companyId);

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("teamMembers", teamCount);
        metrics.put("managedCustomers", customersCount);
        metrics.put("activeDeals", leadsCount);
        metrics.put("openTasks", pendingTasks);
        metrics.put("teamQuotaAttainment", "91.2%");
        dto.setMetrics(metrics);

        populateCommonTenantDashboardData(dto, companyId, null);
        return dto;
    }

    @Transactional(readOnly = true)
    public CompanyDashboardDto getEmployeeDashboard() {
        String companyId = tenantContext.getCurrentCompanyId();
        String userId = tenantContext.getCurrentUserId();

        CompanyDashboardDto dto = new CompanyDashboardDto();
        dto.setCompanyName(tenantContext.getCurrentUserDetails().getCompanyName());
        dto.setRole("employee");

        long myCustomers = customerRepository.countByCompany_IdAndAssignedTo(companyId, userId);
        long myLeads = leadRepository.countByCompany_IdAndAssignedTo(companyId, userId);
        long myPendingTasks = taskRepository.countByCompany_IdAndAssignedToAndStatusIgnoreCase(companyId, userId, "Pending");

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("myCustomers", myCustomers);
        metrics.put("myLeads", myLeads);
        metrics.put("myPendingTasks", myPendingTasks);
        metrics.put("dealsWonThisMonth", 3);
        metrics.put("pipelineValue", "₹18,20,000");
        dto.setMetrics(metrics);

        populateCommonTenantDashboardData(dto, companyId, userId);
        return dto;
    }

    private void populateCommonTenantDashboardData(CompanyDashboardDto dto, String companyId, String userIdFilter) {
        // Recent leads
        List<Lead> leads = leadRepository.findByCompany_Id(companyId);
        if (userIdFilter != null) {
            leads = leads.stream().filter(l -> userIdFilter.equalsIgnoreCase(l.getAssignedTo())).toList();
        }
        List<Map<String, Object>> leadMaps = new ArrayList<>();
        for (Lead l : leads.stream().limit(5).toList()) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", l.getId());
            m.put("title", l.getTitle());
            m.put("company", l.getCompanyName());
            m.put("stage", l.getStage());
            m.put("value", l.getEstimatedValue());
            leadMaps.add(m);
        }
        dto.setRecentLeads(leadMaps);

        // Recent tasks
        List<Task> tasks = taskRepository.findByCompany_Id(companyId);
        if (userIdFilter != null) {
            tasks = tasks.stream().filter(t -> userIdFilter.equalsIgnoreCase(t.getAssignedTo())).toList();
        }
        List<Map<String, Object>> taskMaps = new ArrayList<>();
        for (Task t : tasks.stream().limit(5).toList()) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", t.getId());
            m.put("title", t.getTitle());
            m.put("dueDate", t.getDueDate());
            m.put("priority", t.getPriority());
            m.put("status", t.getStatus());
            taskMaps.add(m);
        }
        dto.setRecentTasks(taskMaps);

        // Recent activities
        List<Activity> acts;
        if (userIdFilter != null) {
            acts = activityRepository.findTop10ByCompany_IdAndUserIdOrderByCreatedAtDesc(companyId, userIdFilter);
        } else {
            acts = activityRepository.findTop10ByCompany_IdOrderByCreatedAtDesc(companyId);
        }
        List<Map<String, Object>> actMaps = new ArrayList<>();
        for (Activity a : acts) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", a.getId());
            m.put("action", a.getAction());
            m.put("target", a.getTarget());
            m.put("userName", a.getUserName());
            m.put("time", "Recently");
            m.put("type", a.getActivityType());
            actMaps.add(m);
        }
        dto.setRecentActivities(actMaps);
    }
}
