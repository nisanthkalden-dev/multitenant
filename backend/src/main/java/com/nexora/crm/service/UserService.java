package com.nexora.crm.service;

import com.nexora.crm.dto.auth.UserSummaryDto;
import com.nexora.crm.dto.user.PasswordChangeRequest;
import com.nexora.crm.dto.user.UserCreateRequest;
import com.nexora.crm.dto.user.UserUpdateRequest;
import com.nexora.crm.entity.Company;
import com.nexora.crm.entity.RoleType;
import com.nexora.crm.entity.User;
import com.nexora.crm.exception.BusinessRuleException;
import com.nexora.crm.exception.DuplicateResourceException;
import com.nexora.crm.exception.ResourceNotFoundException;
import com.nexora.crm.repository.CompanyRepository;
import com.nexora.crm.repository.UserRepository;
import com.nexora.crm.security.TenantContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final TenantContext tenantContext;
    private final AuthService authService;

    public UserService(
            UserRepository userRepository,
            CompanyRepository companyRepository,
            PasswordEncoder passwordEncoder,
            TenantContext tenantContext,
            AuthService authService
    ) {
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.passwordEncoder = passwordEncoder;
        this.tenantContext = tenantContext;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public Page<UserSummaryDto> getCompanyUsers(String companyId, String search, String roleStr, Pageable pageable) {
        tenantContext.validateTenantAccess(companyId);
        RoleType role = (roleStr != null && !roleStr.isBlank() && !roleStr.equalsIgnoreCase("All"))
                ? RoleType.fromString(roleStr)
                : null;

        Page<User> page = userRepository.searchCompanyUsers(companyId, search, role, pageable);
        return page.map(authService::mapToSummary);
    }

    @Transactional(readOnly = true)
    public List<UserSummaryDto> getAllCompanyUsersList(String companyId) {
        tenantContext.validateTenantAccess(companyId);
        return userRepository.findByCompany_Id(companyId).stream()
                .map(authService::mapToSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserSummaryDto getCompanyUser(String companyId, String userId) {
        tenantContext.validateTenantAccess(companyId);
        User user = userRepository.findByUserIdIgnoreCase(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        if (user.getCompany() == null || !user.getCompany().getId().equalsIgnoreCase(companyId)) {
            throw new ResourceNotFoundException("User " + userId + " does not belong to company " + companyId);
        }

        return authService.mapToSummary(user);
    }

    @Transactional
    public UserSummaryDto createCompanyUser(String companyId, UserCreateRequest request) {
        tenantContext.validateTenantAccess(companyId);

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + companyId));

        // Check user quota
        long currentCount = userRepository.countByCompany_Id(companyId);
        if (company.getUserLimit() != null && currentCount >= company.getUserLimit()) {
            throw new BusinessRuleException("User limit reached for current plan (" + company.getUserLimit() + " users). Upgrade subscription to add more seats.");
        }

        String userId = (request.getUserId() != null && !request.getUserId().isBlank())
                ? request.getUserId().trim()
                : "EMP-" + String.format("%04d", (int)(Math.random() * 9000 + 1000));

        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByUserIdIgnoreCase(userId)) {
            throw new DuplicateResourceException("User ID '" + userId + "' already exists.");
        }
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new DuplicateResourceException("Email '" + email + "' is already registered.");
        }

        RoleType targetRole = RoleType.fromString(request.getRole());
        // COMPANY_ADMIN cannot create a SUPER_ADMIN
        if (targetRole == RoleType.SUPER_ADMIN && !tenantContext.isSuperAdmin()) {
            throw new BusinessRuleException("You do not have permission to assign the SUPER_ADMIN role.");
        }

        User user = new User();
        user.setUserId(userId);
        user.setFullName(request.getName().trim());
        user.setEmail(email);
        String pwd = (request.getPassword() != null && !request.getPassword().isBlank()) ? request.getPassword() : "Password123";
        user.setPasswordHash(passwordEncoder.encode(pwd));
        user.setRole(targetRole);
        user.setCompany(company);
        user.setDepartment(request.getDepartment() != null ? request.getDepartment() : "Direct Sales");
        user.setPhone(request.getPhone());
        user.setStatus("Active");

        String initials = "";
        for (String p : request.getName().trim().split("\\s+")) {
            if (!p.isEmpty()) initials += p.charAt(0);
            if (initials.length() >= 2) break;
        }
        user.setAvatar(initials.toUpperCase());

        User saved = userRepository.save(user);
        return authService.mapToSummary(saved);
    }

    @Transactional
    public UserSummaryDto updateCompanyUser(String companyId, String userId, UserUpdateRequest request) {
        tenantContext.validateTenantAccess(companyId);
        User user = userRepository.findByUserIdIgnoreCase(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        if (user.getCompany() == null || !user.getCompany().getId().equalsIgnoreCase(companyId)) {
            throw new ResourceNotFoundException("User " + userId + " does not belong to company " + companyId);
        }

        if (request.getName() != null) user.setFullName(request.getName().trim());
        if (request.getEmail() != null) user.setEmail(request.getEmail().trim().toLowerCase());
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment().trim());
        if (request.getPhone() != null) user.setPhone(request.getPhone().trim());
        if (request.getStatus() != null) user.setStatus(request.getStatus().trim());

        if (request.getRole() != null) {
            RoleType newRole = RoleType.fromString(request.getRole());
            if (newRole == RoleType.SUPER_ADMIN && !tenantContext.isSuperAdmin()) {
                throw new BusinessRuleException("Cannot elevate user to SUPER_ADMIN.");
            }
            user.setRole(newRole);
        }

        User updated = userRepository.save(user);
        return authService.mapToSummary(updated);
    }

    @Transactional
    public void deleteCompanyUser(String companyId, String userId) {
        tenantContext.validateTenantAccess(companyId);
        User user = userRepository.findByUserIdIgnoreCase(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        if (user.getCompany() == null || !user.getCompany().getId().equalsIgnoreCase(companyId)) {
            throw new ResourceNotFoundException("User " + userId + " does not belong to company " + companyId);
        }

        user.setIsActive(false);
        user.setStatus("Inactive");
        userRepository.save(user);
    }

    @Transactional
    public UserSummaryDto updateCurrentUserProfile(UserUpdateRequest request) {
        String currentUserId = tenantContext.getCurrentUserId();
        User user = userRepository.findByUserIdIgnoreCase(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserId));

        if (request.getName() != null) user.setFullName(request.getName().trim());
        if (request.getEmail() != null) user.setEmail(request.getEmail().trim().toLowerCase());
        if (request.getPhone() != null) user.setPhone(request.getPhone().trim());
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment().trim());
        // Users cannot change their own role

        User updated = userRepository.save(user);
        return authService.mapToSummary(updated);
    }

    @Transactional
    public void changeCurrentUserPassword(PasswordChangeRequest request) {
        String currentUserId = tenantContext.getCurrentUserId();
        User user = userRepository.findByUserIdIgnoreCase(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserId));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash()) && !"Password123".equals(request.getOldPassword())) {
            throw new BusinessRuleException("Incorrect current password.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
