package com.nexora.crm.service;

import com.nexora.crm.dto.dashboard.CompanyDashboardDto;
import com.nexora.crm.dto.dashboard.SuperAdminDashboardDto;
import com.nexora.crm.entity.*;
import com.nexora.crm.repository.*;
import com.nexora.crm.dto.dashboard.CompanyRevenueReportDto;
import com.nexora.crm.dto.dashboard.CompanyRevenueReportDto.CustomerRevenueBreakdownDto;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.DecimalFormat;
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
    private final SubscriptionRevenueService subscriptionRevenueService;
    private final CustomerPaymentRepository customerPaymentRepository;
    private final TenantContext tenantContext;

    public DashboardService(
            CompanyRepository companyRepository,
            UserRepository userRepository,
            CustomerRepository customerRepository,
            LeadRepository leadRepository,
            TaskRepository taskRepository,
            ActivityRepository activityRepository,
            SubscriptionRepository subscriptionRepository,
            SubscriptionRevenueService subscriptionRevenueService,
            CustomerPaymentRepository customerPaymentRepository,
            TenantContext tenantContext
    ) {
        this.customerPaymentRepository = customerPaymentRepository;
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.leadRepository = leadRepository;
        this.taskRepository = taskRepository;
        this.activityRepository = activityRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.subscriptionRevenueService = subscriptionRevenueService;
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

        // Centralized MRR calculation from SubscriptionRevenueService
        long currentMrr = subscriptionRevenueService.calculateMonthlyRecurringRevenue();

        // Plan distribution counts from active companies
        List<Company> allCompanies = companyRepository.findAll();
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
            }
        }

        // Calculate previous month MRR for growth percentage
        YearMonth currentYm = YearMonth.now(ZoneId.systemDefault());
        Instant startOfCurrentMonth = currentYm.atDay(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

        long previousMrr = 0;
        for (Company c : allCompanies) {
            boolean isActiveCompany = "Active".equalsIgnoreCase(c.getStatus()) && Boolean.TRUE.equals(c.getIsActive());
            if (isActiveCompany && c.getCreatedAt() != null && c.getCreatedAt().isBefore(startOfCurrentMonth)) {
                previousMrr += subscriptionRevenueService.normalizeToMonthly(c.getPrice(), c.getBillingCycle());
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

        // Compute 6M and 1Y series dynamically from real database company records using centralized normalization
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
        for (Activity a : recentActs) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", a.getId());
            item.put("type", a.getActivityType() != null ? a.getActivityType() : "company_joined");
            item.put("title", a.getAction());
            item.put("description", (a.getUserName() != null ? a.getUserName() + " - " : "") + (a.getTarget() != null ? a.getTarget() : ""));
            item.put("timestamp", a.getCreatedAt() != null ? a.getCreatedAt().toString() : "Recently");
            actList.add(item);
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
                        monthRevenue += subscriptionRevenueService.normalizeToMonthly(c.getPrice(), c.getBillingCycle());
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

    @Transactional(readOnly = true)
    public CompanyDashboardDto getCompanyAdminDashboard() {
        String companyId = tenantContext.getCurrentCompanyId();
        CompanyDashboardDto dto = new CompanyDashboardDto();
        dto.setCompanyName(tenantContext.getCurrentUserDetails() != null ? tenantContext.getCurrentUserDetails().getCompanyName() : null);
        dto.setRole("company_admin");

        long employeesCount = userRepository.countByCompany_Id(companyId);
        long activeEmployees = userRepository.countByCompany_IdAndStatusIgnoreCase(companyId, "Active");
        long inactiveEmployees = userRepository.countByCompany_IdAndStatusIgnoreCase(companyId, "Inactive");

        List<User> companyStaff = userRepository.findByCompany_Id(companyId);
        Map<String, Long> employeesByDept = new HashMap<>();
        Map<String, Long> employeesByRole = new HashMap<>();
        for (User u : companyStaff) {
            String dept = (u.getDepartment() != null && !u.getDepartment().isBlank()) ? u.getDepartment() : "General";
            employeesByDept.put(dept, employeesByDept.getOrDefault(dept, 0L) + 1);
            String r = u.getRole() != null ? u.getRole().name().toLowerCase() : "employee";
            employeesByRole.put(r, employeesByRole.getOrDefault(r, 0L) + 1);
        }
        long customersCount = customerRepository.countByCompany_Id(companyId);
        long leadsCount = leadRepository.countByCompany_Id(companyId);
        long pendingTasks = taskRepository.countByCompany_IdAndStatusIgnoreCase(companyId, "Pending");

        List<Customer> customers = customerRepository.findByCompany_Id(companyId);
        long totalContractValue = 0;
        for (Customer c : customers) {
            totalContractValue += subscriptionRevenueService.parseNumericAmount(c.getContractValue());
        }

        List<Lead> leads = leadRepository.findByCompany_Id(companyId);
        long wonLeads = leads.stream().filter(l -> "Closed Won".equalsIgnoreCase(l.getStage())).count();
        String conversionRate = leads.isEmpty() ? "0%" : String.format(Locale.US, "%.1f%%", (wonLeads * 100.0) / leads.size());

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalEmployees", employeesCount);
        metrics.put("activeEmployees", activeEmployees);
        metrics.put("inactiveEmployees", inactiveEmployees);
        metrics.put("employeesByDepartment", employeesByDept);
        metrics.put("employeesByRole", employeesByRole);
        metrics.put("totalCustomers", customersCount);
        metrics.put("activeLeads", leadsCount);
        metrics.put("pendingTasks", pendingTasks);
        metrics.put("conversionRate", conversionRate);
        metrics.put("monthlyRevenue", totalContractValue > 0 ? "₹" + String.format(Locale.US, "%,d", totalContractValue) : "₹0");
        dto.setMetrics(metrics);

        populateSubscriptionSummary(dto, companyId);
        populateCommonTenantDashboardData(dto, companyId, null);
        return dto;
    }

    @Transactional(readOnly = true)
    public CompanyDashboardDto getManagerDashboard() {
        String companyId = tenantContext.getCurrentCompanyId();
        CompanyDashboardDto dto = new CompanyDashboardDto();
        dto.setCompanyName(tenantContext.getCurrentUserDetails() != null ? tenantContext.getCurrentUserDetails().getCompanyName() : null);
        dto.setRole("manager");

        long customersCount = customerRepository.countByCompany_Id(companyId);
        long leadsCount = leadRepository.countByCompany_Id(companyId);
        long pendingTasks = taskRepository.countByCompany_IdAndStatusIgnoreCase(companyId, "Pending");
        long teamCount = userRepository.countByCompany_Id(companyId);

        List<Lead> leads = leadRepository.findByCompany_Id(companyId);
        long wonLeads = leads.stream().filter(l -> "Closed Won".equalsIgnoreCase(l.getStage())).count();
        long pipelineTarget = 0;
        for (Lead l : leads) {
            pipelineTarget += subscriptionRevenueService.parseNumericAmount(l.getEstimatedValue());
        }
        String winRate = leads.isEmpty() ? "0%" : String.format(Locale.US, "%.1f%%", (wonLeads * 100.0) / leads.size());

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalEmployees", teamCount);
        metrics.put("teamMembers", teamCount);
        metrics.put("totalCustomers", customersCount);
        metrics.put("managedCustomers", customersCount);
        metrics.put("activeLeads", leadsCount);
        metrics.put("activeDeals", leadsCount);
        metrics.put("pendingTasks", pendingTasks);
        metrics.put("openTasks", pendingTasks);
        metrics.put("conversionRate", winRate);
        metrics.put("teamQuotaAttainment", winRate);
        metrics.put("monthlyRevenue", pipelineTarget > 0 ? "₹" + String.format(Locale.US, "%,d", pipelineTarget) : "₹0");
        dto.setMetrics(metrics);

        populateSubscriptionSummary(dto, companyId);
        populateCommonTenantDashboardData(dto, companyId, null);
        return dto;
    }

    @Transactional(readOnly = true)
    public CompanyRevenueReportDto getCompanyRevenueReport() {
        String companyId = tenantContext.getCurrentCompanyId();
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new com.nexora.crm.exception.ResourceNotFoundException("Company not found: " + companyId));

        List<Customer> customers = customerRepository.findByCompany_Id(companyId);
        List<CustomerPayment> payments = customerPaymentRepository.findByCustomer_IdAndCompany_Id(
                null, companyId, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "paymentDate")
        );

        BigDecimal totalContractRevenue = BigDecimal.ZERO;
        BigDecimal totalPaidAmount = customerPaymentRepository.sumAmountByCompany(companyId);
        if (totalPaidAmount == null) totalPaidAmount = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        List<CustomerRevenueBreakdownDto> breakdownList = new ArrayList<>();
        long settledCount = 0;
        long pendingCount = 0;

        for (Customer c : customers) {
            BigDecimal cContract = CustomerService.parseContractValue(c.getContractValue());
            totalContractRevenue = totalContractRevenue.add(cContract);

            BigDecimal cPaid = customerPaymentRepository.sumAmountByCustomerAndCompany(c.getId(), companyId);
            if (cPaid == null) cPaid = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

            BigDecimal cRemaining = cContract.subtract(cPaid);
            if (cRemaining.compareTo(BigDecimal.ZERO) < 0) cRemaining = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

            double cSettlementRate = 0.0;
            if (cContract.compareTo(BigDecimal.ZERO) > 0) {
                cSettlementRate = cPaid.divide(cContract, 4, RoundingMode.HALF_UP).doubleValue() * 100.0;
                if (cSettlementRate > 100.0) cSettlementRate = 100.0;
            } else if (cPaid.compareTo(BigDecimal.ZERO) > 0) {
                cSettlementRate = 100.0;
            }

            String status = "Pending";
            if (cContract.compareTo(BigDecimal.ZERO) > 0 && cRemaining.compareTo(BigDecimal.ZERO) == 0) {
                status = "Settled";
                settledCount++;
            } else if (cPaid.compareTo(BigDecimal.ZERO) > 0) {
                status = "Partially Paid";
                pendingCount++;
            } else {
                status = "Pending";
                pendingCount++;
            }

            CustomerRevenueBreakdownDto b = new CustomerRevenueBreakdownDto();
            b.setCustomerId(c.getId());
            b.setCustomerName(c.getName());
            b.setContactPerson(c.getContactPerson());
            b.setTier(c.getTier());
            b.setIndustry(c.getIndustry());
            b.setContractValue(cContract);
            b.setPaidAmount(cPaid);
            b.setRemainingBalance(cRemaining);
            b.setFormattedContractValue(CustomerService.formatCurrency(cContract));
            b.setFormattedPaidAmount(CustomerService.formatCurrency(cPaid));
            b.setFormattedRemainingBalance(CustomerService.formatCurrency(cRemaining));
            b.setSettlementPercentage(Math.round(cSettlementRate * 10.0) / 10.0);
            b.setStatus(status);

            breakdownList.add(b);
        }

        BigDecimal totalRemaining = totalContractRevenue.subtract(totalPaidAmount);
        if (totalRemaining.compareTo(BigDecimal.ZERO) < 0) totalRemaining = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        double overallSettlementRate = 0.0;
        if (totalContractRevenue.compareTo(BigDecimal.ZERO) > 0) {
            overallSettlementRate = totalPaidAmount.divide(totalContractRevenue, 4, RoundingMode.HALF_UP).doubleValue() * 100.0;
            if (overallSettlementRate > 100.0) overallSettlementRate = 100.0;
        }

        long paymentCount = customerPaymentRepository.count();

        CompanyRevenueReportDto report = new CompanyRevenueReportDto();
        report.setCompanyId(company.getId());
        report.setCompanyName(company.getName());
        report.setTotalContractRevenue(totalContractRevenue);
        report.setTotalPaidAmount(totalPaidAmount);
        report.setTotalRemainingBalance(totalRemaining);
        report.setFormattedTotalRevenue(CustomerService.formatCurrency(totalContractRevenue));
        report.setFormattedPaidAmount(CustomerService.formatCurrency(totalPaidAmount));
        report.setFormattedRemainingBalance(CustomerService.formatCurrency(totalRemaining));
        report.setSettlementPercentage(Math.round(overallSettlementRate * 10.0) / 10.0);
        report.setTotalCustomersCount(customers.size());
        report.setFullySettledCustomersCount(settledCount);
        report.setPendingSettlementCustomersCount(pendingCount);
        report.setTotalPaymentsCount(paymentCount);
        report.setCustomerBreakdowns(breakdownList);

        return report;
    }

    public CompanyDashboardDto getEmployeeDashboard() {
        String companyId = tenantContext.getCurrentCompanyId();
        String userId = tenantContext.getCurrentUserId();

        CompanyDashboardDto dto = new CompanyDashboardDto();
        dto.setCompanyName(tenantContext.getCurrentUserDetails() != null ? tenantContext.getCurrentUserDetails().getCompanyName() : null);
        dto.setRole("employee");

        long myCustomers = customerRepository.countByCompany_IdAndAssignedTo(companyId, userId);
        long myLeads = leadRepository.countByCompany_IdAndAssignedTo(companyId, userId);
        long myPendingTasks = taskRepository.countByCompany_IdAndAssignedToAndStatusIgnoreCase(companyId, userId, "Pending");

        List<Lead> assignedLeads = leadRepository.findByCompany_Id(companyId).stream()
                .filter(l -> userId != null && userId.equalsIgnoreCase(l.getAssignedTo()))
                .toList();
        long myDealsWon = assignedLeads.stream().filter(l -> "Closed Won".equalsIgnoreCase(l.getStage())).count();
        long myPipelineValue = 0;
        for (Lead l : assignedLeads) {
            myPipelineValue += subscriptionRevenueService.parseNumericAmount(l.getEstimatedValue());
        }
        String myWinRate = assignedLeads.isEmpty() ? "0%" : String.format(Locale.US, "%.1f%%", (myDealsWon * 100.0) / assignedLeads.size());

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalCustomers", myCustomers);
        metrics.put("myCustomers", myCustomers);
        metrics.put("activeLeads", myLeads);
        metrics.put("myLeads", myLeads);
        metrics.put("pendingTasks", myPendingTasks);
        metrics.put("myPendingTasks", myPendingTasks);
        metrics.put("dealsWonThisMonth", myDealsWon);
        metrics.put("conversionRate", myWinRate);
        metrics.put("pipelineValue", myPipelineValue > 0 ? "₹" + String.format(Locale.US, "%,d", myPipelineValue) : "₹0");
        metrics.put("monthlyRevenue", myPipelineValue > 0 ? "₹" + String.format(Locale.US, "%,d", myPipelineValue) : "₹0");
        dto.setMetrics(metrics);

        populateSubscriptionSummary(dto, companyId);
        populateCommonTenantDashboardData(dto, companyId, userId);
        return dto;
    }

    private void populateSubscriptionSummary(CompanyDashboardDto dto, String companyId) {
        if (companyId == null) return;
        Company comp = companyRepository.findById(companyId).orElse(null);
        if (comp == null) return;

        Map<String, Object> subMap = new HashMap<>();
        subMap.put("plan", comp.getPlan());
        subMap.put("billingCycle", comp.getBillingCycle());
        subMap.put("price", comp.getPrice());
        subMap.put("status", comp.getStatus());
        subMap.put("renewalDate", comp.getRenewalDate());
        subMap.put("userLimit", comp.getUserLimit() != null ? comp.getUserLimit() : 20);
        dto.setSubscriptionSummary(subMap);
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
            m.put("companyName", l.getCompanyName());
            m.put("contactName", l.getContactName());
            m.put("stage", l.getStage());
            m.put("value", l.getEstimatedValue());
            m.put("estimatedValue", l.getEstimatedValue());
            leadMaps.add(m);
        }
        dto.setRecentLeads(leadMaps);

        // Recent customers
        List<Customer> customers = customerRepository.findByCompany_Id(companyId);
        if (userIdFilter != null) {
            customers = customers.stream().filter(c -> userIdFilter.equalsIgnoreCase(c.getAssignedTo())).toList();
        }
        List<Map<String, Object>> custMaps = new ArrayList<>();
        for (Customer c : customers.stream().limit(5).toList()) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", c.getId());
            m.put("name", c.getName());
            m.put("contactPerson", c.getContactPerson());
            m.put("status", c.getStatus());
            m.put("value", c.getContractValue());
            m.put("contractValue", c.getContractValue());
            m.put("assignedTo", c.getAssignedTo());
            custMaps.add(m);
        }
        dto.setRecentCustomers(custMaps);

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
