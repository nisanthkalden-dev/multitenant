package com.nexora.crm.dto.dashboard;

import java.util.List;
import java.util.Map;

public class SuperAdminDashboardDto {
    private Map<String, StatItem> stats;
    private List<Map<String, Object>> revenueMonthlyData;
    private List<Map<String, Object>> revenueMonthlyData6M;
    private List<Map<String, Object>> revenueMonthlyData1Y;
    private List<Map<String, Object>> subscriptionDistribution;
    private List<Map<String, Object>> platformRecentActivities;
    private Long currentMrr;
    private Long previousMrr;
    private String revenueGrowth;
    private Long totalCompaniesCount;
    private Long activeCompaniesCount;
    private Long suspendedCompaniesCount;
    private Long activeSubscriptionsCount;
    private Long totalUsersCount;

    public SuperAdminDashboardDto() {}

    public Map<String, StatItem> getStats() {
        return stats;
    }

    public void setStats(Map<String, StatItem> stats) {
        this.stats = stats;
    }

    public List<Map<String, Object>> getRevenueMonthlyData() {
        return revenueMonthlyData;
    }

    public void setRevenueMonthlyData(List<Map<String, Object>> revenueMonthlyData) {
        this.revenueMonthlyData = revenueMonthlyData;
    }

    public List<Map<String, Object>> getRevenueMonthlyData6M() {
        return revenueMonthlyData6M;
    }

    public void setRevenueMonthlyData6M(List<Map<String, Object>> revenueMonthlyData6M) {
        this.revenueMonthlyData6M = revenueMonthlyData6M;
    }

    public List<Map<String, Object>> getRevenueMonthlyData1Y() {
        return revenueMonthlyData1Y;
    }

    public void setRevenueMonthlyData1Y(List<Map<String, Object>> revenueMonthlyData1Y) {
        this.revenueMonthlyData1Y = revenueMonthlyData1Y;
    }

    public Long getCurrentMrr() {
        return currentMrr;
    }

    public void setCurrentMrr(Long currentMrr) {
        this.currentMrr = currentMrr;
    }

    public Long getPreviousMrr() {
        return previousMrr;
    }

    public void setPreviousMrr(Long previousMrr) {
        this.previousMrr = previousMrr;
    }

    public String getRevenueGrowth() {
        return revenueGrowth;
    }

    public void setRevenueGrowth(String revenueGrowth) {
        this.revenueGrowth = revenueGrowth;
    }

    public Long getTotalCompaniesCount() {
        return totalCompaniesCount;
    }

    public void setTotalCompaniesCount(Long totalCompaniesCount) {
        this.totalCompaniesCount = totalCompaniesCount;
    }

    public Long getActiveCompaniesCount() {
        return activeCompaniesCount;
    }

    public void setActiveCompaniesCount(Long activeCompaniesCount) {
        this.activeCompaniesCount = activeCompaniesCount;
    }

    public Long getSuspendedCompaniesCount() {
        return suspendedCompaniesCount;
    }

    public void setSuspendedCompaniesCount(Long suspendedCompaniesCount) {
        this.suspendedCompaniesCount = suspendedCompaniesCount;
    }

    public Long getActiveSubscriptionsCount() {
        return activeSubscriptionsCount;
    }

    public void setActiveSubscriptionsCount(Long activeSubscriptionsCount) {
        this.activeSubscriptionsCount = activeSubscriptionsCount;
    }

    public Long getTotalUsersCount() {
        return totalUsersCount;
    }

    public void setTotalUsersCount(Long totalUsersCount) {
        this.totalUsersCount = totalUsersCount;
    }

    public List<Map<String, Object>> getSubscriptionDistribution() {
        return subscriptionDistribution;
    }

    public void setSubscriptionDistribution(List<Map<String, Object>> subscriptionDistribution) {
        this.subscriptionDistribution = subscriptionDistribution;
    }

    public List<Map<String, Object>> getPlatformRecentActivities() {
        return platformRecentActivities;
    }

    public void setPlatformRecentActivities(List<Map<String, Object>> platformRecentActivities) {
        this.platformRecentActivities = platformRecentActivities;
    }

    public static class StatItem {
        private String value;
        private String growth;
        private String trend;

        public StatItem() {}

        public StatItem(String value, String growth, String trend) {
            this.value = value;
            this.growth = growth;
            this.trend = trend;
        }

        public String getValue() {
            return value;
        }

        public void setValue(String value) {
            this.value = value;
        }

        public String getGrowth() {
            return growth;
        }

        public void setGrowth(String growth) {
            this.growth = growth;
        }

        public String getTrend() {
            return trend;
        }

        public void setTrend(String trend) {
            this.trend = trend;
        }
    }
}
