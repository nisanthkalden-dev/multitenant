import { apiClient } from './apiClient';

export const dashboardApi = {
  getSuperAdminDashboard: async (period = '6M') => {
    const res = await apiClient(`/super-admin/dashboard?period=${encodeURIComponent(period)}`);
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
