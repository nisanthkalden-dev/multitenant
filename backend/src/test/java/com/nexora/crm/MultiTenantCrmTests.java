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
}
