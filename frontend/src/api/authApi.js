import { apiClient } from './apiClient';

export const authApi = {
  /**
   * Dedicated Super Admin Login (POST /api/super-admin/login)
   */
  superAdminLogin: async ({ email, password }) => {
    const res = await apiClient('/super-admin/login', {
      method: 'POST',
      body: { email, password }
    });
    return res && res.accessToken ? res : (res?.data || res);
  },

  /**
   * General Company User Login (POST /api/auth/login)
   */
  login: async ({ userId, password, loginType }) => {
    // If loginType is super_admin, call dedicated super admin endpoint
    if (loginType === 'super_admin') {
      const res = await apiClient('/super-admin/login', {
        method: 'POST',
        body: { email: userId, password }
      });
      return res && res.accessToken ? res : (res?.data || res);
    }

    const res = await apiClient('/auth/login', {
      method: 'POST',
      body: { userId, password, loginType }
    });
    return res?.data || res;
  },

  /**
   * Token refresh endpoint (POST /api/auth/refresh)
   */
  refresh: async (refreshToken) => {
    const res = await apiClient('/auth/refresh', {
      method: 'POST',
      body: { refreshToken }
    });
    return res && res.accessToken ? res : (res?.data || res);
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
