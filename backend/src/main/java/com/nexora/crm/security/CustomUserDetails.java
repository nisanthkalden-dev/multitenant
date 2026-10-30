package com.nexora.crm.security;

import com.nexora.crm.entity.Company;
import com.nexora.crm.entity.RoleType;
import com.nexora.crm.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class CustomUserDetails implements UserDetails {

    private final Long id;
    private final String userId;
    private final String fullName;
    private final String email;
    private final String password;
    private final RoleType role;
    private final String companyId;
    private final String companyName;
    private final String workspace;
    private final String avatar;
    private final String department;
    private final boolean isActive;
    private final boolean isCompanySuspended;
    private final String companyStatus;

    public CustomUserDetails(User user) {
        this.id = user.getId();
        this.userId = user.getUserId();
        this.fullName = user.getFullName();
        this.email = user.getEmail();
        this.password = user.getPasswordHash();
        this.role = user.getRole();

        Company company = user.getCompany();
        this.companyId = company != null ? company.getId() : null;
        this.companyName = company != null ? company.getName() : null;
        this.workspace = company != null ? company.getWorkspace() : null;
        this.avatar = user.getAvatar();
        this.department = user.getDepartment();

        boolean compSuspended = false;
        String compStatus = "Active";
        if (user.getRole() != RoleType.SUPER_ADMIN) {
            if (company == null) {
                compSuspended = true;
                compStatus = "Suspended";
            } else {
                compStatus = company.getStatus() != null ? company.getStatus() : "Active";
                if (!Boolean.TRUE.equals(company.getIsActive()) || "Suspended".equalsIgnoreCase(compStatus)) {
                    compSuspended = true;
                }
            }
        }
        this.isCompanySuspended = compSuspended;
        this.companyStatus = compStatus;
        // User is enabled only if user active AND their company is not suspended
        this.isActive = Boolean.TRUE.equals(user.getIsActive()) && !compSuspended;
    }

    public boolean isCompanySuspended() {
        return isCompanySuspended;
    }

    public String getCompanyStatus() {
        return companyStatus;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return userId;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return isActive;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isActive;
    }

    public Long getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public RoleType getRole() {
        return role;
    }

    public String getCompanyId() {
        return companyId;
    }

    public String getCompanyName() {
        return companyName;
    }

    public String getWorkspace() {
        return workspace;
    }

    public String getAvatar() {
        return avatar;
    }

    public String getDepartment() {
        return department;
    }
}
