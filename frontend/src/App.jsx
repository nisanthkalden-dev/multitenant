import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { SuperAdminProvider } from './context/SuperAdminContext';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Role-Based Company CRM Pages
import RoleBasedDashboardRouter from './pages/company/RoleBasedDashboardRouter';
import CustomersPage from './pages/company/CustomersPage';
import LeadsPage from './pages/company/LeadsPage';
import TasksPage from './pages/company/TasksPage';
import UsersPage from './pages/company/UsersPage';
import ReportsPage from './pages/company/ReportsPage';
import SubscriptionPage from './pages/company/SubscriptionPage';
import CompanySettingsPage from './pages/company/CompanySettingsPage';
import ActivitiesPage from './pages/company/ActivitiesPage';

// Super Admin Pages
import SuperAdminDashboard from './pages/SuperAdmin/Dashboard';
import CompaniesList from './pages/SuperAdmin/CompaniesList';
import AddCompany from './pages/SuperAdmin/AddCompany';
import CompanyDetails from './pages/SuperAdmin/CompanyDetails';
import SubscriptionsPage from './pages/SuperAdmin/Subscriptions';
import PlanManagementPage from './pages/SuperAdmin/PlanManagement';
import SuperAdminSettings from './pages/SuperAdmin/Settings';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SuperAdminProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Landing Page */}
              <Route path="/" element={<Home />} />

              {/* Authentication Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Backward compatibility redirects from /dashboard to /company/dashboard */}
              <Route path="/dashboard" element={<Navigate to="/company/dashboard" replace />} />
              <Route path="/customers" element={<Navigate to="/company/customers" replace />} />
              <Route path="/leads" element={<Navigate to="/company/leads" replace />} />
              <Route path="/pipeline" element={<Navigate to="/company/leads" replace />} />
              <Route path="/settings" element={<Navigate to="/company/settings" replace />} />

              {/* Company CRM Tenant RBAC Routes */}
              <Route
                path="/company/dashboard"
                element={
                  <ProtectedRoute>
                    <RoleBasedDashboardRouter />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/company/customers"
                element={
                  <ProtectedRoute>
                    <CustomersPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/company/leads"
                element={
                  <ProtectedRoute>
                    <LeadsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/company/tasks"
                element={
                  <ProtectedRoute>
                    <TasksPage />
                  </ProtectedRoute>
                }
              />

              {/* Users / Employees (Restricted to company_admin) */}
              <Route
                path="/company/users"
                element={
                  <ProtectedRoute requiredRole="company_admin">
                    <UsersPage />
                  </ProtectedRoute>
                }
              />

              {/* Team Members (For manager) */}
              <Route
                path="/company/team"
                element={
                  <ProtectedRoute requiredRole={['manager', 'company_admin']}>
                    <UsersPage />
                  </ProtectedRoute>
                }
              />

              {/* Reports (Restricted to company_admin and manager) */}
              <Route
                path="/company/reports"
                element={
                  <ProtectedRoute requiredRole={['company_admin', 'manager']}>
                    <ReportsPage />
                  </ProtectedRoute>
                }
              />

              {/* Subscription (Restricted strictly to company_admin) */}
              <Route
                path="/company/subscription"
                element={
                  <ProtectedRoute requiredRole="company_admin">
                    <SubscriptionPage />
                  </ProtectedRoute>
                }
              />

              {/* Settings / My Profile */}
              <Route
                path="/company/settings"
                element={
                  <ProtectedRoute>
                    <CompanySettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Employee Personal Activities Log */}
              <Route
                path="/company/activities"
                element={
                  <ProtectedRoute requiredRole="employee">
                    <ActivitiesPage />
                  </ProtectedRoute>
                }
              />

              {/* Super Admin Frontend Portal Routes */}
              <Route
                path="/super-admin"
                element={
                  <ProtectedRoute requiredRole="super_admin">
                    <SuperAdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/super-admin/companies"
                element={
                  <ProtectedRoute requiredRole="super_admin">
                    <CompaniesList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/super-admin/companies/add"
                element={
                  <ProtectedRoute requiredRole="super_admin">
                    <AddCompany />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/super-admin/companies/:id"
                element={
                  <ProtectedRoute requiredRole="super_admin">
                    <CompanyDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/super-admin/subscriptions"
                element={
                  <ProtectedRoute requiredRole="super_admin">
                    <SubscriptionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/super-admin/subscription-settings"
                element={
                  <ProtectedRoute requiredRole="super_admin">
                    <PlanManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/super-admin/settings"
                element={
                  <ProtectedRoute requiredRole="super_admin">
                    <SuperAdminSettings />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </SuperAdminProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
