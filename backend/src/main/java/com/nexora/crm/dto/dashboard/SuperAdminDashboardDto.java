package com.nexora.crm.dto.dashboard;

import java.util.List;
import java.util.Map;

public class SuperAdminDashboardDto {
    private Map<String, StatItem> stats;
    private List<Map<String, Object>> revenueMonthlyData;
    private List<Map<String, Object>> subscriptionDistribution;
    private List<Map<String, Object>> platformRecentActivities;

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
