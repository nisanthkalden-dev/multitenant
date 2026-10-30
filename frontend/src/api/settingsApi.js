import { apiClient } from './apiClient';

export const settingsApi = {
  // Company workspace settings
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
  },

  // Current user profile settings
  getUserProfile: async () => {
    const res = await apiClient('/users/me');
    return res.data;
  },

  updateUserProfile: async (profileData) => {
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
