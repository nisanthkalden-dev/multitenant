import { apiClient } from './apiClient';

export const contactApi = {
  getContacts: async ({ page = 0, size = 50, search = '' } = {}) => {
    const params = new URLSearchParams({ page, size });
    if (search) params.append('search', search);
    const res = await apiClient(`/contacts?${params.toString()}`);
    return res;
  },

  getContactById: async (id) => {
    const res = await apiClient(`/contacts/${id}`);
    return res.data;
  },

  createContact: async (contactData) => {
    const res = await apiClient('/contacts', {
      method: 'POST',
      body: contactData
    });
    return res.data;
  },

  updateContact: async (id, contactData) => {
    const res = await apiClient(`/contacts/${id}`, {
      method: 'PUT',
      body: contactData
    });
    return res.data;
  },

  deleteContact: async (id) => {
    const res = await apiClient(`/contacts/${id}`, {
      method: 'DELETE'
    });
    return res.data;
  }
};
