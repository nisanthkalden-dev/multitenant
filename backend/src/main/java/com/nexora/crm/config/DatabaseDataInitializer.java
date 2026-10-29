package com.nexora.crm.config;

import com.nexora.crm.entity.Company;
import com.nexora.crm.entity.RoleType;
import com.nexora.crm.entity.User;
import com.nexora.crm.repository.CompanyRepository;
import com.nexora.crm.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.nexora.crm.repository.SubscriptionPlanRepository;
import com.nexora.crm.repository.SubscriptionRepository;

@Configuration
public class DatabaseDataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DatabaseDataInitializer.class);

    @Bean
    public CommandLineRunner initDatabase(
            UserRepository userRepository,
            CompanyRepository companyRepository,
            SubscriptionRepository subscriptionRepository,
            SubscriptionPlanRepository subscriptionPlanRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            // 1. Ensure Platform Super Admin exists with valid BCrypt hash and NULL company
            User superAdmin = userRepository.findByEmailIgnoreCase("superadmin@nexora.com")
                    .or(() -> userRepository.findByUserIdIgnoreCase("superadmin"))
                    .orElse(null);

            if (superAdmin == null) {
                log.info("Seeding Super Admin user 'superadmin' (superadmin@nexora.com)...");
                superAdmin = new User();
                superAdmin.setUserId("superadmin");
                superAdmin.setFullName("Platform Super Admin");
                superAdmin.setEmail("superadmin@nexora.com");
                superAdmin.setPasswordHash(passwordEncoder.encode("SuperAdmin123!"));
                superAdmin.setRole(RoleType.SUPER_ADMIN);
                superAdmin.setCompany(null); // Explicitly NULL for platform super admin
                superAdmin.setDepartment("Platform Operations");
                superAdmin.setStatus("Active");
                superAdmin.setIsActive(true);
                superAdmin.setAvatar("SA");
                userRepository.save(superAdmin);
                log.info("Super Admin user successfully created.");
            } else {
                // Ensure role is SUPER_ADMIN, company is null, active is true, and password is valid BCrypt
                boolean updated = false;
                if (superAdmin.getCompany() != null) {
                    superAdmin.setCompany(null);
                    updated = true;
                }
                if (superAdmin.getRole() != RoleType.SUPER_ADMIN) {
                    superAdmin.setRole(RoleType.SUPER_ADMIN);
                    updated = true;
                }
                if (!Boolean.TRUE.equals(superAdmin.getIsActive())) {
                    superAdmin.setIsActive(true);
                    superAdmin.setStatus("Active");
                    updated = true;
                }
                // Ensure Super Admin has a valid BCrypt password hash. If empty or not BCrypt, seed "SuperAdmin123!"
                if (superAdmin.getPasswordHash() == null || superAdmin.getPasswordHash().isBlank()
                        || (!superAdmin.getPasswordHash().startsWith("$2a$") && !superAdmin.getPasswordHash().startsWith("$2b$") && !superAdmin.getPasswordHash().startsWith("$2y$"))) {
                    log.info("Setting Super Admin initial password hash to BCrypt('SuperAdmin123!')...");
                    superAdmin.setPasswordHash(passwordEncoder.encode("SuperAdmin123!"));
                    updated = true;
                }
                if (updated) {
                    userRepository.save(superAdmin);
                    log.info("Super Admin record verified and updated.");
                }
            }

            // 2. Ensure Default Demo Tenant Company COMP001 exists for company user tests/demo
            Company comp1 = companyRepository.findById("COMP001").orElseGet(() -> {
                log.info("Seeding default tenant company 'Acme Corporation' (COMP001)...");
                Company c = new Company("COMP001", "Acme Corporation");
                c.setWorkspace("acme.nexora.app");
                c.setDomain("acmecorp.com");
                c.setPlan("Growth");
                c.setBillingCycle("Monthly");
                c.setPrice("₹2,499 / mo");
                c.setStatus("Active");
                c.setIsActive(true);
                c.setUserLimit(20);
                c.setLogoColor("#4F46E5");
                return companyRepository.save(c);
            });

            // Ensure COMP001 has a corresponding subscription record in MySQL
            if (subscriptionRepository.findTopByCompany_IdOrderByCreatedAtDesc("COMP001").isEmpty()) {
                com.nexora.crm.entity.Subscription sub = new com.nexora.crm.entity.Subscription();
                sub.setId("sub-COMP001");
                sub.setCompany(comp1);
                sub.setPlanName(comp1.getPlan());
                sub.setBillingCycle(comp1.getBillingCycle());
                sub.setAmount(comp1.getPrice());
                sub.setStatus(comp1.getStatus());
                sub.setStartDate("Today");
                sub.setRenewalDate("Nov 24, 2026");
                sub.setAutoRenew(true);
                subscriptionRepository.save(sub);
            }

            // 3. Ensure Company Admin 'admin' exists for tenant COMP001
            User companyAdmin = userRepository.findByUserIdIgnoreCase("admin")
                    .or(() -> userRepository.findByEmailIgnoreCase("admin@acmecorp.com"))
                    .orElse(null);

            if (companyAdmin == null) {
                log.info("Seeding Company Admin 'admin' (admin@acmecorp.com)...");
                companyAdmin = new User();
                companyAdmin.setUserId("admin");
                companyAdmin.setFullName("Sarah Williams");
                companyAdmin.setEmail("admin@acmecorp.com");
                companyAdmin.setPasswordHash(passwordEncoder.encode("Password123"));
                companyAdmin.setRole(RoleType.COMPANY_ADMIN);
                companyAdmin.setCompany(comp1);
                companyAdmin.setDepartment("Executive Leadership");
                companyAdmin.setStatus("Active");
                companyAdmin.setIsActive(true);
                companyAdmin.setAvatar("SW");
                userRepository.save(companyAdmin);
            } else if (!passwordEncoder.matches("Password123", companyAdmin.getPasswordHash())) {
                companyAdmin.setPasswordHash(passwordEncoder.encode("Password123"));
                userRepository.save(companyAdmin);
            }

            // 4. Ensure Employee 'employee' exists for tenant COMP001
            User employee = userRepository.findByUserIdIgnoreCase("employee")
                    .or(() -> userRepository.findByEmailIgnoreCase("john.doe@acmecorp.com"))
                    .orElse(null);

            if (employee == null) {
                log.info("Seeding Employee 'employee' (john.doe@acmecorp.com)...");
                employee = new User();
                employee.setUserId("employee");
                employee.setFullName("John Doe");
                employee.setEmail("john.doe@acmecorp.com");
                employee.setPasswordHash(passwordEncoder.encode("Password123"));
                employee.setRole(RoleType.EMPLOYEE);
                employee.setCompany(comp1);
                employee.setDepartment("Direct Sales & BD");
                employee.setStatus("Active");
                employee.setIsActive(true);
                employee.setAvatar("JD");
                userRepository.save(employee);
            } else if (!passwordEncoder.matches("Password123", employee.getPasswordHash())) {
                employee.setPasswordHash(passwordEncoder.encode("Password123"));
                userRepository.save(employee);
            }
        };
    }
}
