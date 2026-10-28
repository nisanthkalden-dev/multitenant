package com.nexora.crm.dto.dashboard;

import java.util.List;
import java.util.Map;

public class CompanyDashboardDto {
    private String companyName;
    private String role;
    private Map<String, Object> metrics;
    private List<Map<String, Object>> recentLeads;
    private List<Map<String, Object>> recentTasks;
    private List<Map<String, Object>> recentActivities;
    private Map<String, Object> subscriptionSummary;

    public CompanyDashboardDto() {}

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Map<String, Object> getMetrics() {
        return metrics;
    }

    public void setMetrics(Map<String, Object> metrics) {
        this.metrics = metrics;
    }

    public List<Map<String, Object>> getRecentLeads() {
        return recentLeads;
    }

    public void setRecentLeads(List<Map<String, Object>> recentLeads) {
        this.recentLeads = recentLeads;
    }

    public List<Map<String, Object>> getRecentTasks() {
        return recentTasks;
    }

    public void setRecentTasks(List<Map<String, Object>> recentTasks) {
        this.recentTasks = recentTasks;
    }

    public List<Map<String, Object>> getRecentActivities() {
        return recentActivities;
    }

    public void setRecentActivities(List<Map<String, Object>> recentActivities) {
        this.recentActivities = recentActivities;
    }

    public Map<String, Object> getSubscriptionSummary() {
        return subscriptionSummary;
    }

    public void setSubscriptionSummary(Map<String, Object> subscriptionSummary) {
        this.subscriptionSummary = subscriptionSummary;
    }
}
