package com.nexora.crm.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "company_settings")
public class CompanySetting {

    @Id
    @Column(name = "company_id", length = 50, nullable = false)
    private String companyId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", insertable = false, updatable = false)
    private Company company;

    @Column(length = 50)
    private String currency = "INR (₹)";

    @Column(length = 100)
    private String timezone = "Asia/Kolkata";

    @Column(name = "date_format", length = 50)
    private String dateFormat = "DD/MM/YYYY";

    @Column(name = "notifications_enabled")
    private Boolean notificationsEnabled = true;

    @Column(name = "auto_assign_leads")
    private Boolean autoAssignLeads = false;

    @Column(name = "lead_routing_rule", length = 100)
    private String leadRoutingRule = "RoundRobin";

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public CompanySetting() {}

    public CompanySetting(String companyId) {
        this.companyId = companyId;
    }

    public String getCompanyId() {
        return companyId;
    }

    public void setCompanyId(String companyId) {
        this.companyId = companyId;
    }

    public Company getCompany() {
        return company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public String getDateFormat() {
        return dateFormat;
    }

    public void setDateFormat(String dateFormat) {
        this.dateFormat = dateFormat;
    }

    public Boolean getNotificationsEnabled() {
        return notificationsEnabled;
    }

    public void setNotificationsEnabled(Boolean notificationsEnabled) {
        this.notificationsEnabled = notificationsEnabled;
    }

    public Boolean getAutoAssignLeads() {
        return autoAssignLeads;
    }

    public void setAutoAssignLeads(Boolean autoAssignLeads) {
        this.autoAssignLeads = autoAssignLeads;
    }

    public String getLeadRoutingRule() {
        return leadRoutingRule;
    }

    public void setLeadRoutingRule(String leadRoutingRule) {
        this.leadRoutingRule = leadRoutingRule;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
