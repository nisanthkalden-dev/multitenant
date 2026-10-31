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
                // Ensure Super Admin has valid BCrypt password hash matching "SuperAdmin123!"
                if (superAdmin.getPasswordHash() == null || superAdmin.getPasswordHash().isBlank()
                        || !passwordEncoder.matches("SuperAdmin123!", superAdmin.getPasswordHash())) {
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
                c.setPrice("₹2,499");
                c.setStatus("Active");
                c.setIsActive(true);
                c.setUserLimit(20);
                c.setLogoColor("#4F46E5");
                return companyRepository.save(c);
            });
            if (comp1.getPrice() != null && comp1.getPrice().contains("/ mo")) {
                comp1.setPrice("₹2,499");
                companyRepository.save(comp1);
            }
            if (!"Active".equalsIgnoreCase(comp1.getStatus()) || !Boolean.TRUE.equals(comp1.getIsActive())) {
                comp1.setStatus("Active");
                comp1.setIsActive(true);
                companyRepository.save(comp1);
            }

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

            // 3b. Ensure Manager 'manager' exists for tenant COMP001
            User manager = userRepository.findByUserIdIgnoreCase("manager")
                    .or(() -> userRepository.findByEmailIgnoreCase("manager@acmecorp.com"))
                    .orElse(null);

            if (manager == null) {
                log.info("Seeding Manager 'manager' (manager@acmecorp.com)...");
                manager = new User();
                manager.setUserId("manager");
                manager.setFullName("Marcus Vance");
                manager.setEmail("manager@acmecorp.com");
                manager.setPasswordHash(passwordEncoder.encode("Password123"));
                manager.setRole(RoleType.MANAGER);
                manager.setCompany(comp1);
                manager.setDepartment("Regional Sales");
                manager.setStatus("Active");
                manager.setIsActive(true);
                manager.setAvatar("MV");
                userRepository.save(manager);
            } else if (!passwordEncoder.matches("Password123", manager.getPasswordHash())) {
                manager.setPasswordHash(passwordEncoder.encode("Password123"));
                userRepository.save(manager);
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

            // 5. Ensure Uchiha Tech COMP005 exists with Status = Suspended and Madara as Admin
            Company uchiha = companyRepository.findById("COMP005").orElseGet(() -> {
                log.info("Seeding company 'Uchiha Tech' (COMP005) with status 'Suspended'...");
                Company u = new Company("COMP005", "Uchiha Tech");
                u.setWorkspace("uchihatech.nexora.app");
                u.setDomain("uchihatech.com");
                u.setPlan("Growth");
                u.setBillingCycle("Monthly");
                u.setPrice("₹2,499");
                u.setStatus("Suspended");
                u.setIsActive(false);
                u.setUserLimit(25);
                u.setLogoColor("#DC2626");
                return companyRepository.save(u);
            });

            if (subscriptionRepository.findTopByCompany_IdOrderByCreatedAtDesc("COMP005").isEmpty()) {
                com.nexora.crm.entity.Subscription subU = new com.nexora.crm.entity.Subscription();
                subU.setId("sub-COMP005");
                subU.setCompany(uchiha);
                subU.setPlanName(uchiha.getPlan());
                subU.setBillingCycle(uchiha.getBillingCycle());
                subU.setAmount(uchiha.getPrice());
                subU.setStatus("Suspended");
                subU.setStartDate("Oct 01, 2026");
                subU.setRenewalDate("Nov 01, 2026");
                subU.setAutoRenew(false);
                subscriptionRepository.save(subU);
            }

            User madara = userRepository.findByEmailIgnoreCase("madara@uchihatech.in")
                    .or(() -> userRepository.findByUserIdIgnoreCase("madara"))
                    .orElse(null);

            if (madara == null) {
                log.info("Seeding Uchiha Tech Admin 'madara' (madara@uchihatech.in)...");
                madara = new User();
                madara.setUserId("madara");
                madara.setFullName("Madara Uchiha");
                madara.setEmail("madara@uchihatech.in");
                madara.setPasswordHash(passwordEncoder.encode("Password123"));
                madara.setRole(RoleType.COMPANY_ADMIN);
                madara.setCompany(uchiha);
                madara.setDepartment("Executive Leadership");
                madara.setStatus("Active");
                madara.setIsActive(true);
                madara.setAvatar("MU");
                userRepository.save(madara);
            } else {
                if (madara.getCompany() == null || !madara.getCompany().getId().equals("COMP005")) {
                    madara.setCompany(uchiha);
                    userRepository.save(madara);
                }
                if (!passwordEncoder.matches("Password123", madara.getPasswordHash())) {
                    madara.setPasswordHash(passwordEncoder.encode("Password123"));
                    userRepository.save(madara);
                }
            }

            // 6. Ensure default subscription plans exist in subscription_plans table if empty
            if (subscriptionPlanRepository.count() == 0) {
                log.info("Seeding default subscription plans into subscription_plans table...");
                com.nexora.crm.entity.SubscriptionPlan starter = new com.nexora.crm.entity.SubscriptionPlan();
                starter.setId("plan-starter");
                starter.setName("Starter");
                starter.setTypeTag("ENTRY");
                starter.setSubtitle("For small teams getting started with structured customer management.");
                starter.setMonthlyPrice(new java.math.BigDecimal("999.00"));
                starter.setAnnualPrice(new java.math.BigDecimal("9588.00"));
                starter.setPriceDisplay("₹999");
                starter.setUserLimitText("5 Team Members");
                starter.setUserLimit(5);
                starter.setIsPopular(false);
                starter.setBadgeColor("#64748b");
                starter.setFeatures("5 Team Members\n1 Workspace\nLead Management\nContact Management\nSales Pipeline\nTasks & Reminders\nBasic Reports");
                subscriptionPlanRepository.save(starter);

                com.nexora.crm.entity.SubscriptionPlan growth = new com.nexora.crm.entity.SubscriptionPlan();
                growth.setId("plan-growth");
                growth.setName("Growth");
                growth.setTypeTag("RECOMMENDED");
                growth.setBadge("MOST POPULAR");
                growth.setSubtitle("For growing businesses expanding sales operations and active pipelines.");
                growth.setMonthlyPrice(new java.math.BigDecimal("2499.00"));
                growth.setAnnualPrice(new java.math.BigDecimal("23988.00"));
                growth.setPriceDisplay("₹2,499");
                growth.setUserLimitText("20 Team Members");
                growth.setUserLimit(20);
                growth.setIsPopular(true);
                growth.setBadgeColor("var(--tertiary)");
                growth.setFeatures("20 Team Members\nMultiple Workspaces\nAdvanced Pipeline\nAutomation Workflows\nReports & Analytics\nTeam Permissions\nActivity Tracking");
                subscriptionPlanRepository.save(growth);

                com.nexora.crm.entity.SubscriptionPlan scale = new com.nexora.crm.entity.SubscriptionPlan();
                scale.setId("plan-scale");
                scale.setName("Scale");
                scale.setTypeTag("ENTERPRISE");
                scale.setSubtitle("For larger organizations needing complete multi-workspace governance.");
                scale.setMonthlyPrice(new java.math.BigDecimal("5999.00"));
                scale.setAnnualPrice(new java.math.BigDecimal("57588.00"));
                scale.setPriceDisplay("₹5,999");
                scale.setUserLimitText("50 Team Members");
                scale.setUserLimit(50);
                scale.setIsPopular(false);
                scale.setBadgeColor("#8b5cf6");
                scale.setFeatures("50 Team Members\nUnlimited Workspaces\nDedicated Database Cluster\nCustom Security Rules\n24/7 Dedicated Support\nCustom Integrations\nAudit Log Streaming");
                subscriptionPlanRepository.save(scale);
                log.info("Default subscription plans seeded.");
            }
        };
    }
}
