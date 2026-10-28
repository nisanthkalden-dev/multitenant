package com.nexora.crm.dto.company;

public class CompanySettingDto {
    private String companyId;
    private String currency;
    private String timezone;
    private String dateFormat;
    private Boolean notificationsEnabled;
    private Boolean autoAssignLeads;
    private String leadRoutingRule;

    public CompanySettingDto() {}

    public String getCompanyId() {
        return companyId;
    }

    public void setCompanyId(String companyId) {
        this.companyId = companyId;
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
}
