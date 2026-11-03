package com.nexora.crm.dto.customer;

import java.math.BigDecimal;
import java.util.List;

public class CustomerResponse {
    private String id;
    private String companyId;
    private String name;
    private String contactPerson;
    private String email;
    private String phone;
    private String industry;
    private String status;
    private String tier;
    private String contractValue;
    private String value; // alias for contractValue used in frontend
    private String assignedTo;
    private String managerId;
    private String lastContact;
    private String address;
    private String contractStartDate;
    private String contractEndDate;

    // Financial calculation fields
    private BigDecimal totalContractAmount;
    private BigDecimal totalAmountPaid;
    private BigDecimal remainingBalance;
    private String formattedContractValue;
    private String formattedAmountPaid;
    private String formattedRemainingBalance;

    private List<CustomerPaymentDto> recentPayments;

    public CustomerResponse() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCompanyId() {
        return companyId;
    }

    public void setCompanyId(String companyId) {
        this.companyId = companyId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getContactPerson() {
        return contactPerson;
    }

    public void setContactPerson(String contactPerson) {
        this.contactPerson = contactPerson;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getTier() {
        return tier;
    }

    public void setTier(String tier) {
        this.tier = tier;
    }

    public String getContractValue() {
        return contractValue;
    }

    public void setContractValue(String contractValue) {
        this.contractValue = contractValue;
        this.value = contractValue;
    }

    public String getValue() {
        return value != null ? value : contractValue;
    }

    public void setValue(String value) {
        this.value = value;
        if (this.contractValue == null) {
            this.contractValue = value;
        }
    }

    public String getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(String assignedTo) {
        this.assignedTo = assignedTo;
    }

    public String getManagerId() {
        return managerId;
    }

    public void setManagerId(String managerId) {
        this.managerId = managerId;
    }

    public String getLastContact() {
        return lastContact;
    }

    public void setLastContact(String lastContact) {
        this.lastContact = lastContact;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getContractStartDate() {
        return contractStartDate;
    }

    public void setContractStartDate(String contractStartDate) {
        this.contractStartDate = contractStartDate;
    }

    public String getContractEndDate() {
        return contractEndDate;
    }

    public void setContractEndDate(String contractEndDate) {
        this.contractEndDate = contractEndDate;
    }

    public BigDecimal getTotalContractAmount() {
        return totalContractAmount;
    }

    public void setTotalContractAmount(BigDecimal totalContractAmount) {
        this.totalContractAmount = totalContractAmount;
    }

    public BigDecimal getTotalAmountPaid() {
        return totalAmountPaid;
    }

    public void setTotalAmountPaid(BigDecimal totalAmountPaid) {
        this.totalAmountPaid = totalAmountPaid;
    }

    public BigDecimal getRemainingBalance() {
        return remainingBalance;
    }

    public void setRemainingBalance(BigDecimal remainingBalance) {
        this.remainingBalance = remainingBalance;
    }

    public String getFormattedContractValue() {
        return formattedContractValue;
    }

    public void setFormattedContractValue(String formattedContractValue) {
        this.formattedContractValue = formattedContractValue;
    }

    public String getFormattedAmountPaid() {
        return formattedAmountPaid;
    }

    public void setFormattedAmountPaid(String formattedAmountPaid) {
        this.formattedAmountPaid = formattedAmountPaid;
    }

    public String getFormattedRemainingBalance() {
        return formattedRemainingBalance;
    }

    public void setFormattedRemainingBalance(String formattedRemainingBalance) {
        this.formattedRemainingBalance = formattedRemainingBalance;
    }

    public List<CustomerPaymentDto> getRecentPayments() {
        return recentPayments;
    }

    public void setRecentPayments(List<CustomerPaymentDto> recentPayments) {
        this.recentPayments = recentPayments;
    }
}
