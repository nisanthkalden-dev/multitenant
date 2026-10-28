package com.nexora.crm.security;

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

    public CustomUserDetails(User user) {
        this.id = user.getId();
        this.userId = user.getUserId();
        this.fullName = user.getFullName();
        this.email = user.getEmail();
        this.password = user.getPasswordHash();
        this.role = user.getRole();
        this.companyId = user.getCompany() != null ? user.getCompany().getId() : null;
        this.companyName = user.getCompany() != null ? user.getCompany().getName() : null;
        this.workspace = user.getCompany() != null ? user.getCompany().getWorkspace() : null;
        this.avatar = user.getAvatar();
        this.department = user.getDepartment();
        this.isActive = Boolean.TRUE.equals(user.getIsActive());
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
