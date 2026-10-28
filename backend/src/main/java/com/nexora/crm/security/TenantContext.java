package com.nexora.crm.security;

import com.nexora.crm.entity.RoleType;
import com.nexora.crm.exception.TenantAccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class TenantContext {

    public CustomUserDetails getCurrentUserDetails() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails) {
            return (CustomUserDetails) auth.getPrincipal();
        }
        return null;
    }

    public String getCurrentCompanyId() {
        CustomUserDetails user = getCurrentUserDetails();
        return user != null ? user.getCompanyId() : null;
    }

    public String getCurrentUserId() {
        CustomUserDetails user = getCurrentUserDetails();
        return user != null ? user.getUserId() : null;
    }

    public RoleType getCurrentRole() {
        CustomUserDetails user = getCurrentUserDetails();
        return user != null ? user.getRole() : null;
    }

    public boolean isSuperAdmin() {
        return getCurrentRole() == RoleType.SUPER_ADMIN;
    }

    public boolean isCompanyAdmin() {
        return getCurrentRole() == RoleType.COMPANY_ADMIN;
    }

    public boolean isManager() {
        return getCurrentRole() == RoleType.MANAGER;
    }

    public boolean isEmployee() {
        return getCurrentRole() == RoleType.EMPLOYEE;
    }

    /**
     * Enforce that the authenticated user belongs to the given companyId,
     * unless the user is a SUPER_ADMIN.
     */
    public void validateTenantAccess(String targetCompanyId) {
        if (isSuperAdmin()) {
            return;
        }
        String userCompanyId = getCurrentCompanyId();
        if (userCompanyId == null || !userCompanyId.equalsIgnoreCase(targetCompanyId)) {
            throw new TenantAccessDeniedException("Cross-tenant access prohibited. You cannot access data belonging to another organization.");
        }
    }
}
