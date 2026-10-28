package com.nexora.crm;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexora.crm.dto.auth.LoginRequest;
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
        return objectMapper.readTree(json).path("data").path("token").asText();
    }

    @Test
    @DisplayName("Super Admin Login and Dashboard Access")
    public void testSuperAdminLoginAndDashboard() throws Exception {
        String token = getAuthToken("superadmin", "SuperAdmin123!", "super_admin");

        mockMvc.perform(get("/api/super-admin/dashboard")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.stats.totalCompanies.value", notNullValue()));
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
    @DisplayName("Role RBAC: Employee cannot access Company Admin Dashboard")
    public void testEmployeeCannotAccessAdminDashboard() throws Exception {
        String employeeToken = getAuthToken("employee", "Password123", "company");

        mockMvc.perform(get("/api/company/dashboard")
                        .header("Authorization", "Bearer " + employeeToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Customer Isolation: Tenant only receives its own scoped customers")
    public void testTenantCustomerListScoping() throws Exception {
        String tokenComp1 = getAuthToken("admin", "Password123", "company");

        mockMvc.perform(get("/api/customers")
                        .header("Authorization", "Bearer " + tokenComp1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                // Verify all returned customers strictly belong to COMP001
                .andExpect(jsonPath("$.data[*].companyId", everyItem(is("COMP001"))));
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
}
