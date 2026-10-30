import { apiClient } from './apiClient';

export const platformSettingsApi = {
  getSettings: async () => {
    const res = await apiClient('/super-admin/settings');
    return res.data;
  },

  updateSettings: async (settingsData) => {
    const res = await apiClient('/super-admin/settings', {
      method: 'PUT',
      body: settingsData
    });
    return res.data;
  },

  removeLogo: async () => {
    const res = await apiClient('/super-admin/settings/logo', {
      method: 'DELETE'
    });
    return res.data;
  }
};
