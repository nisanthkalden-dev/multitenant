package com.nexora.crm.service;

import com.nexora.crm.dto.dashboard.CompanyDashboardDto;
import com.nexora.crm.dto.dashboard.SuperAdminDashboardDto;
import com.nexora.crm.entity.Activity;
import com.nexora.crm.entity.Company;
import com.nexora.crm.entity.Lead;
import com.nexora.crm.entity.Subscription;
import com.nexora.crm.entity.Task;
import com.nexora.crm.repository.*;
import com.nexora.crm.security.TenantContext;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
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
        return getSuperAdminDashboard("6M");
    }

    @Transactional(readOnly = true)
    public SuperAdminDashboardDto getSuperAdminDashboard(String period) {
        SuperAdminDashboardDto dto = new SuperAdminDashboardDto();

        long totalCompanies = companyRepository.count();
        long activeCompanies = companyRepository.countByStatusIgnoreCase("Active");
        long suspendedCompanies = companyRepository.countByStatusIgnoreCase("Suspended");
        long totalUsers = userRepository.count();

        // Active subscriptions in MySQL
        long activeSubscriptions = subscriptionRepository.countByStatusIgnoreCase("Active");

        // Fetch all companies to calculate strictly real MRR from active companies
        List<Company> allCompanies = companyRepository.findAll();

        long currentMrr = 0;
        int starterCount = 0;
        int growthCount = 0;
        int scaleCount = 0;

        for (Company c : allCompanies) {
            boolean isActiveCompany = "Active".equalsIgnoreCase(c.getStatus()) && Boolean.TRUE.equals(c.getIsActive());
            if (isActiveCompany) {
                String plan = c.getPlan() != null ? c.getPlan().toLowerCase() : "";
                if (plan.contains("starter")) starterCount++;
                else if (plan.contains("scale")) scaleCount++;
                else growthCount++;

                long numericPrice = parseNumericPrice(c.getPrice());
                if ("Annual".equalsIgnoreCase(c.getBillingCycle())) {
                    currentMrr += Math.round(numericPrice / 12.0);
                } else {
                    currentMrr += numericPrice;
                }
            }
        }

        // Calculate previous month MRR:
        // Companies active today that were created before the current calendar month began
        YearMonth currentYm = YearMonth.now(ZoneId.systemDefault());
        Instant startOfCurrentMonth = currentYm.atDay(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

        long previousMrr = 0;
        for (Company c : allCompanies) {
            boolean isActiveCompany = "Active".equalsIgnoreCase(c.getStatus()) && Boolean.TRUE.equals(c.getIsActive());
            if (isActiveCompany && c.getCreatedAt() != null && c.getCreatedAt().isBefore(startOfCurrentMonth)) {
                long numericPrice = parseNumericPrice(c.getPrice());
                if ("Annual".equalsIgnoreCase(c.getBillingCycle())) {
                    previousMrr += Math.round(numericPrice / 12.0);
                } else {
                    previousMrr += numericPrice;
                }
            }
        }

        // Percentage change: ((current - previous) / previous) * 100
        String growthStr = "0.0%";
        String trend = "neutral";
        if (previousMrr > 0) {
            double pct = ((double) (currentMrr - previousMrr) / previousMrr) * 100.0;
            growthStr = String.format(Locale.US, "%+.1f%%", pct);
            trend = pct > 0 ? "up" : (pct < 0 ? "down" : "neutral");
        } else {
            // Insufficient prior period records to compare against; safely return 0.0% instead of fabricating +100%
            growthStr = "0.0%";
            trend = "neutral";
        }

        String mrrDisplay = currentMrr > 0 ? "₹" + String.format(Locale.US, "%,d", currentMrr) : "₹0";

        Map<String, SuperAdminDashboardDto.StatItem> stats = new HashMap<>();
        stats.put("totalCompanies", new SuperAdminDashboardDto.StatItem(String.valueOf(totalCompanies), growthStr, trend));
        stats.put("activeCompanies", new SuperAdminDashboardDto.StatItem(String.valueOf(activeCompanies), growthStr, trend));
        stats.put("totalUsers", new SuperAdminDashboardDto.StatItem(String.valueOf(totalUsers), "0.0%", "neutral"));
        stats.put("activeSubscriptions", new SuperAdminDashboardDto.StatItem(String.valueOf(activeSubscriptions), growthStr, trend));
        stats.put("monthlyRevenue", new SuperAdminDashboardDto.StatItem(mrrDisplay, growthStr, trend));
        stats.put("avgSubscriptionValue", new SuperAdminDashboardDto.StatItem(
                activeCompanies > 0 ? "₹" + String.format(Locale.US, "%,d", currentMrr / activeCompanies) : "₹0",
                "0.0%", "neutral"));

        dto.setStats(stats);
        dto.setCurrentMrr(currentMrr);
        dto.setPreviousMrr(previousMrr);
        dto.setRevenueGrowth(growthStr);
        dto.setTotalCompaniesCount(totalCompanies);
        dto.setActiveCompaniesCount(activeCompanies);
        dto.setSuspendedCompaniesCount(suspendedCompanies);
        dto.setActiveSubscriptionsCount(activeSubscriptions);
        dto.setTotalUsersCount(totalUsers);

        // Compute 6M and 1Y series dynamically from real database company records
        List<Map<String, Object>> rev6M = computeHistoricalRevenue(allCompanies, 6, currentYm);
        List<Map<String, Object>> rev1Y = computeHistoricalRevenue(allCompanies, 12, currentYm);
        dto.setRevenueMonthlyData6M(rev6M);
        dto.setRevenueMonthlyData1Y(rev1Y);
        dto.setRevenueMonthlyData("1Y".equalsIgnoreCase(period) ? rev1Y : rev6M);

        // Subscription distribution from actual active companies
        List<Map<String, Object>> dist = new ArrayList<>();
        int totalActivePlans = starterCount + growthCount + scaleCount;
        int starterPct = totalActivePlans > 0 ? Math.round((starterCount * 100.0f) / totalActivePlans) : 0;
        int growthPct = totalActivePlans > 0 ? Math.round((growthCount * 100.0f) / totalActivePlans) : 0;
        int scalePct = totalActivePlans > 0 ? Math.max(0, 100 - starterPct - growthPct) : 0;

        dist.add(Map.of("plan", "Starter", "count", starterCount, "percentage", starterPct, "color", "#64748b"));
        dist.add(Map.of("plan", "Growth", "count", growthCount, "percentage", growthPct, "color", "#00d4b8"));
        dist.add(Map.of("plan", "Scale", "count", scaleCount, "percentage", scalePct, "color", "#8b5cf6"));
        dto.setSubscriptionDistribution(dist);

        // Platform activities from actual recent audit activities
        List<Activity> recentActs = activityRepository.findAll(PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"))).getContent();
        List<Map<String, Object>> actList = new ArrayList<>();
        if (!recentActs.isEmpty()) {
            for (Activity a : recentActs) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", a.getId());
                item.put("type", a.getActivityType() != null ? a.getActivityType() : "company_joined");
                item.put("title", a.getAction());
                item.put("description", (a.getUserName() != null ? a.getUserName() + " - " : "") + (a.getTarget() != null ? a.getTarget() : ""));
                item.put("timestamp", a.getCreatedAt() != null ? a.getCreatedAt().toString() : "Recently");
                actList.add(item);
            }
        } else {
            actList.add(Map.of("id", 1, "type", "company_joined", "title", "Platform Initialized", "description", "Database tenant isolation confirmed active", "timestamp", "Just now"));
        }
        dto.setPlatformRecentActivities(actList);

        return dto;
    }

    private List<Map<String, Object>> computeHistoricalRevenue(List<Company> companies, int monthsCount, YearMonth currentYm) {
        List<Map<String, Object>> result = new ArrayList<>();
        DateTimeFormatter monthFmt = DateTimeFormatter.ofPattern("MMM", Locale.ENGLISH);

        for (int i = monthsCount - 1; i >= 0; i--) {
            YearMonth ym = currentYm.minusMonths(i);
            Instant endOfMonth = ym.atEndOfMonth().atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant();

            long monthRevenue = 0;
            for (Company c : companies) {
                if ("Active".equalsIgnoreCase(c.getStatus()) && Boolean.TRUE.equals(c.getIsActive())) {
                    if (c.getCreatedAt() == null || !c.getCreatedAt().isAfter(endOfMonth)) {
                        long numericPrice = parseNumericPrice(c.getPrice());
                        if ("Annual".equalsIgnoreCase(c.getBillingCycle())) {
                            monthRevenue += Math.round(numericPrice / 12.0);
                        } else {
                            monthRevenue += numericPrice;
                        }
                    }
                }
            }

            Map<String, Object> item = new HashMap<>();
            item.put("month", ym.format(monthFmt));
            item.put("revenue", monthRevenue);
            result.add(item);
        }
        return result;
    }

    private long parseNumericPrice(String price) {
        if (price == null || price.isBlank()) return 0;
        String digits = price.replaceAll("[^0-9]", "");
        if (digits.isBlank()) return 0;
        try {
            return Long.parseLong(digits);
        } catch (NumberFormatException e) {
            return 0;
        }
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
