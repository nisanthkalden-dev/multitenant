package com.nexora.crm;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexora.crm.dto.auth.LoginRequest;
import com.nexora.crm.dto.auth.RefreshTokenRequest;
import com.nexora.crm.dto.auth.SuperAdminLoginRequest;
import com.nexora.crm.dto.customer.CustomerRequest;
import com.nexora.crm.dto.lead.LeadRequest;
import com.nexora.crm.dto.task.TaskRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class MultiTenantCrmTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private com.nexora.crm.repository.CompanyRepository companyRepository;

    @Autowired
    private com.nexora.crm.repository.SubscriptionRepository subscriptionRepository;

    @Autowired
    private com.nexora.crm.repository.UserRepository userRepository;

    private String getAuthToken(String userId, String password, String loginType) throws Exception {
        LoginRequest req = new LoginRequest();
        req.setUserId(userId);
        req.setPassword(password);
        req.setLoginType(loginType);

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();

        String json = result.getResponse().getContentAsString();
        return objectMapper.readTree(json).path("data").path("accessToken").asText();
    }

    @Test
    @DisplayName("Super Admin Dedicated Login: POST /api/super-admin/login returns Access and Refresh tokens")
    public void testSuperAdminDedicatedLoginSuccess() throws Exception {
        SuperAdminLoginRequest req = new SuperAdminLoginRequest("superadmin@nexora.com", "SuperAdmin123!");

        MvcResult result = mockMvc.perform(post("/api/super-admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", notNullValue()))
                .andExpect(jsonPath("$.refreshToken", notNullValue()))
                .andExpect(jsonPath("$.tokenType", is("Bearer")))
                .andExpect(jsonPath("$.data").doesNotExist())
                .andExpect(jsonPath("$.token").doesNotExist())
                .andExpect(jsonPath("$.user").doesNotExist())
                .andReturn();

        String json = result.getResponse().getContentAsString();
        String accessToken = objectMapper.readTree(json).path("accessToken").asText();
        String refreshToken = objectMapper.readTree(json).path("refreshToken").asText();

        // 1. Verify access token accesses protected endpoint
        mockMvc.perform(get("/api/super-admin/dashboard")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        // 2. CRITICAL SECURITY TEST: Refresh token MUST BE REJECTED when sent to protected endpoint
        mockMvc.perform(get("/api/super-admin/dashboard")
                        .header("Authorization", "Bearer " + refreshToken))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Authentication required")));
    }

    @Test
    @DisplayName("Dedicated Super Admin Login Rejects Invalid Password (HTTP 401 JSON)")
    public void testSuperAdminLoginInvalidPassword() throws Exception {
        SuperAdminLoginRequest req = new SuperAdminLoginRequest("superadmin@nexora.com", "WrongPassword999!");

        mockMvc.perform(post("/api/super-admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Invalid email or password")));
    }

    @Test
    @DisplayName("Dedicated Super Admin Login Rejects Non-SuperAdmin Account (HTTP 401 JSON)")
    public void testSuperAdminLoginWrongRole() throws Exception {
        SuperAdminLoginRequest req = new SuperAdminLoginRequest("admin@acmecorp.com", "Password123");

        mockMvc.perform(post("/api/super-admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("Access denied: Not a platform Super Admin account")));
    }

    @Test
    @DisplayName("Refresh Token Flow: Validates stateless refresh token and issues new access token")
    public void testRefreshTokenFlowAndRotation() throws Exception {
        SuperAdminLoginRequest req = new SuperAdminLoginRequest("superadmin@nexora.com", "SuperAdmin123!");

        MvcResult loginResult = mockMvc.perform(post("/api/super-admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();

        String json = loginResult.getResponse().getContentAsString();
        String originalRefreshToken = objectMapper.readTree(json).path("refreshToken").asText();

        // Call /api/auth/refresh
        RefreshTokenRequest refreshReq = new RefreshTokenRequest(originalRefreshToken);
        MvcResult refreshResult = mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", notNullValue()))
                .andExpect(jsonPath("$.refreshToken", notNullValue()))
                .andExpect(jsonPath("$.tokenType", is("Bearer")))
                .andExpect(jsonPath("$.data").doesNotExist())
                .andExpect(jsonPath("$.user").doesNotExist())
                .andReturn();

        String refreshJson = refreshResult.getResponse().getContentAsString();
        String newAccessToken = objectMapper.readTree(refreshJson).path("accessToken").asText();
        String newRefreshToken = objectMapper.readTree(refreshJson).path("refreshToken").asText();

        // New access token works
        mockMvc.perform(get("/api/super-admin/dashboard")
                        .header("Authorization", "Bearer " + newAccessToken))
                .andExpect(status().isOk());

        // New refresh token also successfully works on refresh endpoint
        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RefreshTokenRequest(newRefreshToken))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", notNullValue()))
                .andExpect(jsonPath("$.tokenType", is("Bearer")));
    }

    @Test
    @DisplayName("Invalid or Malformed Refresh Token Returns HTTP 401 JSON")
    public void testInvalidRefreshToken() throws Exception {
        RefreshTokenRequest refreshReq = new RefreshTokenRequest("invalid.jwt.token.here");

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshReq)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Invalid or expired refresh token")));
    }

    @Test
    @DisplayName("Missing Authorization Header Returns HTTP 401 JSON")
    public void testMissingAuthorizationHeader() throws Exception {
        mockMvc.perform(get("/api/super-admin/dashboard"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Authentication required")));
    }

    @Test
    @DisplayName("Malformed JWT in Authorization Header Returns HTTP 401 JSON")
    public void testMalformedJwt() throws Exception {
        mockMvc.perform(get("/api/super-admin/dashboard")
                        .header("Authorization", "Bearer invalid.token.payload"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Authentication required")));
    }

    @Test
    @DisplayName("Company Admin Login and Current User Retrieval")
    public void testCompanyAdminMe() throws Exception {
        String token = getAuthToken("admin", "Password123", "company");

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.userId", is("admin")))
                .andExpect(jsonPath("$.data.role", is("company_admin")))
                .andExpect(jsonPath("$.data.companyId", is("COMP001")));
    }

    @Test
    @DisplayName("STRICT TENANT ISOLATION: Company A user CANNOT access Company B users")
    public void testCrossTenantAccessProhibited() throws Exception {
        // 'admin' belongs to COMP001 (Acme Corporation)
        String company1Token = getAuthToken("admin", "Password123", "company");

        // Attempting to access COMP002's user roster
        mockMvc.perform(get("/api/companies/COMP002/users")
                        .header("Authorization", "Bearer " + company1Token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("Cross-tenant access prohibited")));
    }

    @Test
    @DisplayName("Role RBAC: Employee cannot access Company Admin Dashboard (HTTP 403 JSON)")
    public void testEmployeeCannotAccessAdminDashboard() throws Exception {
        String employeeToken = getAuthToken("employee", "Password123", "company");

        mockMvc.perform(get("/api/company/dashboard")
                        .header("Authorization", "Bearer " + employeeToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Access denied")));
    }

    @Test
    @DisplayName("Customer CRUD operations for authorized company admin")
    public void testCustomerLifecycle() throws Exception {
        String token = getAuthToken("admin", "Password123", "company");

        CustomerRequest req = new CustomerRequest();
        req.setName("Test Enterprise Corp");
        req.setContactPerson("Alice Johnson");
        req.setEmail("alice@testcorp.com");
        req.setPhone("+91 91234 56789");
        req.setIndustry("Technology");
        req.setTier("Enterprise");
        req.setContractValue("₹10,00,000");

        // Create customer
        MvcResult createRes = mockMvc.perform(post("/api/customers")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.name", is("Test Enterprise Corp")))
                .andReturn();

        String customerId = objectMapper.readTree(createRes.getResponse().getContentAsString()).path("data").path("id").asText();

        // Retrieve customer
        mockMvc.perform(get("/api/customers/" + customerId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id", is(customerId)));

        // Delete customer
        mockMvc.perform(delete("/api/customers/" + customerId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Lead & Task operations with status toggle")
    public void testLeadAndTaskOperations() throws Exception {
        String token = getAuthToken("admin", "Password123", "company");

        // Create Task
        TaskRequest taskReq = new TaskRequest();
        taskReq.setTitle("Schedule quarterly board meeting");
        taskReq.setDueDate("Tomorrow, 10:00 AM");
        taskReq.setPriority("High");

        MvcResult taskRes = mockMvc.perform(post("/api/tasks")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(taskReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.title", is("Schedule quarterly board meeting")))
                .andReturn();

        String taskId = objectMapper.readTree(taskRes.getResponse().getContentAsString()).path("data").path("id").asText();

        // Toggle task status to Completed
        mockMvc.perform(patch("/api/tasks/" + taskId + "/toggle")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("Completed")));

        // Create Lead
        LeadRequest leadReq = new LeadRequest();
        leadReq.setTitle("Expansion in APAC");
        leadReq.setCompanyName("APAC Retail Ltd");
        leadReq.setContactName("David Miller");
        leadReq.setEstimatedValue("₹8,50,000");
        leadReq.setStage("Qualified");

        mockMvc.perform(post("/api/leads")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(leadReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.title", is("Expansion in APAC")));
    }

    @Test
    @DisplayName("Super Admin Password Update Flow: Old password rejected, new password works")
    public void testSuperAdminPasswordUpdateLifecycle() throws Exception {
        // 1. Login with current password
        SuperAdminLoginRequest initialLogin = new SuperAdminLoginRequest("superadmin@nexora.com", "SuperAdmin123!");
        MvcResult loginRes = mockMvc.perform(post("/api/super-admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(initialLogin)))
                .andExpect(status().isOk())
                .andReturn();

        String token = objectMapper.readTree(loginRes.getResponse().getContentAsString()).path("accessToken").asText();

        // 2. Attempt update with wrong current password -> Must Fail (HTTP 400)
        com.nexora.crm.dto.user.PasswordChangeRequest wrongOld = new com.nexora.crm.dto.user.PasswordChangeRequest("WrongOldPass!", "BrandNewAdmin999!");
        mockMvc.perform(put("/api/users/me/password")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wrongOld)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("Incorrect current password.")));

        // 3. Update with correct current password and new password -> Must Succeed (HTTP 200)
        com.nexora.crm.dto.user.PasswordChangeRequest validChange = new com.nexora.crm.dto.user.PasswordChangeRequest("SuperAdmin123!", "BrandNewAdmin999!");
        mockMvc.perform(put("/api/users/me/password")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validChange)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("Password updated successfully")));

        // 4. Try logging in with OLD password -> Must FAIL (HTTP 401)
        mockMvc.perform(post("/api/super-admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(initialLogin)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message", is("Invalid email or password")));

        // 5. Login with NEW password -> Must SUCCEED (HTTP 200)
        SuperAdminLoginRequest newLogin = new SuperAdminLoginRequest("superadmin@nexora.com", "BrandNewAdmin999!");
        MvcResult newLoginRes = mockMvc.perform(post("/api/super-admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", notNullValue()))
                .andExpect(jsonPath("$.refreshToken", notNullValue()))
                .andExpect(jsonPath("$.tokenType", is("Bearer")))
                .andReturn();

        String newToken = objectMapper.readTree(newLoginRes.getResponse().getContentAsString()).path("accessToken").asText();

        // 6. Restore original password so subsequent test runs are deterministic
        com.nexora.crm.dto.user.PasswordChangeRequest restoreChange = new com.nexora.crm.dto.user.PasswordChangeRequest("BrandNewAdmin999!", "SuperAdmin123!");
        mockMvc.perform(put("/api/users/me/password")
                        .header("Authorization", "Bearer " + newToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(restoreChange)))
                .andExpect(status().isOk());
    }

    @Autowired
    private com.nexora.crm.repository.UserRepository testUserRepository;

    @Autowired
    private com.nexora.crm.repository.CompanyRepository testCompanyRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder testPasswordEncoder;

    @Test
    @DisplayName("Company Creation with Admin Password: BCrypt hashing, login verification, duplicate email rejection")
    public void testAddCompanyWithAdministratorPasswordFlow() throws Exception {
        // 1. Log in as Super Admin
        SuperAdminLoginRequest saLogin = new SuperAdminLoginRequest("superadmin@nexora.com", "SuperAdmin123!");
        MvcResult saLoginRes = mockMvc.perform(post("/api/super-admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(saLogin)))
                .andExpect(status().isOk())
                .andReturn();

        String saToken = objectMapper.readTree(saLoginRes.getResponse().getContentAsString()).path("accessToken").asText();

        // 2. Prepare company creation payload with admin credentials and password
        String uniqueSuffix = String.valueOf(System.currentTimeMillis() % 100000);
        String companyName = "Test Nexus " + uniqueSuffix;
        String companyEmail = "contact" + uniqueSuffix + "@testnexus.io";
        String adminName = "Nexus Admin";
        String adminEmail = "admin" + uniqueSuffix + "@testnexus.io";
        String rawAdminPassword = "SecureAdminPass123!";

        com.nexora.crm.dto.company.CompanyRequest compReq = new com.nexora.crm.dto.company.CompanyRequest();
        compReq.setName(companyName);
        compReq.setEmail(companyEmail);
        compReq.setPhone("+91 99887 76655");
        compReq.setAddress("Floor 4, Tech Park, Bangalore");
        compReq.setPlan("Growth");
        compReq.setBillingCycle("Monthly");
        compReq.setPrice("₹2,499 / mo");
        compReq.setUserLimit(20);
        compReq.setStatus("Active");
        compReq.setAdminName(adminName);
        compReq.setAdminEmail(adminEmail);
        compReq.setAdminPassword(rawAdminPassword);

        // 3. Super Admin submits Add Company
        MvcResult createRes = mockMvc.perform(post("/api/super-admin/companies")
                        .header("Authorization", "Bearer " + saToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(compReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.id", notNullValue()))
                .andExpect(jsonPath("$.data.name", is(companyName)))
                .andExpect(jsonPath("$.data.owner.email", is(adminEmail)))
                // Verify password or hash is NEVER returned in response
                .andExpect(jsonPath("$.data.adminPassword").doesNotExist())
                .andExpect(jsonPath("$.data.password").doesNotExist())
                .andExpect(jsonPath("$.data.passwordHash").doesNotExist())
                .andReturn();

        String createdCompanyId = objectMapper.readTree(createRes.getResponse().getContentAsString()).path("data").path("id").asText();

        // 4. Verify in database: User entity, BCrypt hash, tenant_id, Super Admin stays platform-level (company == null)
        com.nexora.crm.entity.User savedAdmin = testUserRepository.findByEmailIgnoreCase(adminEmail)
                .orElseThrow(() -> new AssertionError("Saved admin not found in database for email: " + adminEmail));

        org.junit.jupiter.api.Assertions.assertNotNull(savedAdmin.getId());
        org.junit.jupiter.api.Assertions.assertEquals(adminName, savedAdmin.getFullName());
        org.junit.jupiter.api.Assertions.assertEquals(com.nexora.crm.entity.RoleType.COMPANY_ADMIN, savedAdmin.getRole());
        org.junit.jupiter.api.Assertions.assertNotNull(savedAdmin.getCompany());
        org.junit.jupiter.api.Assertions.assertEquals(createdCompanyId, savedAdmin.getCompany().getId());

        // Verify stored password is a BCrypt hash, NOT plaintext
        org.junit.jupiter.api.Assertions.assertTrue(
                savedAdmin.getPasswordHash().startsWith("$2a$") || savedAdmin.getPasswordHash().startsWith("$2b$") || savedAdmin.getPasswordHash().startsWith("$2y$"),
                "Password must be stored as a BCrypt hash!"
        );
        org.junit.jupiter.api.Assertions.assertNotEquals(rawAdminPassword, savedAdmin.getPasswordHash());
        org.junit.jupiter.api.Assertions.assertTrue(testPasswordEncoder.matches(rawAdminPassword, savedAdmin.getPasswordHash()));

        // Verify Super Admin account remains platform-level with company == null
        com.nexora.crm.entity.User saUser = testUserRepository.findByEmailIgnoreCase("superadmin@nexora.com")
                .orElseThrow(() -> new AssertionError("Super admin user not found"));
        org.junit.jupiter.api.Assertions.assertNull(saUser.getCompany(), "Super Admin must retain NULL company");

        // 5. Test Login with newly created administrator's email and password
        LoginRequest adminLoginReq = new LoginRequest();
        adminLoginReq.setEmail(adminEmail);
        adminLoginReq.setPassword(rawAdminPassword);
        adminLoginReq.setLoginType("company");

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLoginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.accessToken", notNullValue()))
                .andExpect(jsonPath("$.data.refreshToken", notNullValue()))
                .andExpect(jsonPath("$.data.user.role", is("company_admin")))
                .andExpect(jsonPath("$.data.user.companyId", is(createdCompanyId)))
                .andExpect(jsonPath("$.data.user.email", is(adminEmail)))
                .andReturn();

        String adminAccessToken = objectMapper.readTree(loginResult.getResponse().getContentAsString()).path("data").path("accessToken").asText();

        // 6. Confirm incorrect password fails (HTTP 401)
        LoginRequest wrongLoginReq = new LoginRequest();
        wrongLoginReq.setEmail(adminEmail);
        wrongLoginReq.setPassword("IncorrectPassword999!");
        wrongLoginReq.setLoginType("company");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wrongLoginReq)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Invalid email or password")));

        // 7. Confirm cross-tenant isolation: new administrator CANNOT access COMP001 customer data
        mockMvc.perform(get("/api/companies/COMP001/users")
                        .header("Authorization", "Bearer " + adminAccessToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)));

        // 8. Confirm duplicate administrator emails are rejected with HTTP 409 Conflict
        com.nexora.crm.dto.company.CompanyRequest dupReq = new com.nexora.crm.dto.company.CompanyRequest();
        dupReq.setName("Duplicate Co " + uniqueSuffix);
        dupReq.setEmail("dup" + uniqueSuffix + "@other.com");
        dupReq.setPhone("+91 99000 11223");
        dupReq.setAdminName("Another Admin");
        dupReq.setAdminEmail(adminEmail); // SAME ADMIN EMAIL
        dupReq.setAdminPassword("AnotherPassword123!");

        mockMvc.perform(post("/api/super-admin/companies")
                        .header("Authorization", "Bearer " + saToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dupReq)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("already exists")));

        // 9. Confirm existing Super Admin login and dashboard still work
        mockMvc.perform(get("/api/super-admin/dashboard")
                        .header("Authorization", "Bearer " + saToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        // 10. CLEANUP: Teardown the test-created company, subscription, and admin to prevent test pollution
        try {
            subscriptionRepository.findTopByCompany_IdOrderByCreatedAtDesc(createdCompanyId)
                    .ifPresent(sub -> subscriptionRepository.delete(sub));
            testUserRepository.findByEmailIgnoreCase(adminEmail)
                    .ifPresent(u -> testUserRepository.delete(u));
            testCompanyRepository.findById(createdCompanyId)
                    .ifPresent(c -> testCompanyRepository.delete(c));
        } catch (Exception ex) {
            // Ignore cleanup errors
        }
    }

    @Test
    @DisplayName("Suspended Company Login Rejected: Madara (Uchiha Tech) cannot log in while suspended")
    public void testSuspendedCompanyLoginRejection() throws Exception {
        // Ensure Uchiha Tech COMP005 is suspended
        testCompanyRepository.findById("COMP005").ifPresent(c -> {
            c.setStatus("Suspended");
            c.setIsActive(false);
            testCompanyRepository.save(c);
        });

        LoginRequest req = new LoginRequest();
        req.setEmail("madara@uchihatech.in");
        req.setPassword("Password123");
        req.setLoginType("company");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("Your company account is suspended. Please contact the administrator.")))
                .andExpect(jsonPath("$.data").doesNotExist())
                .andExpect(jsonPath("$.accessToken").doesNotExist())
                .andExpect(jsonPath("$.refreshToken").doesNotExist());
    }

    @Test
    @DisplayName("JWT Filter Rejection: Existing access token blocked immediately when company becomes suspended")
    public void testExistingAccessTokenBlockedOnCompanySuspension() throws Exception {
        // 1. Ensure COMP001 is Active
        com.nexora.crm.entity.Company comp1 = testCompanyRepository.findById("COMP001")
                .orElseThrow(() -> new AssertionError("COMP001 not found"));
        comp1.setStatus("Active");
        comp1.setIsActive(true);
        testCompanyRepository.save(comp1);

        // 2. Company Admin logs in and obtains access token
        String token = getAuthToken("admin", "Password123", "company");

        // 3. Verify token works
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        // 4. Super Admin suspends the company
        SuperAdminLoginRequest saLogin = new SuperAdminLoginRequest("superadmin@nexora.com", "SuperAdmin123!");
        MvcResult saRes = mockMvc.perform(post("/api/super-admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(saLogin)))
                .andExpect(status().isOk())
                .andReturn();
        String saToken = objectMapper.readTree(saRes.getResponse().getContentAsString()).path("accessToken").asText();

        com.nexora.crm.dto.company.CompanyRequest suspendReq = new com.nexora.crm.dto.company.CompanyRequest();
        suspendReq.setStatus("Suspended");
        mockMvc.perform(put("/api/super-admin/companies/COMP001")
                        .header("Authorization", "Bearer " + saToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(suspendReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("Suspended")));

        // 5. Existing company admin token MUST NOW BE REJECTED (HTTP 403 Forbidden)
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("Your company account is suspended")));

        // 6. Super Admin access must NOT be broken
        mockMvc.perform(get("/api/super-admin/dashboard")
                        .header("Authorization", "Bearer " + saToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        // 7. Reactivate COMP001 so other tests remain unaffected
        com.nexora.crm.dto.company.CompanyRequest activateReq = new com.nexora.crm.dto.company.CompanyRequest();
        activateReq.setStatus("Active");
        mockMvc.perform(put("/api/super-admin/companies/COMP001")
                        .header("Authorization", "Bearer " + saToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(activateReq)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Uchiha Tech Specific End-to-End Test: Suspension, Reactivation, and Login")
    public void testUchihaTechLifecycle() throws Exception {
        // Super Admin login
        SuperAdminLoginRequest saLogin = new SuperAdminLoginRequest("superadmin@nexora.com", "SuperAdmin123!");
        MvcResult saRes = mockMvc.perform(post("/api/super-admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(saLogin)))
                .andExpect(status().isOk())
                .andReturn();
        String saToken = objectMapper.readTree(saRes.getResponse().getContentAsString()).path("accessToken").asText();

        // Ensure COMP005 is suspended
        com.nexora.crm.dto.company.CompanyRequest suspendReq = new com.nexora.crm.dto.company.CompanyRequest();
        suspendReq.setStatus("Suspended");
        mockMvc.perform(put("/api/super-admin/companies/COMP005")
                        .header("Authorization", "Bearer " + saToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(suspendReq)))
                .andExpect(status().isOk());

        // Madara login MUST FAIL
        LoginRequest madaraLogin = new LoginRequest();
        madaraLogin.setEmail("madara@uchihatech.in");
        madaraLogin.setPassword("Password123");
        madaraLogin.setLoginType("company");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(madaraLogin)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message", containsString("Your company account is suspended")));

        // Super Admin activates Uchiha Tech
        com.nexora.crm.dto.company.CompanyRequest activateReq = new com.nexora.crm.dto.company.CompanyRequest();
        activateReq.setStatus("Active");
        mockMvc.perform(put("/api/super-admin/companies/COMP005")
                        .header("Authorization", "Bearer " + saToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(activateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("Active")));

        // Madara login MUST NOW SUCCEED
        MvcResult madaraRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(madaraLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.accessToken", notNullValue()))
                .andReturn();

        String madaraToken = objectMapper.readTree(madaraRes.getResponse().getContentAsString()).path("data").path("accessToken").asText();

        // Madara accesses protected API
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + madaraToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email", is("madara@uchihatech.in")))
                .andExpect(jsonPath("$.data.companyId", is("COMP005")));

        // Re-suspend Uchiha Tech
        mockMvc.perform(put("/api/super-admin/companies/COMP005")
                        .header("Authorization", "Bearer " + saToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(suspendReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("Suspended")));

        // Madara's token is immediately rejected
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + madaraToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message", containsString("Your company account is suspended")));
    }

    @Test
    @DisplayName("Super Admin Dashboard Returns Real Database Data with 6M and 1Y Series")
    public void testSuperAdminDashboardRealData() throws Exception {
        SuperAdminLoginRequest saLogin = new SuperAdminLoginRequest("superadmin@nexora.com", "SuperAdmin123!");
        MvcResult saRes = mockMvc.perform(post("/api/super-admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(saLogin)))
                .andExpect(status().isOk())
                .andReturn();
        String saToken = objectMapper.readTree(saRes.getResponse().getContentAsString()).path("accessToken").asText();

        mockMvc.perform(get("/api/super-admin/dashboard?period=6M")
                        .header("Authorization", "Bearer " + saToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.stats.totalCompanies.value", notNullValue()))
                .andExpect(jsonPath("$.data.revenueMonthlyData", hasSize(6)))
                .andExpect(jsonPath("$.data.revenueMonthlyData6M", hasSize(6)))
                .andExpect(jsonPath("$.data.revenueMonthlyData1Y", hasSize(12)))
                .andExpect(jsonPath("$.data.currentMrr", notNullValue()));

        mockMvc.perform(get("/api/super-admin/dashboard?period=1Y")
                        .header("Authorization", "Bearer " + saToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.revenueMonthlyData", hasSize(12)));
    }

    @Test
    @DisplayName("Super Admin Subscriptions: Includes suspended company Uchiha Tech (COMP005) with status")
    public void testSuperAdminSubscriptionsIncludesSuspendedCompany() throws Exception {
        SuperAdminLoginRequest saLogin = new SuperAdminLoginRequest("superadmin@nexora.com", "SuperAdmin123!");
        MvcResult saRes = mockMvc.perform(post("/api/super-admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(saLogin)))
                .andExpect(status().isOk())
                .andReturn();
        String saToken = objectMapper.readTree(saRes.getResponse().getContentAsString()).path("accessToken").asText();

        // Query subscriptions endpoint
        mockMvc.perform(get("/api/super-admin/subscriptions")
                        .header("Authorization", "Bearer " + saToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", not(empty())))
                .andExpect(jsonPath("$.data[*].companyId", hasItem("COMP005")))
                .andExpect(jsonPath("$.data[?(@.companyId == 'COMP005')].companyName", hasItem("Uchiha Tech")))
                .andExpect(jsonPath("$.data[?(@.companyId == 'COMP005')].companyStatus", hasItem("Suspended")));
    }

    @Test
    @DisplayName("Super Admin Subscriptions: Edit price to 299, verify numeric decimal persistence, then delete without affecting company")
    public void testSuperAdminSubscriptionEditAndDeleteFlow() throws Exception {
        SuperAdminLoginRequest saLogin = new SuperAdminLoginRequest("superadmin@nexora.com", "SuperAdmin123!");
        MvcResult saRes = mockMvc.perform(post("/api/super-admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(saLogin)))
                .andExpect(status().isOk())
                .andReturn();
        String saToken = objectMapper.readTree(saRes.getResponse().getContentAsString()).path("accessToken").asText();

        // 1. Get subscriptions list to find a valid subscription ID
        MvcResult subsRes = mockMvc.perform(get("/api/super-admin/subscriptions")
                        .header("Authorization", "Bearer " + saToken))
                .andExpect(status().isOk())
                .andReturn();
        
        com.fasterxml.jackson.databind.JsonNode listNode = objectMapper.readTree(subsRes.getResponse().getContentAsString()).path("data");
        String targetSubId = null;
        for (com.fasterxml.jackson.databind.JsonNode node : listNode) {
            if ("COMP001".equals(node.path("companyId").asText())) {
                targetSubId = node.path("id").asText();
                break;
            }
        }
        org.junit.jupiter.api.Assertions.assertNotNull(targetSubId, "Subscription for COMP001 should exist");

        // 2. Edit subscription price to 299
        com.nexora.crm.dto.subscription.SubscriptionUpdateRequest updateReq = new com.nexora.crm.dto.subscription.SubscriptionUpdateRequest();
        updateReq.setPlan("Growth");
        updateReq.setPrice(new java.math.BigDecimal("299"));
        updateReq.setBillingCycle("Monthly");
        updateReq.setStatus("Active");
        updateReq.setRenewalDate("Dec 31, 2026");

        mockMvc.perform(put("/api/super-admin/subscriptions/" + targetSubId)
                        .header("Authorization", "Bearer " + saToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.price", is(299)))
                .andExpect(jsonPath("$.data.amount", is("₹299")));

        // 3. Verify get by ID returns 299
        mockMvc.perform(get("/api/super-admin/subscriptions/" + targetSubId)
                        .header("Authorization", "Bearer " + saToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.price", is(299)))
                .andExpect(jsonPath("$.data.amount", is("₹299")));

        // 4. Verify negative price is rejected with 400 Bad Request
        com.nexora.crm.dto.subscription.SubscriptionUpdateRequest negativeReq = new com.nexora.crm.dto.subscription.SubscriptionUpdateRequest();
        negativeReq.setPlan("Growth");
        negativeReq.setPrice(new java.math.BigDecimal("-50"));
        negativeReq.setBillingCycle("Monthly");
        negativeReq.setStatus("Active");

        mockMvc.perform(put("/api/super-admin/subscriptions/" + targetSubId)
                        .header("Authorization", "Bearer " + saToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(negativeReq)))
                .andExpect(status().isBadRequest());

        // 5. Create a test subscription, delete it, and verify company + users remain intact
        String uchihaSubId = null;
        for (com.fasterxml.jackson.databind.JsonNode node : listNode) {
            if ("COMP005".equals(node.path("companyId").asText())) {
                uchihaSubId = node.path("id").asText();
                break;
            }
        }
        org.junit.jupiter.api.Assertions.assertNotNull(uchihaSubId, "Subscription for COMP005 (Uchiha Tech) should exist");

        com.nexora.crm.dto.subscription.SubscriptionUpdateRequest editUchiha = new com.nexora.crm.dto.subscription.SubscriptionUpdateRequest();
        editUchiha.setPlan("Scale");
        editUchiha.setPrice(new java.math.BigDecimal("799"));
        editUchiha.setBillingCycle("Monthly");
        editUchiha.setStatus("Suspended");
        editUchiha.setRenewalDate("Nov 01, 2026");

        // Verify suspended company subscription can be edited
        mockMvc.perform(put("/api/super-admin/subscriptions/" + uchihaSubId)
                        .header("Authorization", "Bearer " + saToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(editUchiha)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.price", is(799)))
                .andExpect(jsonPath("$.data.amount", is("₹799")));

        // 6. Delete a test subscription (sub-1793278880161 or create a designated test sub)
        com.nexora.crm.entity.Subscription testSub = new com.nexora.crm.entity.Subscription();
        testSub.setId("sub-test-delete-999");
        com.nexora.crm.entity.Company comp1 = companyRepository.findById("COMP001").orElseThrow();
        testSub.setCompany(comp1);
        testSub.setPlanName("Starter");
        testSub.setAmount("999");
        testSub.setBillingCycle("Monthly");
        testSub.setStatus("Active");
        subscriptionRepository.save(testSub);

        // Delete test subscription
        mockMvc.perform(delete("/api/super-admin/subscriptions/sub-test-delete-999")
                        .header("Authorization", "Bearer " + saToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        // Confirm deleted subscription is gone from database
        org.junit.jupiter.api.Assertions.assertTrue(subscriptionRepository.findById("sub-test-delete-999").isEmpty());
        // Confirm company COMP001 still exists
        org.junit.jupiter.api.Assertions.assertTrue(companyRepository.findById("COMP001").isPresent());
        // Confirm users of COMP001 still exist
        org.junit.jupiter.api.Assertions.assertTrue(userRepository.countByCompany_Id("COMP001") > 0);
    }
}
