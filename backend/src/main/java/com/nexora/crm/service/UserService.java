package com.nexora.crm.service;

import com.nexora.crm.dto.auth.UserSummaryDto;
import com.nexora.crm.dto.user.EmployeeDetailsDto;
import com.nexora.crm.dto.user.PasswordChangeRequest;
import com.nexora.crm.dto.user.UserCreateRequest;
import com.nexora.crm.dto.user.UserUpdateRequest;
import com.nexora.crm.entity.*;
import com.nexora.crm.exception.BusinessRuleException;
import com.nexora.crm.exception.DuplicateResourceException;
import com.nexora.crm.exception.ResourceNotFoundException;
import com.nexora.crm.repository.*;
import com.nexora.crm.security.CustomUserDetails;
import com.nexora.crm.security.TenantContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final CustomerRepository customerRepository;
    private final LeadRepository leadRepository;
    private final TaskRepository taskRepository;
    private final ActivityRepository activityRepository;
    private final PasswordEncoder passwordEncoder;
    private final TenantContext tenantContext;
    private final AuthService authService;

    public UserService(
            UserRepository userRepository,
            CompanyRepository companyRepository,
            CustomerRepository customerRepository,
            LeadRepository leadRepository,
            TaskRepository taskRepository,
            ActivityRepository activityRepository,
            PasswordEncoder passwordEncoder,
            TenantContext tenantContext,
            AuthService authService
    ) {
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.customerRepository = customerRepository;
        this.leadRepository = leadRepository;
        this.taskRepository = taskRepository;
        this.activityRepository = activityRepository;
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
        return page.map(this::mapUserToSummaryWithManager);
    }

    @Transactional(readOnly = true)
    public Page<UserSummaryDto> searchCompanyEmployees(
            String search,
            String roleStr,
            String department,
            String status,
            String managerId,
            Pageable pageable
    ) {
        String companyId = tenantContext.getCurrentCompanyId();
        if (companyId == null) {
            throw new ResourceNotFoundException("No company associated with current user session.");
        }

        RoleType role = (roleStr != null && !roleStr.isBlank() && !roleStr.equalsIgnoreCase("All"))
                ? RoleType.fromString(roleStr)
                : null;

        Page<User> page = userRepository.searchCompanyEmployees(
                companyId,
                search != null && !search.isBlank() ? search.trim() : null,
                role,
                department != null && !department.isBlank() ? department.trim() : null,
                status != null && !status.isBlank() ? status.trim() : null,
                managerId != null && !managerId.isBlank() ? managerId.trim() : null,
                pageable
        );

        return page.map(this::mapUserToSummaryWithManager);
    }

    @Transactional(readOnly = true)
    public List<UserSummaryDto> getAllCompanyUsersList(String companyId) {
        tenantContext.validateTenantAccess(companyId);
        return userRepository.findByCompany_Id(companyId).stream()
                .map(this::mapUserToSummaryWithManager)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserSummaryDto getCompanyUser(String companyId, String userId) {
        tenantContext.validateTenantAccess(companyId);
        User user = findUserByIdOrUserId(userId);

        if (user.getCompany() == null || !user.getCompany().getId().equalsIgnoreCase(companyId)) {
            throw new ResourceNotFoundException("User " + userId + " does not belong to company " + companyId);
        }

        return mapUserToSummaryWithManager(user);
    }

    @Transactional(readOnly = true)
    public EmployeeDetailsDto getEmployeeDetails(String employeeIdOrUserId) {
        String companyId = tenantContext.getCurrentCompanyId();
        if (companyId == null) {
            throw new ResourceNotFoundException("No company context found.");
        }

        User user = findUserByIdOrUserId(employeeIdOrUserId);
        if (user.getCompany() == null || !user.getCompany().getId().equalsIgnoreCase(companyId)) {
            throw new ResourceNotFoundException("Employee not found in your organization: " + employeeIdOrUserId);
        }

        EmployeeDetailsDto dto = new EmployeeDetailsDto();
        dto.setId(user.getId());
        dto.setUserId(user.getUserId());
        dto.setName(user.getFullName());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name().toLowerCase());
        dto.setCompanyId(companyId);
        dto.setCompanyName(user.getCompany() != null ? user.getCompany().getName() : null);
        dto.setWorkspace(user.getCompany() != null ? user.getCompany().getWorkspace() : null);
        dto.setAvatar(user.getAvatar());
        dto.setDepartment(user.getDepartment());
        dto.setPhone(user.getPhone());
        dto.setManagerId(user.getManagerId());
        if (user.getManagerId() != null && !user.getManagerId().isBlank()) {
            userRepository.findByUserIdIgnoreCase(user.getManagerId())
                    .ifPresent(m -> dto.setManagerName(m.getFullName()));
        }
        dto.setJoiningDate(user.getJoiningDate());
        dto.setStatus(user.getStatus());
        dto.setCreatedAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);

        // Populate CRM Relationships
        List<Map<String, Object>> customersList = new ArrayList<>();
        List<Customer> allCustomers = customerRepository.findByCompany_Id(companyId);
        for (Customer c : allCustomers) {
            if (isAssignedToUser(c.getAssignedTo(), user)) {
                Map<String, Object> cMap = new HashMap<>();
                cMap.put("id", c.getId());
                cMap.put("name", c.getName());
                cMap.put("contactPerson", c.getContactPerson());
                cMap.put("email", c.getEmail());
                cMap.put("phone", c.getPhone());
                cMap.put("industry", c.getIndustry());
                cMap.put("status", c.getStatus());
                cMap.put("tier", c.getTier());
                cMap.put("contractValue", c.getContractValue());
                customersList.add(cMap);
            }
        }
        dto.setAssignedCustomers(customersList);

        List<Map<String, Object>> leadsList = new ArrayList<>();
        List<Lead> allLeads = leadRepository.findByCompany_Id(companyId);
        for (Lead l : allLeads) {
            if (isAssignedToUser(l.getAssignedTo(), user)) {
                Map<String, Object> lMap = new HashMap<>();
                lMap.put("id", l.getId());
                lMap.put("title", l.getTitle());
                lMap.put("companyName", l.getCompanyName());
                lMap.put("contactName", l.getContactName());
                lMap.put("stage", l.getStage());
                lMap.put("priority", l.getPriority());
                lMap.put("estimatedValue", l.getEstimatedValue());
                leadsList.add(lMap);
            }
        }
        dto.setAssignedLeads(leadsList);

        List<Map<String, Object>> tasksList = new ArrayList<>();
        List<Task> allTasks = taskRepository.findByCompany_Id(companyId);
        for (Task t : allTasks) {
            if (isAssignedToUser(t.getAssignedTo(), user)) {
                Map<String, Object> tMap = new HashMap<>();
                tMap.put("id", t.getId());
                tMap.put("title", t.getTitle());
                tMap.put("description", t.getDescription());
                tMap.put("dueDate", t.getDueDate());
                tMap.put("priority", t.getPriority());
                tMap.put("status", t.getStatus());
                tMap.put("category", t.getCategory());
                tasksList.add(tMap);
            }
        }
        dto.setAssignedTasks(tasksList);

        List<Map<String, Object>> activitiesList = new ArrayList<>();
        List<Activity> employeeActivities = activityRepository.findTop10ByCompany_IdAndUserIdOrderByCreatedAtDesc(companyId, user.getUserId());
        for (Activity a : employeeActivities) {
            Map<String, Object> aMap = new HashMap<>();
            aMap.put("id", a.getId());
            aMap.put("action", a.getAction());
            aMap.put("target", a.getTarget());
            aMap.put("type", a.getActivityType());
            aMap.put("createdAt", a.getCreatedAt() != null ? a.getCreatedAt().toString() : "Recently");
            activitiesList.add(aMap);
        }
        dto.setRecentActivities(activitiesList);

        return dto;
    }

    private boolean isAssignedToUser(String assignedTo, User user) {
        if (assignedTo == null || assignedTo.isBlank()) return false;
        String val = assignedTo.trim();
        return val.equalsIgnoreCase(user.getUserId()) ||
               val.equalsIgnoreCase(user.getFullName()) ||
               (user.getId() != null && val.equalsIgnoreCase(String.valueOf(user.getId())));
    }

    @Transactional
    public UserSummaryDto createCompanyUser(String companyId, UserCreateRequest request) {
        tenantContext.validateTenantAccess(companyId);

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + companyId));

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
        if (targetRole == RoleType.SUPER_ADMIN && !tenantContext.isSuperAdmin()) {
            throw new BusinessRuleException("You do not have permission to assign the SUPER_ADMIN role.");
        }

        User user = new User();
        user.setUserId(userId);
        user.setFullName(request.getName() != null ? request.getName().trim() : "Employee");
        user.setEmail(email);
        String pwd = (request.getPassword() != null && !request.getPassword().isBlank()) ? request.getPassword() : "Password123";
        user.setPasswordHash(passwordEncoder.encode(pwd));
        user.setRole(targetRole);
        user.setCompany(company);
        user.setDepartment(request.getDepartment() != null ? request.getDepartment().trim() : "Direct Sales");
        user.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        user.setManagerId(request.getManagerId() != null && !request.getManagerId().isBlank() ? request.getManagerId().trim() : null);
        user.setJoiningDate(request.getJoiningDate() != null && !request.getJoiningDate().isBlank() ? request.getJoiningDate().trim() : null);

        String initialStatus = (request.getStatus() != null && !request.getStatus().isBlank())
                ? request.getStatus().trim()
                : "Active";
        user.setStatus(initialStatus);
        user.setIsActive(!"Inactive".equalsIgnoreCase(initialStatus));

        String initials = "";
        for (String p : user.getFullName().split("\\s+")) {
            if (!p.isEmpty()) initials += p.charAt(0);
            if (initials.length() >= 2) break;
        }
        user.setAvatar(initials.toUpperCase());

        User saved = userRepository.save(user);

        recordActivity(company, "Added new employee " + saved.getFullName() + " (" + saved.getUserId() + ")", saved.getUserId(), "employee_created");

        return mapUserToSummaryWithManager(saved);
    }

    @Transactional
    public UserSummaryDto updateCompanyUser(String companyId, String userId, UserUpdateRequest request) {
        tenantContext.validateTenantAccess(companyId);
        User user = findUserByIdOrUserId(userId);

        if (user.getCompany() == null || !user.getCompany().getId().equalsIgnoreCase(companyId)) {
            throw new ResourceNotFoundException("User " + userId + " does not belong to company " + companyId);
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setFullName(request.getName().trim());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String newEmail = request.getEmail().trim().toLowerCase();
            if (!newEmail.equalsIgnoreCase(user.getEmail()) && userRepository.existsByEmailIgnoreCase(newEmail)) {
                throw new DuplicateResourceException("Email '" + newEmail + "' is already in use.");
            }
            user.setEmail(newEmail);
        }
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment().trim());
        if (request.getPhone() != null) user.setPhone(request.getPhone().trim());
        if (request.getManagerId() != null) user.setManagerId(request.getManagerId().trim());
        if (request.getJoiningDate() != null) user.setJoiningDate(request.getJoiningDate().trim());

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            String newStatus = request.getStatus().trim();
            user.setStatus(newStatus);
            user.setIsActive(!"Inactive".equalsIgnoreCase(newStatus));
        }

        if (request.getRole() != null && !request.getRole().isBlank()) {
            RoleType newRole = RoleType.fromString(request.getRole());
            if (newRole == RoleType.SUPER_ADMIN && !tenantContext.isSuperAdmin()) {
                throw new BusinessRuleException("Cannot elevate user to SUPER_ADMIN.");
            }
            user.setRole(newRole);
        }

        User updated = userRepository.save(user);

        recordActivity(user.getCompany(), "Updated employee details for " + updated.getFullName(), updated.getUserId(), "employee_updated");

        return mapUserToSummaryWithManager(updated);
    }

    @Transactional
    public UserSummaryDto updateEmployeeStatus(String employeeId, String newStatus) {
        String companyId = tenantContext.getCurrentCompanyId();
        if (companyId == null) {
            throw new ResourceNotFoundException("No company context found.");
        }

        User user = findUserByIdOrUserId(employeeId);
        if (user.getCompany() == null || !user.getCompany().getId().equalsIgnoreCase(companyId)) {
            throw new ResourceNotFoundException("Employee " + employeeId + " does not belong to company " + companyId);
        }

        String normalizedStatus = "Inactive".equalsIgnoreCase(newStatus) ? "Inactive" : "Active";
        user.setStatus(normalizedStatus);
        user.setIsActive("Active".equalsIgnoreCase(normalizedStatus));
        User updated = userRepository.save(user);

        recordActivity(user.getCompany(),
                ("Active".equalsIgnoreCase(normalizedStatus) ? "Activated" : "Deactivated") + " employee account: " + updated.getFullName(),
                updated.getUserId(),
                "employee_status_changed");

        return mapUserToSummaryWithManager(updated);
    }

    @Transactional
    public void deleteCompanyUser(String companyId, String userId) {
        tenantContext.validateTenantAccess(companyId);
        User user = findUserByIdOrUserId(userId);

        if (user.getCompany() == null || !user.getCompany().getId().equalsIgnoreCase(companyId)) {
            throw new ResourceNotFoundException("User " + userId + " does not belong to company " + companyId);
        }

        user.setIsActive(false);
        user.setStatus("Inactive");
        userRepository.save(user);

        recordActivity(user.getCompany(), "Deactivated employee " + user.getFullName(), user.getUserId(), "employee_deactivated");
    }

    @Transactional
    public UserSummaryDto updateCurrentUserProfile(UserUpdateRequest request) {
        CustomUserDetails userDetails = tenantContext.getCurrentUserDetails();
        if (userDetails == null) {
            throw new ResourceNotFoundException("No authenticated security context found.");
        }

        User user = null;
        if (userDetails.getEmail() != null && !userDetails.getEmail().isBlank()) {
            user = userRepository.findByEmailIgnoreCase(userDetails.getEmail()).orElse(null);
        }
        if (user == null && userDetails.getUserId() != null && !userDetails.getUserId().isBlank()) {
            user = userRepository.findByUserIdIgnoreCase(userDetails.getUserId()).orElse(null);
        }
        if (user == null && userDetails.getId() != null) {
            user = userRepository.findById(userDetails.getId()).orElse(null);
        }

        if (user == null) {
            throw new ResourceNotFoundException("Authenticated user not found in database");
        }

        if (request.getName() != null && !request.getName().trim().isBlank()) {
            user.setFullName(request.getName().trim());
        }
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment().trim());
        if (request.getPhone() != null) user.setPhone(request.getPhone().trim());
        if (request.getAvatar() != null) user.setAvatar(request.getAvatar());

        User updated = userRepository.save(user);
        return mapUserToSummaryWithManager(updated);
    }

    @Transactional
    public void changeCurrentUserPassword(PasswordChangeRequest request) {
        CustomUserDetails userDetails = tenantContext.getCurrentUserDetails();
        if (userDetails == null) {
            throw new ResourceNotFoundException("No authenticated security context found.");
        }

        User user = userRepository.findByEmailIgnoreCase(userDetails.getEmail())
                .or(() -> userRepository.findByUserIdIgnoreCase(userDetails.getUserId()))
                .orElseThrow(() -> new ResourceNotFoundException("User not found in database."));

        if (!Boolean.TRUE.equals(user.getIsActive()) || "Inactive".equalsIgnoreCase(user.getStatus())) {
            throw new BusinessRuleException("Account is deactivated. Cannot change password.");
        }

        String currentPassword = request.getCurrentPassword() != null ? request.getCurrentPassword().trim() : "";
        String newPassword = request.getNewPassword() != null ? request.getNewPassword().trim() : "";

        if (newPassword.length() < 6) {
            throw new BusinessRuleException("New password must be at least 6 characters.");
        }

        if (newPassword.equals(currentPassword)) {
            throw new BusinessRuleException("New password cannot be the same as the current password.");
        }

        boolean matches = passwordEncoder.matches(currentPassword, user.getPasswordHash());
        if (!matches && currentPassword.equals(user.getPasswordHash())) {
            matches = true;
        }

        if (!matches) {
            throw new BusinessRuleException("Incorrect current password.");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.saveAndFlush(user);
    }

    @Transactional
    public UserSummaryDto removeCurrentUserAvatar() {
        CustomUserDetails userDetails = tenantContext.getCurrentUserDetails();
        if (userDetails == null) {
            throw new ResourceNotFoundException("No authenticated security context found.");
        }

        User user = userRepository.findByEmailIgnoreCase(userDetails.getEmail())
                .or(() -> userRepository.findByUserIdIgnoreCase(userDetails.getUserId()))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String initials = "";
        for (String p : user.getFullName().split("\\s+")) {
            if (!p.isEmpty()) initials += p.charAt(0);
            if (initials.length() >= 2) break;
        }
        user.setAvatar(initials.toUpperCase());
        User saved = userRepository.save(user);
        return mapUserToSummaryWithManager(saved);
    }

    private User findUserByIdOrUserId(String idOrUserId) {
        try {
            Long numericId = Long.parseLong(idOrUserId);
            Optional<User> byId = userRepository.findById(numericId);
            if (byId.isPresent()) return byId.get();
        } catch (NumberFormatException ignored) {}

        return userRepository.findByUserIdIgnoreCase(idOrUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee/User not found: " + idOrUserId));
    }

    private UserSummaryDto mapUserToSummaryWithManager(User user) {
        UserSummaryDto dto = authService.mapToSummary(user);
        dto.setManagerId(user.getManagerId());
        dto.setJoiningDate(user.getJoiningDate());
        dto.setCreatedAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);

        if (user.getManagerId() != null && !user.getManagerId().isBlank()) {
            userRepository.findByUserIdIgnoreCase(user.getManagerId())
                    .ifPresent(m -> dto.setManagerName(m.getFullName()));
        }
        return dto;
    }

    private void recordActivity(Company company, String action, String target, String type) {
        try {
            Activity act = new Activity();
            act.setId("ACT-" + System.currentTimeMillis());
            act.setCompany(company);
            act.setUserId(tenantContext.getCurrentUserId() != null ? tenantContext.getCurrentUserId() : "SYSTEM");
            act.setUserName(tenantContext.getCurrentUserDetails() != null ? tenantContext.getCurrentUserDetails().getFullName() : "Admin");
            act.setUserRole(tenantContext.getCurrentRole() != null ? tenantContext.getCurrentRole().name() : "COMPANY_ADMIN");
            act.setAction(action);
            act.setTarget(target);
            act.setActivityType(type);
            activityRepository.save(act);
        } catch (Exception ignored) {}
    }
}
