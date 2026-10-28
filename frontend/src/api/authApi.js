import { apiClient } from './apiClient';

export const authApi = {
  login: async ({ userId, password, loginType }) => {
    const res = await apiClient('/auth/login', {
      method: 'POST',
      body: { userId, password, loginType }
    });
    return res.data;
  },

  register: async (userData) => {
    const res = await apiClient('/auth/register', {
      method: 'POST',
      body: userData
    });
    return res.data;
  },

  getCurrentUser: async () => {
    const res = await apiClient('/auth/me');
    return res.data;
  },

  logout: async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch {
      // Stateless token cleanup
    }
  }
};
