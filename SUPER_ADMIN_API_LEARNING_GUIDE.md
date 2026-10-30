# Nexora CRM – Super Admin APIs: Complete Learning & Implementation Guide

Welcome to the **Super Admin API Learning Guide** for Nexora CRM! 

This guide is designed for beginners and developers who want to master how the frontend (React) and backend (Spring Boot & MySQL) interact exclusively within the **Super Admin module**.

---

## Table of Contents

1. [Architectural Overview for Beginners](#1-architectural-overview-for-beginners)
2. [Master Super Admin API Table](#2-master-super-admin-api-table)
3. [Deep-Dive: Super Admin APIs (Step-by-Step)](#3-deep-dive-super-admin-apis-step-by-step)
   - [API 1: Super Admin Authentication & Login](#api-1-super-admin-authentication--login)
   - [API 2: Super Admin Dashboard & Governance Metrics](#api-2-super-admin-dashboard--governance-metrics)
   - [API 3: Company Management – Get All Companies](#api-3-company-management--get-all-companies)
   - [API 4: Company Management – Provision / Create Company](#api-4-company-management--provision--create-company)
   - [API 5: Company Management – Get Company Details by ID](#api-5-company-management--get-company-details-by-id)
   - [API 6: Company Management – Update Company Profile & Status](#api-6-company-management--update-company-profile--status)
   - [API 7: Company Management – Deactivate / Suspend Company](#api-7-company-management--deactivate--suspend-company)
   - [API 8: Subscription Management – Get All Subscriptions](#api-8-subscription-management--get-all-subscriptions)
   - [API 9: Subscription Management – Get Subscription by ID](#api-9-subscription-management--get-subscription-by-id)
   - [API 10: Subscription Management – Update Subscription Record](#api-10-subscription-management--update-subscription-record)
   - [API 11: Subscription Management – Delete Subscription Record](#api-11-subscription-management--delete-subscription-record)
   - [API 12: Plan Management – Get All Subscription Plans](#api-12-plan-management--get-all-subscription-plans)
   - [API 13: Plan Management – Create Subscription Plan](#api-13-plan-management--create-subscription-plan)
   - [API 14: Plan Management – Update Subscription Plan](#api-14-plan-management--update-subscription-plan)
   - [API 15: Plan Management – Delete Subscription Plan (Safe Check)](#api-15-plan-management--delete-subscription-plan-safe-check)
   - [API 16: Platform Settings – Get Global Settings](#api-16-platform-settings--get-global-settings)
   - [API 17: Platform Settings – Update Global Settings](#api-17-platform-settings--update-global-settings)
   - [API 18: Platform Settings – Remove Platform Logo](#api-18-platform-settings--remove-platform-logo)
   - [API 19: Profile Management – Get Current Super Admin Profile](#api-19-profile-management--get-current-super-admin-profile)
   - [API 20: Profile Management – Update Profile Details](#api-20-profile-management--update-profile-details)
   - [API 21: Profile Management – Remove Super Admin Avatar](#api-21-profile-management--remove-super-admin-avatar)
   - [API 22: Profile Management – Change Super Admin Password](#api-22-profile-management--change-super-admin-password)
4. [Backend Architectural Concepts Explained](#4-backend-architectural-concepts-explained)
5. [Frontend (React) Architectural Concepts Explained](#5-frontend-react-architectural-concepts-explained)
6. [Postman Testing Guide for Super Admin](#6-postman-testing-guide-for-super-admin)
7. [Audit Summary & Incomplete Frontend Integrations](#7-audit-summary--incomplete-frontend-integrations)

---

## 1. Architectural Overview for Beginners

Nexora CRM uses a **Decoupled Client-Server Architecture**:
```text
Browser (React Frontend) 
    │
    │  HTTP Requests (JSON + JWT Header)
    ▼
Spring Boot REST Controller (@RestController)
    │
    │  Business Rules & Data Transformations
    ▼
Service Layer (@Service)
    │
    │  Spring Data JPA Queries
    ▼
Repository Layer (@Repository)
    │
    │  SQL Queries (SELECT, INSERT, UPDATE, DELETE)
    ▼
MySQL Relational Database
```

### Key Rules in Nexora CRM:
1. **Multi-Tenancy:** Regular company users belong to a specific tenant (e.g., `company_id = COMP001`). However, the **Super Admin** operates at the platform level (`tenant_id = null`), having global visibility across all tenants and subscriptions.
2. **Stateless Security:** Every request carries a **JWT (JSON Web Token)** in the `Authorization: Bearer <TOKEN>` HTTP header. Spring Boot does not keep HTTP sessions in server memory.
3. **Role-Based Access Control (RBAC):** Super Admin routes in Spring Boot are guarded with:
   ```java
   @PreAuthorize("hasRole('SUPER_ADMIN')")
   ```
   and in Spring Security config:
   ```java
   .requestMatchers("/api/super-admin/**").hasRole("SUPER_ADMIN")
   ```

---

## 2. Master Super Admin API Table

Every endpoint below is verified from your actual project source code (`SuperAdminController.java`, `UserProfileController.java`, and `apiClient.js`):

| # | API Name | HTTP Method | Endpoint | Purpose | Frontend File | Java Controller | Auth Required | Required Role | MySQL Tables Involved |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Super Admin Login | `POST` | `/api/super-admin/login` | Authenticate Super Admin and issue JWT tokens | `frontend/src/api/authApi.js` | `SuperAdminController.java` | No (Public) | None | `users` |
| 2 | Platform Dashboard | `GET` | `/api/super-admin/dashboard` | Retrieve platform KPIs, MRR, growth, and subscriber distribution | `frontend/src/api/dashboardApi.js` | `SuperAdminController.java` | Yes (JWT) | `SUPER_ADMIN` | `companies`, `subscriptions`, `users` |
| 3 | Get All Companies | `GET` | `/api/super-admin/companies` | Paginated and searchable list of tenant workspaces | `frontend/src/api/companyApi.js` | `SuperAdminController.java` | Yes (JWT) | `SUPER_ADMIN` | `companies`, `users`, `subscriptions` |
| 4 | Provision Company | `POST` | `/api/super-admin/companies` | Create a company workspace and bootstrap its administrator | `frontend/src/api/companyApi.js` | `SuperAdminController.java` | Yes (JWT) | `SUPER_ADMIN` | `companies`, `users`, `subscriptions`, `company_settings` |
| 5 | Get Company Details | `GET` | `/api/super-admin/companies/{id}` | Retrieve single company workspace profile and usage metrics | `frontend/src/api/companyApi.js` | `SuperAdminController.java` | Yes (JWT) | `SUPER_ADMIN` | `companies`, `users`, `subscriptions`, `leads`, `customers` |
| 6 | Update Company | `PUT` | `/api/super-admin/companies/{id}` | Update company name, plan, seat limit, or status | `frontend/src/api/companyApi.js` | `SuperAdminController.java` | Yes (JWT) | `SUPER_ADMIN` | `companies`, `subscriptions` |
| 7 | Deactivate / Suspend Company | `DELETE` | `/api/super-admin/companies/{id}` | Suspend company access and flag its subscription as suspended | `frontend/src/api/companyApi.js` | `SuperAdminController.java` | Yes (JWT) | `SUPER_ADMIN` | `companies`, `subscriptions` |
| 8 | Get All Subscriptions | `GET` | `/api/super-admin/subscriptions` | Paginated live billing records across all companies | `frontend/src/api/subscriptionApi.js` | `SuperAdminController.java` | Yes (JWT) | `SUPER_ADMIN` | `subscriptions`, `companies` |
| 9 | Get Subscription by ID | `GET` | `/api/super-admin/subscriptions/{id}` | View single subscription contract details | `frontend/src/api/subscriptionApi.js` | `SuperAdminController.java` | Yes (JWT) | `SUPER_ADMIN` | `subscriptions`, `companies` |
| 10 | Update Subscription | `PUT` | `/api/super-admin/subscriptions/{id}` | Edit terms, price, or renewal date of a subscription | `frontend/src/api/subscriptionApi.js` | `SuperAdminController.java` | Yes (JWT) | `SUPER_ADMIN` | `subscriptions`, `companies` |
| 11 | Delete Subscription | `DELETE` | `/api/super-admin/subscriptions/{id}` | Remove a single subscription record | `frontend/src/api/subscriptionApi.js` | `SuperAdminController.java` | Yes (JWT) | `SUPER_ADMIN` | `subscriptions` |
| 12 | Get All Plans | `GET` | `/api/super-admin/plans` | Fetch platform pricing tiers and packaging limits | `frontend/src/api/subscriptionApi.js` | `SuperAdminController.java` | Yes (JWT) | `SUPER_ADMIN` | `subscription_plans` |
| 13 | Create Plan | `POST` | `/api/super-admin/plans` | Create a new pricing tier and save to database | `frontend/src/api/subscriptionApi.js` | `SuperAdminController.java` | Yes (JWT) | `SUPER_ADMIN` | `subscription_plans` |
| 14 | Update Plan | `PUT` | `/api/super-admin/plans/{id}` | Change pricing or features of an existing tier | `frontend/src/api/subscriptionApi.js` | `SuperAdminController.java` | Yes (JWT) | `SUPER_ADMIN` | `subscription_plans` |
| 15 | Delete Plan | `DELETE` | `/api/super-admin/plans/{id}` | Delete a plan only if not currently used by any tenant | `frontend/src/api/subscriptionApi.js` | `SuperAdminController.java` | Yes (JWT) | `SUPER_ADMIN` | `subscription_plans`, `subscriptions`, `companies` |
| 16 | Get Platform Settings | `GET` | `/api/super-admin/settings` | Retrieve global portal brand, currency, and contact info | `frontend/src/api/platformSettingsApi.js` | `SuperAdminController.java` | Yes (JWT) | `SUPER_ADMIN` | `platform_settings` |
| 17 | Update Platform Settings | `PUT` | `/api/super-admin/settings` | Save global platform brand name, email, currency | `frontend/src/api/platformSettingsApi.js` | `SuperAdminController.java` | Yes (JWT) | `SUPER_ADMIN` | `platform_settings` |
| 18 | Remove Platform Logo | `DELETE` | `/api/super-admin/settings/logo` | Delete custom platform logo | `frontend/src/api/platformSettingsApi.js` | `SuperAdminController.java` | Yes (JWT) | `SUPER_ADMIN` | `platform_settings` |
| 19 | Get Current Profile | `GET` | `/api/users/me` | Fetch logged-in Super Admin name, email, avatar | `frontend/src/api/userApi.js` | `UserProfileController.java` | Yes (JWT) | Authenticated | `users` |
| 20 | Update Current Profile | `PUT` | `/api/users/me` | Update Super Admin display name or phone | `frontend/src/api/userApi.js` | `UserProfileController.java` | Yes (JWT) | Authenticated | `users` |
| 21 | Remove Current Avatar | `DELETE` | `/api/users/me/avatar` | Clear Super Admin avatar picture | `frontend/src/api/userApi.js` | `UserProfileController.java` | Yes (JWT) | Authenticated | `users` |
| 22 | Change Password | `PUT` | `/api/users/me/password` | Verify old password and encrypt new password | `frontend/src/api/userApi.js` | `UserProfileController.java` | Yes (JWT) | Authenticated | `users` |

---

## 3. Deep-Dive: Super Admin APIs (Step-by-Step)

---

### API 1: Super Admin Authentication & Login

#### 1. What happens in the UI?
1. The administrator visits `/login` and selects the **Super Admin Portal** toggle.
2. The user enters email (e.g. `superadmin@nexora.app`) and password, then clicks **Sign In to Platform Admin**.

#### 2. React Execution Flow
- **Component:** [`Login.jsx`](file:///d:/multitenant/frontend/src/pages/Login.jsx) executes `handleSubmit(e)`.
- **API Call:** Calls `authApi.superAdminLogin({ email, password })` in [`authApi.js`](file:///d:/multitenant/frontend/src/api/authApi.js).
- **HTTP Dispatch:** [`apiClient.js`](file:///d:/multitenant/frontend/src/api/apiClient.js) sends a `POST` request to `http://localhost:8080/api/super-admin/login`.

#### 3. Spring Boot Backend Flow
- **Controller:** [`SuperAdminController.java`](file:///d:/multitenant/backend/src/main/java/com/nexora/crm/controller/SuperAdminController.java#L60-L65)
  ```java
  @PostMapping("/login")
  public ResponseEntity<AuthTokenResponse> superAdminLogin(@Valid @RequestBody SuperAdminLoginRequest request) {
      AuthTokenResponse response = authService.superAdminLogin(request);
      return ResponseEntity.ok(response);
  }
  ```
- **Service:** [`AuthService.java`](file:///d:/multitenant/backend/src/main/java/com/nexora/crm/service/AuthService.java#L64-L102)
  1. Searches the database for the user: `userRepository.findByEmailIgnoreCase(request.getEmail())`.
  2. Verifies the BCrypt password: `passwordEncoder.matches(rawPassword, user.getPasswordHash())`.
  3. Verifies user role: `if (user.getRole() != RoleType.SUPER_ADMIN) throw new BadCredentialsException(...)`.
  4. Calls `jwtService.generateAccessToken(user)` and `jwtService.generateRefreshToken(user)`.
- **Repository:** [`UserRepository.java`](file:///d:/multitenant/backend/src/main/java/com/nexora/crm/repository/UserRepository.java) runs:
  ```sql
  SELECT * FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1;
  ```
- **MySQL Table Affected:** `users` (READ).

#### 4. Request & Response Format
**Request:**
```http
POST /api/super-admin/login HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "email": "superadmin@nexora.app",
  "password": "Password@123"
}
```

**Success Response (HTTP 200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
  "tokenType": "Bearer"
}
```

**Common Error Responses:**
- `401 Unauthorized`:
  ```json
  {
    "status": 401,
    "error": "Unauthorized",
    "message": "Invalid email or password"
  }
  ```

#### 5. Frontend State Storage
In [`AuthContext.jsx`](file:///d:/multitenant/frontend/src/context/AuthContext.jsx):
- Stores `accessToken` in `localStorage.setItem('nexora_token', accessToken)`.
- Sets user session in `localStorage.setItem('nexora_auth_session', JSON.stringify(session))`.
- Redirects user to `/super-admin`.

---

### API 2: Super Admin Dashboard & Governance Metrics

#### 1. What happens in the UI?
When the Super Admin navigates to `/super-admin`, the platform overview displays live metrics: Total Companies, Active Subscriptions, Platform Users, Monthly Recurring Revenue (MRR), and Revenue growth trends.

#### 2. React Execution Flow
- **Component:** [`Dashboard.jsx`](file:///d:/multitenant/frontend/src/pages/SuperAdmin/Dashboard.jsx) mounts.
- **Context Hook:** [`SuperAdminContext.jsx`](file:///d:/multitenant/frontend/src/context/SuperAdminContext.jsx#L145-L167) calls `refreshDashboard(period)`.
- **API File:** [`dashboardApi.js`](file:///d:/multitenant/frontend/src/api/dashboardApi.js#L4-L7) executes:
  ```javascript
  getSuperAdminDashboard: async (period = '6M') => {
    const res = await apiClient(`/super-admin/dashboard?period=${encodeURIComponent(period)}`);
    return res.data;
  }
  ```

#### 3. Spring Boot Backend Flow
- **Controller:** [`SuperAdminController.java`](file:///d:/multitenant/backend/src/main/java/com/nexora/crm/controller/SuperAdminController.java#L67-L75):
  ```java
  @GetMapping("/dashboard")
  @PreAuthorize("hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<SuperAdminDashboardDto>> getDashboard(@RequestParam(defaultValue = "6M") String period) {
      SuperAdminDashboardDto dashboard = dashboardService.getSuperAdminDashboard(period);
      return ResponseEntity.ok(ApiResponse.ok("Platform metrics retrieved successfully", dashboard));
  }
  ```
- **Service:** [`DashboardService.java`](file:///d:/multitenant/backend/src/main/java/com/nexora/crm/service/DashboardService.java#L61-L180):
  1. Counts total companies: `companyRepository.count()`.
  2. Counts active companies: `companyRepository.countByStatusIgnoreCase("Active")`.
  3. Counts platform users: `userRepository.count()`.
  4. Calculates real MRR by querying all active companies and annualizing/monthly-normalizing their `price`.
  5. Computes MRR growth percentage compared to the previous calendar month.
- **MySQL Tables:** `companies` (READ), `subscriptions` (READ), `users` (READ).

#### 4. Request & Response Format
**Request:**
```http
GET /api/super-admin/dashboard?period=6M HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...
```

**Success Response (HTTP 200 OK):**
```json
{
  "success": true,
  "message": "Platform metrics retrieved successfully",
  "data": {
    "stats": {
      "totalCompanies": 3,
      "activeSubscriptions": 2,
      "mrr": 8498,
      "mrrDisplay": "₹8,498",
      "mrrGrowth": "+12.4%",
      "totalUsers": 14
    },
    "revenueMonthlyData": [
      { "month": "May", "revenue": 4500 },
      { "month": "Jun", "revenue": 8498 }
    ],
    "subscriptionDistribution": [
      { "name": "Growth", "percentage": 66, "count": 2 },
      { "name": "Starter", "percentage": 34, "count": 1 }
    ]
  }
}
```

---

### API 3: Company Management – Get All Companies

#### 1. What happens in the UI?
Super Admin opens the **Companies** page (`/super-admin/companies`). A data table loads displaying all registered tenant organizations, their owner contact, plan, user limit, and status.

#### 2. React Execution Flow
- **Component:** [`CompaniesList.jsx`](file:///d:/multitenant/frontend/src/pages/SuperAdmin/CompaniesList.jsx)
- **API Call:** `companyApi.getCompanies({ page: 0, size: 50, search: 'Tech', status: 'Active' })` in [`companyApi.js`](file:///d:/multitenant/frontend/src/api/companyApi.js#L5-L11).

#### 3. Spring Boot Backend Flow
- **Controller:** [`SuperAdminController.java`](file:///d:/multitenant/backend/src/main/java/com/nexora/crm/controller/SuperAdminController.java#L78-L101):
  ```java
  @GetMapping("/companies")
  @PreAuthorize("hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<CompanyResponse>>> getCompanies(...)
  ```
- **Service:** [`CompanyService.java`](file:///d:/multitenant/backend/src/main/java/com/nexora/crm/service/CompanyService.java#L58-L62):
  Invokes `companyRepository.searchCompanies(search, status, pageable)`.
- **Repository:** [`CompanyRepository.java`](file:///d:/multitenant/backend/src/main/java/com/nexora/crm/repository/CompanyRepository.java):
  Executes a custom JPQL query filtering by name, email, and status with pagination.
- **MySQL Tables:** `companies` (READ), `users` (READ).

#### 4. Request & Response Format
**Request:**
```http
GET /api/super-admin/companies?page=0&size=10&search=Acme&status=Active HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...
```

**Success Response (HTTP 200 OK):**
```json
{
  "success": true,
  "message": "Companies retrieved successfully",
  "data": [
    {
      "id": "COMP001",
      "name": "Acme Corp",
      "email": "contact@acme.com",
      "phone": "+91 9876543210",
      "plan": "Growth",
      "status": "Active",
      "userLimit": 20,
      "usersCount": 5,
      "owner": {
        "name": "Acme Admin",
        "email": "admin@acme.com"
      },
      "createdAt": "2026-05-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 0,
    "size": 10,
    "totalElements": 1,
    "totalPages": 1,
    "last": true
  }
}
```

---

### API 4: Company Management – Provision / Create Company

#### 1. What happens in the UI?
Super Admin clicks **+ Add Company** (`/super-admin/companies/add`). Fills in Company Name, Email, Admin Email, Admin Password, selects a Plan, and submits the form.

#### 2. React Execution Flow
- **Component:** [`AddCompany.jsx`](file:///d:/multitenant/frontend/src/pages/SuperAdmin/AddCompany.jsx)
- **API Call:** `companyApi.createCompany(formData)` in [`companyApi.js`](file:///d:/multitenant/frontend/src/api/companyApi.js#L18-L24).

#### 3. Spring Boot Backend Flow
- **Controller:** [`SuperAdminController.java`](file:///d:/multitenant/backend/src/main/java/com/nexora/crm/controller/SuperAdminController.java#L111-L118):
  ```java
  @PostMapping("/companies")
  @PreAuthorize("hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<CompanyResponse>> createCompany(@Valid @RequestBody CompanyRequest request)
  ```
- **Service:** [`CompanyService.java`](file:///d:/multitenant/backend/src/main/java/com/nexora/crm/service/CompanyService.java#L73-L199):
  1. Checks for duplicates: `companyRepository.existsByNameIgnoreCase()` and `existsByEmailIgnoreCase()`.
  2. Generates unique company ID: `COMP002`.
  3. Saves the `Company` entity into MySQL.
  4. Provisions default `CompanySetting` record.
  5. Creates initial `Subscription` record in table `subscriptions`.
  6. **Creates Administrator User:** Hashes password with `passwordEncoder.encode(adminPassword)` and saves into `users` with `RoleType.COMPANY_ADMIN`.
- **MySQL Tables:** `companies` (INSERT), `users` (INSERT), `subscriptions` (INSERT), `company_settings` (INSERT).

#### 4. Request & Response Format
**Request:**
```http
POST /api/super-admin/companies HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...
Content-Type: application/json

{
  "name": "Zenith Technologies",
  "email": "contact@zenith.com",
  "phone": "+91 9988776655",
  "plan": "Scale",
  "billingCycle": "Annual",
  "price": "5999",
  "userLimit": 50,
  "adminName": "Zenith Admin",
  "adminEmail": "admin@zenith.com",
  "adminPassword": "SecurePassword@123"
}
```

**Success Response (HTTP 201 Created):**
```json
{
  "success": true,
  "message": "Company provisioned successfully",
  "data": {
    "id": "COMP002",
    "name": "Zenith Technologies",
    "email": "contact@zenith.com",
    "plan": "Scale",
    "status": "Active",
    "userLimit": 50
  }
}
```

---

### API 5: Company Management – Get Company Details by ID

#### 1. What happens in the UI?
Super Admin clicks on a company in the list to open `/super-admin/companies/:id`. The page renders company profile cards, live storage info, team limits, and operational metrics.

#### 2. React Execution Flow
- **Component:** [`CompanyDetails.jsx`](file:///d:/multitenant/frontend/src/pages/SuperAdmin/CompanyDetails.jsx)
- **API Call:** `companyApi.getCompanyById(id)` in [`companyApi.js`](file:///d:/multitenant/frontend/src/api/companyApi.js#L13-L16).

#### 3. Spring Boot Backend Flow
- **Controller:** [`SuperAdminController.java`](file:///d:/multitenant/backend/src/main/java/com/nexora/crm/controller/SuperAdminController.java#L103-L109)
- **Service:** [`CompanyService.java`](file:///d:/multitenant/backend/src/main/java/com/nexora/crm/service/CompanyService.java#L65-L71) loads company, computes user count from `UserRepository`, customer count from `CustomerRepository`, and lead count from `LeadRepository`.
- **MySQL Tables:** `companies`, `users`, `leads`, `customers` (READ).

**Request:**
```http
GET /api/super-admin/companies/COMP001 HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...
```

---

### API 6: Company Management – Update Company Profile & Status

#### 1. What happens in the UI?
Super Admin edits company settings, changes plan tier, or changes status between `Active` and `Suspended`.

#### 2. React Execution Flow
- **API Call:** `companyApi.updateCompany(id, companyData)` in [`companyApi.js`](file:///d:/multitenant/frontend/src/api/companyApi.js#L26-L32).

#### 3. Spring Boot Backend Flow
- **Controller:** `PUT /api/super-admin/companies/{id}` in [`SuperAdminController.java`](file:///d:/multitenant/backend/src/main/java/com/nexora/crm/controller/SuperAdminController.java#L120-L126).
- **Service:** [`CompanyService.java:202-243`](file:///d:/multitenant/backend/src/main/java/com/nexora/crm/service/CompanyService.java#L202-L243).
  - If status is changed to `Suspended`: sets `company.isActive = false` and updates the latest subscription row status to `Suspended`.
  - If status is changed to `Active`: sets `company.isActive = true` and updates subscription status to `Active`.
- **MySQL Tables:** `companies` (UPDATE), `subscriptions` (UPDATE).

---

### API 7: Company Management – Deactivate / Suspend Company

#### 1. What happens in the UI?
Super Admin clicks the **Suspend / Delete** button in the company list or details modal.

#### 2. React Execution Flow
- **API Call:** `companyApi.deleteCompany(id)` in [`companyApi.js`](file:///d:/multitenant/frontend/src/api/companyApi.js#L34-L39).

#### 3. Spring Boot Backend Flow
- **Controller:** `DELETE /api/super-admin/companies/{id}` in [`SuperAdminController.java`](file:///d:/multitenant/backend/src/main/java/com/nexora/crm/controller/SuperAdminController.java#L128-L134).
- **Service:** [`CompanyService.java:246-257`](file:///d:/multitenant/backend/src/main/java/com/nexora/crm/service/CompanyService.java#L246-L257).
  - Performs **Safe Soft-Delete**: Sets `is_active = false` and `status = 'Suspended'`. It preserves company leads, contacts, and billing history so data is never destroyed accidentally.
- **MySQL Tables:** `companies` (UPDATE), `subscriptions` (UPDATE).

---

### API 8: Subscription Management – Get All Subscriptions

#### 1. What happens in the UI?
Super Admin navigates to `/super-admin/subscriptions`. The page fetches all subscriber contracts across companies.

#### 2. React Execution Flow
- **Component:** [`Subscriptions.jsx`](file:///d:/multitenant/frontend/src/pages/SuperAdmin/Subscriptions.jsx)
- **API Call:** `subscriptionApi.getAllSubscriptions({ page: 0, size: 100 })` in [`subscriptionApi.js`](file:///d:/multitenant/frontend/src/api/subscriptionApi.js#L6-L10).

#### 3. Spring Boot Backend Flow
- **Controller:** `GET /api/super-admin/subscriptions` in [`SuperAdminController.java`](file:///d:/multitenant/backend/src/main/java/com/nexora/crm/controller/SuperAdminController.java#L136-L146).
- **Service:** [`SubscriptionService.java:129-167`](file:///d:/multitenant/backend/src/main/java/com/nexora/crm/service/SubscriptionService.java#L129-L167).
  - Queries all rows in `subscriptions`.
  - Checks if any tenant company has no subscription row and adds a synthetic representation (`plan: 'No subscription'`).
- **MySQL Tables:** `subscriptions` (READ), `companies` (READ).

---

### APIs 9, 10 & 11: Subscription Details, Update & Delete

- **Get Subscription by ID:** `GET /api/super-admin/subscriptions/{id}`
  - Handled by `SubscriptionService.getSubscriptionById(id)`. Reads from `subscriptions`.
- **Update Subscription:** `PUT /api/super-admin/subscriptions/{id}`
  - Handled by `SubscriptionService.updateSubscription(id, request)`. Updates plan name, billing cycle, price, renewal date in table `subscriptions`, and synchronizes matching fields on the company record in `companies`.
- **Delete Subscription:** `DELETE /api/super-admin/subscriptions/{id}`
  - Handled by `SubscriptionService.deleteSubscription(id)`. Deletes the row from table `subscriptions`.

---

### API 12: Plan Management – Get All Subscription Plans

#### 1. What happens in the UI?
Super Admin opens the dedicated **Subscription Settings / Plan Management** page (`/super-admin/subscription-settings`). The system fetches all configurable tiers from the database.

#### 2. React Execution Flow
- **Component:** [`PlanManagement.jsx`](file:///d:/multitenant/frontend/src/pages/SuperAdmin/PlanManagement.jsx)
- **Context:** [`SuperAdminContext.jsx`](file:///d:/multitenant/frontend/src/context/SuperAdminContext.jsx#L111-L120) runs `refreshPlans()`.
- **API Call:** `subscriptionApi.getSuperAdminPlans()` in [`subscriptionApi.js`](file:///d:/multitenant/frontend/src/api/subscriptionApi.js#L26-L29).

#### 3. Spring Boot Backend Flow
- **Controller:** `GET /api/super-admin/plans` in [`SuperAdminController.java`](file:///d:/multitenant/backend/src/main/java/com/nexora/crm/controller/SuperAdminController.java#L178-L184).
- **Service:** `SubscriptionService.getAvailablePlans()`.
- **Repository:** `planRepository.findAll()`.
- **MySQL Table:** `subscription_plans` (READ).

**Success Response (HTTP 200 OK):**
```json
{
  "success": true,
  "message": "Plans retrieved successfully",
  "data": [
    {
      "id": "plan-starter",
      "name": "Starter",
      "monthlyPrice": 999.00,
      "annualPrice": 9588.00,
      "userLimit": 5,
      "popular": false,
      "features": ["5 Team Members", "Lead Management", "Sales Pipeline"]
    },
    {
      "id": "plan-growth",
      "name": "Growth",
      "monthlyPrice": 2499.00,
      "annualPrice": 23988.00,
      "userLimit": 20,
      "popular": true,
      "features": ["20 Team Members", "Automation Workflows", "Reports & Analytics"]
    }
  ]
}
```

---

### API 13: Plan Management – Create Subscription Plan

#### 1. What happens in the UI?
Super Admin clicks **+ Add Plan** on `/super-admin/subscription-settings`. A modal appears. The admin enters name, price, user limit, and features, and clicks **Save Plan**.

#### 2. React Execution Flow
- **Component:** [`PlanManagement.jsx`](file:///d:/multitenant/frontend/src/pages/SuperAdmin/PlanManagement.jsx#L73-L122) executes `handleSavePlan(e)`.
- **API Call:** `subscriptionApi.createPlan(payload)` in [`subscriptionApi.js`](file:///d:/multitenant/frontend/src/api/subscriptionApi.js#L31-L37).

#### 3. Spring Boot Backend Flow
- **Controller:** `POST /api/super-admin/plans` in [`SuperAdminController.java`](file:///d:/multitenant/backend/src/main/java/com/nexora/crm/controller/SuperAdminController.java#L186-L195).
- **Service:** [`SubscriptionService.java:236-274`](file:///d:/multitenant/backend/src/main/java/com/nexora/crm/service/SubscriptionService.java#L236-L274).
  - Sanitizes the plan name.
  - Automatically generates an immutable plan ID (e.g. `plan-enterprise`).
  - Persists the new `SubscriptionPlan` row into MySQL.
- **MySQL Table:** `subscription_plans` (INSERT).

**Request Body:**
```json
{
  "name": "Scale Enterprise",
  "monthlyPrice": 7999.00,
  "annualPrice": 79990.00,
  "userLimit": 100,
  "subtitle": "For large organizations with complex operations",
  "features": ["Unlimited Pipelines", "Dedicated Account Manager", "Custom SLAs"],
  "popular": false
}
```

---

### API 14: Plan Management – Update Subscription Plan

#### 1. What happens in the UI?
Super Admin clicks **Edit** on a plan row in Plan Management, changes the price (e.g., ₹2,499 → ₹2,999), and clicks **Save**.

#### 2. React Execution Flow
- **API Call:** `subscriptionApi.updatePlan(id, payload)` in [`subscriptionApi.js`](file:///d:/multitenant/frontend/src/api/subscriptionApi.js#L39-L45).

#### 3. Spring Boot Backend Flow
- **Controller:** `PUT /api/super-admin/plans/{id}` in [`SuperAdminController.java`](file:///d:/multitenant/backend/src/main/java/com/nexora/crm/controller/SuperAdminController.java#L197-L206).
- **Service:** [`SubscriptionService.java:276-326`](file:///d:/multitenant/backend/src/main/java/com/nexora/crm/service/SubscriptionService.java#L276-L326).
  - Finds the plan by ID.
  - Updates monthly price, annual price, user limit, and features.
  - Persists changes to MySQL.
- **MySQL Table:** `subscription_plans` (UPDATE).

---

### API 15: Plan Management – Safe Plan Deletion

#### 1. What happens in the UI?
Super Admin clicks **Delete** next to a plan. A confirmation modal opens.

#### 2. React Execution Flow
- **Component:** [`PlanManagement.jsx:130-159`](file:///d:/multitenant/frontend/src/pages/SuperAdmin/PlanManagement.jsx#L130-L159) executes `handleConfirmDeletePlan()`.
- **API Call:** `subscriptionApi.deletePlan(id)` in [`subscriptionApi.js`](file:///d:/multitenant/frontend/src/api/subscriptionApi.js#L47-L52).

#### 3. Spring Boot Backend Flow (Critical Business Rule)
- **Controller:** `DELETE /api/super-admin/plans/{id}` in [`SuperAdminController.java`](file:///d:/multitenant/backend/src/main/java/com/nexora/crm/controller/SuperAdminController.java#L208-L214).
- **Service:** [`SubscriptionService.java:328-347`](file:///d:/multitenant/backend/src/main/java/com/nexora/crm/service/SubscriptionService.java#L328-L347):
  ```java
  boolean inUseBySubscription = subscriptionRepository.findAll().stream()
      .anyMatch(s -> s.getPlanName() != null && s.getPlanName().equalsIgnoreCase(plan.getName()));

  boolean inUseByCompany = companyRepository.findAll().stream()
      .anyMatch(c -> c.getPlan() != null && c.getPlan().equalsIgnoreCase(plan.getName()));

  if (inUseBySubscription || inUseByCompany) {
      throw new BusinessRuleException("Cannot delete plan '" + plan.getName() + "' because it is currently assigned to existing companies or subscriptions.");
  }
  planRepository.delete(plan);
  ```
- **Guaranteed Safety:** The database will **never** cascade-delete tenant subscriptions or companies when a plan is deleted. If active tenants use the plan, deletion is refused with HTTP 400 Bad Request.
- **MySQL Tables:** `subscription_plans` (DELETE if safe), `subscriptions` (READ check), `companies` (READ check).

---

### APIs 16, 17 & 18: Platform General Settings

- **Get Platform Settings:** `GET /api/super-admin/settings`
  - Fetches platform brand name (`NEXORA CRM`), default currency, timezone, support email, and brand logo URL.
  - Table: `platform_settings`.
- **Update Platform Settings:** `PUT /api/super-admin/settings`
  - Saves updated branding and configuration.
  - Table: `platform_settings` (UPDATE / INSERT).
- **Remove Platform Logo:** `DELETE /api/super-admin/settings/logo`
  - Clears the custom logo setting.

---

### APIs 19, 20, 21 & 22: Super Admin Profile & Password Management

Managed by [`UserProfileController.java`](file:///d:/multitenant/backend/src/main/java/com/nexora/crm/controller/UserProfileController.java) via [`userApi.js`](file:///d:/multitenant/frontend/src/api/userApi.js):
- **Get Profile (`GET /api/users/me`):** Retrieves the current authenticated user's name, email, and avatar from table `users`.
- **Update Profile (`PUT /api/users/me`):** Updates `full_name`, `phone`, or `department`.
- **Remove Avatar (`DELETE /api/users/me/avatar`):** Clears the avatar column.
- **Change Password (`PUT /api/users/me/password`):** 
  - Validates old password with `passwordEncoder.matches(oldPassword, user.getPasswordHash())`.
  - Encrypts the new password using BCrypt.
  - Persists the new hash to MySQL table `users`.

---

## 4. Backend Architectural Concepts Explained

### 1. What is `@RestController`?
Marks the Java class as a request handler that returns data directly as **JSON** instead of rendering an HTML page.

### 2. What is `@PreAuthorize("hasRole('SUPER_ADMIN')")`?
Method-level security. Spring Security inspects the JWT claims before running the method. If the user does not possess the `ROLE_SUPER_ADMIN` authority, Spring immediately returns `403 Forbidden`.

### 3. What is `@Transactional`?
Ensures all database operations inside the method run as a single atomic unit. If an error occurs halfway through creating a company and its administrator, Spring rolls back all changes so no orphaned records remain.

### 4. What is DTO (Data Transfer Object)?
Separates the internal database schema (`Company.java`) from the public API contract (`CompanyResponse.java`). It protects sensitive columns (like password hashes) from ever being leaked over the network.

### 5. What is BCrypt Password Encoding?
In [`SecurityConfig.java`](file:///d:/multitenant/backend/src/main/java/com/nexora/crm/config/SecurityConfig.java), `passwordEncoder()` uses `BCryptPasswordEncoder`. Passwords are never stored in plain text. Even if the database is read, the password cannot be reversed.

---

## 5. Frontend (React) Architectural Concepts Explained

### 1. `apiClient.js` (Central HTTP Client)
Located in [`frontend/src/api/apiClient.js`](file:///d:/multitenant/frontend/src/api/apiClient.js):
- Automatically attaches the JWT Bearer token:
  ```javascript
  const token = localStorage.getItem('nexora_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  ```
- Handles HTTP 401 errors: If a token expires, it attempts to call `/api/auth/refresh` using the refresh token.

### 2. `SuperAdminContext.jsx` (Global State Manager)
Located in [`frontend/src/context/SuperAdminContext.jsx`](file:///d:/multitenant/frontend/src/context/SuperAdminContext.jsx):
- Acts as the central store for companies, subscriptions, plans, and platform settings.
- When an administrator provisions a company or edits a plan, the context dispatches the API call and automatically invokes `refreshAll()` to update the entire interface in real time.

---

## 6. Postman Testing Guide for Super Admin

### Step 1: Login to get your JWT
1. **Method:** `POST`
2. **URL:** `http://localhost:8080/api/super-admin/login`
3. **Headers:** `Content-Type: application/json`
4. **Body (Raw JSON):**
   ```json
   {
     "email": "superadmin@nexora.app",
     "password": "Password@123"
   }
   ```
5. **Action:** Copy the `accessToken` string from the response.

### Step 2: Configure Authorization in Postman
For all subsequent requests:
- Go to the **Authorization** tab.
- Type: **Bearer Token**.
- Token: Paste your copied `accessToken`.

### Step 3: Test Platform Dashboard
- **Method:** `GET`
- **URL:** `http://localhost:8080/api/super-admin/dashboard?period=6M`
- **Expected Status:** `200 OK`

### Step 4: Test Creating a Subscription Plan
- **Method:** `POST`
- **URL:** `http://localhost:8080/api/super-admin/plans`
- **Headers:** `Content-Type: application/json`
- **Body (Raw JSON):**
   ```json
   {
     "name": "Testing Tier",
     "monthlyPrice": 1499.00,
     "annualPrice": 14990.00,
     "userLimit": 15,
     "popular": false,
     "features": ["15 Users", "Testing Feature"]
   }
   ```
- **Expected Status:** `201 Created`

### Step 5: Test Safe Plan Deletion
- **Method:** `DELETE`
- **URL:** `http://localhost:8080/api/super-admin/plans/plan-starter`
- **Expected Status:** `400 Bad Request` (because `Starter` is in use by existing companies).
- **Response:**
   ```json
   {
     "status": 400,
     "error": "Bad Request",
     "message": "Cannot delete plan 'Starter' because it is currently assigned to existing companies or subscriptions."
   }
   ```

---

## 7. Audit Summary & Incomplete Frontend Integrations

### Total Super Admin Endpoints Found
- **Core Super Admin API Endpoints (`SuperAdminController`):** **17**
- **Super Admin Shared Profile Endpoints (`UserProfileController`):** **5**
- **Total Real Super Admin Backend Endpoints:** **22**

### Incomplete or Frontend-Only Integrations Found
During our comprehensive inspection of the frontend React pages, we identified the following UI sections that currently do **not** have matching backend endpoints:

1. **Security Tab – 2FA Toggle & Active Sessions:**
   - On [`Settings.jsx`](file:///d:/multitenant/frontend/src/pages/SuperAdmin/Settings.jsx), the **Two-Factor Authentication** switch and **Current Active Devices / Sessions** list store state only in memory (`SuperAdminContext.jsx`). There is currently no `/api/super-admin/security/2fa` or `/api/super-admin/sessions` endpoint in Spring Boot.
2. **Notification Preferences:**
   - The email notification checkboxes on the Settings page are managed locally in React state (`notificationSettings`) and are not persisted to MySQL.
3. **Platform Appearance / Theme:**
   - The Dark/Light theme selector is stored in the browser's `localStorage` and `ThemeProvider.jsx` rather than a database table.

---

*End of Super Admin API Learning Guide. You are now equipped with full knowledge of how every request flows from user action to MySQL and back!*
