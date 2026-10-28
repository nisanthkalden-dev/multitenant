import { apiClient } from './apiClient';

export const companyApi = {
  // Super Admin operations
  getCompanies: async ({ page = 0, size = 50, search = '', status = 'All' } = {}) => {
    const params = new URLSearchParams({ page, size });
    if (search) params.append('search', search);
    if (status && status !== 'All') params.append('status', status);
    const res = await apiClient(`/super-admin/companies?${params.toString()}`);
    return res;
  },

  getCompanyById: async (id) => {
    const res = await apiClient(`/super-admin/companies/${id}`);
    return res.data;
  },

  createCompany: async (companyData) => {
    const res = await apiClient('/super-admin/companies', {
      method: 'POST',
      body: companyData
    });
    return res.data;
  },

  updateCompany: async (id, companyData) => {
    const res = await apiClient(`/super-admin/companies/${id}`, {
      method: 'PUT',
      body: companyData
    });
    return res.data;
  },

  deleteCompany: async (id) => {
    const res = await apiClient(`/super-admin/companies/${id}`, {
      method: 'DELETE'
    });
    return res.data;
  },

  // Company Settings
  getCompanySettings: async () => {
    const res = await apiClient('/company/settings');
    return res.data;
  },

  updateCompanySettings: async (settings) => {
    const res = await apiClient('/company/settings', {
      method: 'PUT',
      body: settings
    });
    return res.data;
  }
};
