import { apiClient } from './apiClient';

export const userApi = {
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
  updateProfile: async (profileData) => {
    const res = await apiClient('/users/me', {
      method: 'PUT',
      body: profileData
    });
    return res.data;
  },

  changePassword: async (passwordData) => {
    const res = await apiClient('/users/me/password', {
      method: 'PUT',
      body: passwordData
    });
    return res.data;
  }
};
