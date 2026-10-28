import { apiClient } from './apiClient';

export const activityApi = {
  getActivities: async ({ page = 0, size = 50 } = {}) => {
    const res = await apiClient(`/activities?page=${page}&size=${size}`);
    return res;
  },

  getRecentActivities: async () => {
    const res = await apiClient('/activities/recent');
    return res.data;
  },

  createActivity: async (activityData) => {
    const res = await apiClient('/activities', {
      method: 'POST',
      body: activityData
    });
    return res.data;
  }
};
