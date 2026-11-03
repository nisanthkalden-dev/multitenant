import { apiClient } from './apiClient';

export const userApi = {
  // Company-Admin dedicated employee management APIs
  getEmployees: async ({ page = 0, size = 10, search = '', role = '', department = '', status = '', managerId = '', sort = 'id,asc' } = {}) => {
    const params = new URLSearchParams({ page, size });
    if (search) params.append('search', search);
    if (role && role !== 'All') params.append('role', role);
    if (department && department !== 'All') params.append('department', department);
    if (status && status !== 'All') params.append('status', status);
    if (managerId && managerId !== 'All') params.append('managerId', managerId);
    if (sort) params.append('sort', sort);
    const res = await apiClient(`/company-admin/employees?${params.toString()}`);
    return res;
  },

  getEmployeeDetails: async (id) => {
    const res = await apiClient(`/company-admin/employees/${id}`);
    return res.data;
  },

  createEmployee: async (employeeData) => {
    const res = await apiClient('/company-admin/employees', {
      method: 'POST',
      body: employeeData
    });
    return res.data;
  },

  updateEmployee: async (id, employeeData) => {
    const res = await apiClient(`/company-admin/employees/${id}`, {
      method: 'PUT',
      body: employeeData
    });
    return res.data;
  },

  updateEmployeeStatus: async (id, status) => {
    const res = await apiClient(`/company-admin/employees/${id}/status`, {
      method: 'PATCH',
      body: { status }
    });
    return res.data;
  },

  // Legacy scoped endpoints for backward compatibility
  getCompanyUsers: async (companyId, { page = 0, size = 50, search = '', role = '' } = {}) => {
    const params = new URLSearchParams({ page, size });
    if (search) params.append('search', search);
    if (role && role !== 'All') params.append('role', role);
    const res = await apiClient(`/companies/${companyId}/users?${params.toString()}`);
    return res;
  },

  getCompanyUser: async (companyId, userId) => {
    const res = await apiClient(`/companies/${companyId}/users/${userId}`);
    return res.data;
  },

  createCompanyUser: async (companyId, userData) => {
    const res = await apiClient(`/companies/${companyId}/users`, {
      method: 'POST',
      body: userData
    });
    return res.data;
  },

  updateCompanyUser: async (companyId, userId, userData) => {
    const res = await apiClient(`/companies/${companyId}/users/${userId}`, {
      method: 'PUT',
      body: userData
    });
    return res.data;
  },

  deleteCompanyUser: async (companyId, userId) => {
    const res = await apiClient(`/companies/${companyId}/users/${userId}`, {
      method: 'DELETE'
    });
    return res.data;
  },

  // Current User profile updates
  getProfile: async () => {
    const res = await apiClient('/users/me');
    return res;
  },

  updateProfile: async (profileData) => {
    const res = await apiClient('/users/me', {
      method: 'PUT',
      body: profileData
    });
    return res.data;
  },

  removeAvatar: async () => {
    const res = await apiClient('/users/me/avatar', {
      method: 'DELETE'
    });
    return res.data;
  },

  changePassword: async (passwordData) => {
    const res = await apiClient('/users/me/password', {
      method: 'PUT',
      body: passwordData
    });
    return res.data;
  },

  changeSuperAdminPassword: async (passwordData) => {
    const res = await apiClient('/super-admin/settings/change-password', {
      method: 'PUT',
      body: passwordData
    });
    return res.data;
  }
};
