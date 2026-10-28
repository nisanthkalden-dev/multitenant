import { apiClient } from './apiClient';

export const dashboardApi = {
  getSuperAdminDashboard: async () => {
    const res = await apiClient('/super-admin/dashboard');
    return res.data;
  },

  getCompanyAdminDashboard: async () => {
    const res = await apiClient('/company/dashboard');
    return res.data;
  },

  getManagerDashboard: async () => {
    const res = await apiClient('/manager/dashboard');
    return res.data;
  },

  getEmployeeDashboard: async () => {
    const res = await apiClient('/employee/dashboard');
    return res.data;
  }
};
