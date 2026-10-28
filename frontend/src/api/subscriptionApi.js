import { apiClient } from './apiClient';

export const subscriptionApi = {
  getPlans: async () => {
    const res = await apiClient('/subscription/plans');
    return res.data;
  },

  getCurrentSubscription: async () => {
    const res = await apiClient('/subscription');
    return res.data;
  },

  upgradeSubscription: async (subscriptionData) => {
    const res = await apiClient('/subscription', {
      method: 'POST',
      body: subscriptionData
    });
    return res.data;
  },

  getHistory: async () => {
    const res = await apiClient('/subscription/history');
    return res.data;
  }
};
