package com.nexora.crm.service;

import com.nexora.crm.dto.auth.*;
import com.nexora.crm.entity.Company;
import com.nexora.crm.entity.RoleType;
import com.nexora.crm.entity.User;
import com.nexora.crm.exception.BusinessRuleException;
import com.nexora.crm.exception.DuplicateResourceException;
import com.nexora.crm.exception.ResourceNotFoundException;
import com.nexora.crm.repository.CompanyRepository;
import com.nexora.crm.repository.UserRepository;
import com.nexora.crm.security.CustomUserDetails;
import com.nexora.crm.security.JwtService;
import com.nexora.crm.security.TenantContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TenantContext tenantContext;

    public AuthService(
            UserRepository userRepository,
            CompanyRepository companyRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            TenantContext tenantContext
    ) {
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.tenantContext = tenantContext;
    }

    /**
     * Dedicated SUPER_ADMIN login endpoint logic (POST /api/super-admin/login)
     * - Does NOT require tenant/company information
     * - Validates email and password using BCrypt
     * - Verifies role is SUPER_ADMIN
     * - Returns both ACCESS token and REFRESH token
     */
    @Transactional
    public AuthTokenResponse superAdminLogin(SuperAdminLoginRequest request) {
        if (request == null || request.getEmail() == null || request.getPassword() == null) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String input = request.getEmail() != null ? request.getEmail().trim() : "";
        if (input.isEmpty() && request.getUserId() != null) {
            input = request.getUserId().trim();
        }
        final String identifier = input;
        final String lowerEmail = identifier.toLowerCase();

        User user = userRepository.findByEmailIgnoreCase(lowerEmail)
                .or(() -> userRepository.findByUserIdIgnoreCase(identifier))
                .or(() -> {
                    // Normalize frontend placeholder domain @nexora.app to @nexora.com
                    if (lowerEmail.endsWith("@nexora.app")) {
                        String altEmail = lowerEmail.replace("@nexora.app", "@nexora.com");
                        return userRepository.findByEmailIgnoreCase(altEmail);
                    } else if (lowerEmail.endsWith("@nexora.com")) {
                        String altEmail = lowerEmail.replace("@nexora.com", "@nexora.app");
                        return userRepository.findByEmailIgnoreCase(altEmail);
                    }
                    return java.util.Optional.empty();
                })
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        // Verify account is active
        if (!Boolean.TRUE.equals(user.getIsActive()) || "Inactive".equalsIgnoreCase(user.getStatus())) {
            throw new BadCredentialsException("Account is deactivated. Please contact platform support.");
        }

        // Verify BCrypt password
        verifyPassword(request.getPassword(), user.getPasswordHash());

        // Strictly verify user role is SUPER_ADMIN
        if (user.getRole() != RoleType.SUPER_ADMIN) {
            log.warn("Non-superadmin user '{}' attempted Super Admin login", user.getEmail());
            throw new BadCredentialsException("Access denied: Not a platform Super Admin account");
        }

        // Generate Access and Refresh tokens
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        UserSummaryDto userSummary = mapToSummary(user);

        return new AuthTokenResponse(accessToken, refreshToken, "Bearer");
    }

    /**
     * General / Company User Login (POST /api/auth/login)
     */
    @Transactional
    public AuthResponse login(LoginRequest request) {
        String id = request.getUserId() != null ? request.getUserId().trim() : "";
        if (id.isEmpty() && request.getEmail() != null) {
            id = request.getEmail().trim();
        }

        if (id.isEmpty() || request.getPassword() == null) {
            throw new BadCredentialsException("Invalid email or password");
        }

        final String finalIdentifier = id;
        User user = userRepository.findByUserIdIgnoreCase(finalIdentifier)
                .or(() -> userRepository.findByEmailIgnoreCase(finalIdentifier))
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        // Verify account active status
        if (!Boolean.TRUE.equals(user.getIsActive()) || "Inactive".equalsIgnoreCase(user.getStatus())) {
            throw new BadCredentialsException("Account is deactivated. Please contact support.");
        }

        // Verify company active status for company users
        boolean isSuperAdmin = user.getRole() == RoleType.SUPER_ADMIN;
        if (!isSuperAdmin) {
            Company company = user.getCompany();
            if (company == null || !Boolean.TRUE.equals(company.getIsActive()) || "Suspended".equalsIgnoreCase(company.getStatus())) {
                log.warn("Login rejected for user '{}': Company '{}' is suspended or inactive", user.getEmail(), company != null ? company.getId() : "null");
                throw new BadCredentialsException("Your company account is suspended. Please contact the administrator.");
            }
        }

        // Verify BCrypt password
        verifyPassword(request.getPassword(), user.getPasswordHash());

        // Check loginType if specified
        if ("super_admin".equalsIgnoreCase(request.getLoginType()) && !isSuperAdmin) {
            throw new BusinessRuleException("This account does not have Super Admin platform privileges. Please use Company login.");
        }
        if ("company".equalsIgnoreCase(request.getLoginType()) && isSuperAdmin) {
            throw new BusinessRuleException("Super Admin accounts must use the Super Admin login.");
        }

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        long expiresIn = jwtService.getAccessExpirationSeconds();
        UserSummaryDto userSummary = mapToSummary(user);

        return new AuthResponse(
                true,
                "Login successful",
                accessToken,
                refreshToken,
                expiresIn,
                userSummary
        );
    }

    /**
     * Stateless Refresh Token Flow (POST /api/auth/refresh)
     * - Validates refresh token signature using the dedicated refresh-signing key
     * - Checks token expiration
     * - Verifies tokenType == REFRESH (rejects ACCESS tokens)
     * - Extracts user ID from claims
     * - Loads user from database users table
     * - Verifies user exists and is active
     * - Generates new access token (and new refresh token for seamless rotation without DB storage)
     * - Returns clean AuthTokenResponse without database persistence
     */
    @Transactional(readOnly = true)
    public AuthTokenResponse refreshToken(RefreshTokenRequest request) {
        if (request == null || request.getRefreshToken() == null || request.getRefreshToken().isBlank()) {
            throw new BadCredentialsException("Refresh token is required");
        }

        String rawRefreshToken = request.getRefreshToken().trim();

        // 1. Validate JWT structure, signature, expiration, and tokenType == REFRESH
        if (!jwtService.validateRefreshToken(rawRefreshToken)) {
            throw new BadCredentialsException("Invalid or expired refresh token");
        }

        // 2. Extract user ID and subject from refresh token claims
        Long userId = jwtService.extractRefreshUserId(rawRefreshToken);
        String email = jwtService.extractRefreshSubject(rawRefreshToken);

        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }
        if (user == null && email != null && !email.isBlank()) {
            user = userRepository.findByEmailIgnoreCase(email).orElse(null);
        }

        if (user == null) {
            throw new BadCredentialsException("Invalid or expired refresh token");
        }

        // 3. Verify user active status
        if (!Boolean.TRUE.equals(user.getIsActive()) || "Inactive".equalsIgnoreCase(user.getStatus())) {
            throw new BadCredentialsException("Account is deactivated. Please contact support.");
        }

        // Verify company active status for company users
        if (user.getRole() != RoleType.SUPER_ADMIN) {
            Company company = user.getCompany();
            if (company == null || !Boolean.TRUE.equals(company.getIsActive()) || "Suspended".equalsIgnoreCase(company.getStatus())) {
                log.warn("Refresh token rejected for user '{}': Company '{}' is suspended or inactive", user.getEmail(), company != null ? company.getId() : "null");
                throw new BadCredentialsException("Your company account is suspended. Please contact the administrator.");
            }
        }

        // 4. Generate new Access Token and new Refresh Token statelessly
        String newAccessToken = jwtService.generateAccessToken(user);
        String newRefreshToken = jwtService.generateRefreshToken(user);

        return new AuthTokenResponse(
                newAccessToken,
                newRefreshToken,
                "Bearer"
        );
    }

    /**
     * Helper to verify password using BCrypt.
     * Also gracefully handles plain-text password fallback if migrating an unhashed password.
     */
    private void verifyPassword(String rawPassword, String storedHash) {
        if (storedHash == null || rawPassword == null) {
            throw new BadCredentialsException("Invalid email or password");
        }

        // Check if storedHash is a standard BCrypt hash ($2a$, $2b$, $2y$)
        if (storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$") || storedHash.startsWith("$2y$")) {
            if (!passwordEncoder.matches(rawPassword, storedHash)) {
                throw new BadCredentialsException("Invalid email or password");
            }
        } else {
            // Handle corrupted or legacy plain text password gracefully without throwing 500
            log.warn("Encountered non-BCrypt password format in database. Performing safe comparison.");
            if (!rawPassword.equals(storedHash)) {
                throw new BadCredentialsException("Invalid email or password");
            }
        }
    }

    @Transactional
    public UserSummaryDto register(RegisterRequest request) {
        String userId = request.getUserId().trim();
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByUserIdIgnoreCase(userId)) {
            throw new DuplicateResourceException("User ID already exists. Please choose a different User ID.");
        }

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new DuplicateResourceException("Email address already registered. Please log in.");
        }

        if (request.getConfirmPassword() != null && !request.getPassword().equals(request.getConfirmPassword())) {
            throw new BusinessRuleException("Password and confirm password do not match.");
        }

        User user = new User();
        user.setUserId(userId);
        user.setFullName(request.getFullName().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        // Resolve or create default company
        String companyId = request.getCompanyId() != null ? request.getCompanyId().trim() : "COMP001";
        Company company = companyRepository.findById(companyId).orElseGet(() -> {
            Company newComp = new Company(companyId, request.getCompanyName() != null ? request.getCompanyName() : "Acme Corporation");
            newComp.setWorkspace(newComp.getName().toLowerCase().replaceAll("[^a-z0-9]", "") + ".nexora.app");
            return companyRepository.save(newComp);
        });

        // Enforce plan user limit quota
        long currentCount = userRepository.countByCompany_Id(company.getId());
        if (company.getUserLimit() != null && currentCount >= company.getUserLimit()) {
            throw new BusinessRuleException("User limit reached for current plan (" + company.getUserLimit() + " users). Upgrade subscription to add more seats.");
        }

        user.setCompany(company);
        user.setRole(RoleType.COMPANY_ADMIN);
        user.setStatus("Active");
        user.setIsActive(true);
        user.setDepartment("Executive Leadership");

        String initials = "";
        String[] parts = request.getFullName().trim().split("\\s+");
        for (String p : parts) {
            if (!p.isEmpty()) initials += p.charAt(0);
            if (initials.length() >= 2) break;
        }
        user.setAvatar(initials.toUpperCase());

        User saved = userRepository.save(user);
        return mapToSummary(saved);
    }

    @Transactional(readOnly = true)
    public UserSummaryDto getCurrentUser() {
        CustomUserDetails userDetails = tenantContext.getCurrentUserDetails();
        if (userDetails == null) {
            throw new ResourceNotFoundException("No authenticated user session found");
        }

        User user = userRepository.findByEmailIgnoreCase(userDetails.getEmail())
                .or(() -> userRepository.findByUserIdIgnoreCase(userDetails.getUserId()))
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userDetails.getUsername()));

        return mapToSummary(user);
    }

    public UserSummaryDto mapToSummary(User user) {
        UserSummaryDto dto = new UserSummaryDto();
        dto.setId(user.getId());
        dto.setUserId(user.getUserId());
        dto.setName(user.getFullName());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        // Map role in lowercase for frontend compatibility: "super_admin", "company_admin", etc.
        dto.setRole(user.getRole().name().toLowerCase());
        dto.setCompanyId(user.getCompany() != null ? user.getCompany().getId() : null);
        dto.setCompanyName(user.getCompany() != null ? user.getCompany().getName() : (user.getRole() == RoleType.SUPER_ADMIN ? "Nexora Platform" : null));
        dto.setWorkspace(user.getCompany() != null ? user.getCompany().getWorkspace() : "nexora.app");
        dto.setAvatar(user.getAvatar());
        dto.setDepartment(user.getDepartment());
        dto.setPhone(user.getPhone());
        dto.setStatus(user.getStatus());
        return dto;
    }
}
