import { apiClient } from './apiClient';

export const leadApi = {
  getLeads: async ({ page = 0, size = 50, search = '', stage = 'All' } = {}) => {
    const params = new URLSearchParams({ page, size });
    if (search) params.append('search', search);
    if (stage && stage !== 'All') params.append('stage', stage);
    const res = await apiClient(`/leads?${params.toString()}`);
    return res;
  },

  getLeadById: async (id) => {
    const res = await apiClient(`/leads/${id}`);
    return res.data;
  },

  createLead: async (leadData) => {
    const res = await apiClient('/leads', {
      method: 'POST',
      body: leadData
    });
    return res.data;
  },

  updateLead: async (id, leadData) => {
    const res = await apiClient(`/leads/${id}`, {
      method: 'PUT',
      body: leadData
    });
    return res.data;
  },

  deleteLead: async (id) => {
    const res = await apiClient(`/leads/${id}`, {
      method: 'DELETE'
    });
    return res.data;
  }
};
