package com.nexora.crm.entity;

public enum RoleType {
    SUPER_ADMIN,
    COMPANY_ADMIN,
    MANAGER,
    EMPLOYEE;

    public static RoleType fromString(String role) {
        if (role == null) return EMPLOYEE;
        String normalized = role.trim().toUpperCase().replace("-", "_").replace(" ", "_");
        if (normalized.equals("ADMIN")) return COMPANY_ADMIN;
        if (normalized.equals("TEAM_LEAD")) return EMPLOYEE;
        return RoleType.valueOf(normalized);
    }
}
