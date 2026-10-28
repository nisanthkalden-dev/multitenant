import { apiClient } from './apiClient';

export const customerApi = {
  getCustomers: async ({ page = 0, size = 50, search = '', tier = 'All' } = {}) => {
    const params = new URLSearchParams({ page, size });
    if (search) params.append('search', search);
    if (tier && tier !== 'All') params.append('tier', tier);
    const res = await apiClient(`/customers?${params.toString()}`);
    return res;
  },

  getCustomerById: async (id) => {
    const res = await apiClient(`/customers/${id}`);
    return res.data;
  },

  createCustomer: async (customerData) => {
    const res = await apiClient('/customers', {
      method: 'POST',
      body: customerData
    });
    return res.data;
  },

  updateCustomer: async (id, customerData) => {
    const res = await apiClient(`/customers/${id}`, {
      method: 'PUT',
      body: customerData
    });
    return res.data;
  },

  deleteCustomer: async (id) => {
    const res = await apiClient(`/customers/${id}`, {
      method: 'DELETE'
    });
    return res.data;
  }
};
