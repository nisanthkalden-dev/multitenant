import { apiClient } from './apiClient';

export const subscriptionApi = {
  // Public / Company plans
  // Super Admin operations
  getAllSubscriptions: async ({ page = 0, size = 100 } = {}) => {
    const params = new URLSearchParams({ page, size });
    const res = await apiClient(`/super-admin/subscriptions?${params.toString()}`);
    return res;
  },

  getSubscriptionById: async (id) => {
    const res = await apiClient(`/super-admin/subscriptions/${id}`);
    return res.data;
  },

  updateSubscription: async (id, subscriptionData) => {
    const res = await apiClient(`/super-admin/subscriptions/${id}`, {
      method: 'PUT',
      body: subscriptionData
    });
    return res.data;
  },

  // Tenant Company operations
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
  },

  // Super Admin subscription operations
  getAllSubscriptions: async ({ page = 0, size = 50 } = {}) => {
    const res = await apiClient(`/super-admin/subscriptions?page=${page}&size=${size}`);
    return res;
  },

  getSubscriptionById: async (id) => {
    const res = await apiClient(`/super-admin/subscriptions/${id}`);
    return res.data;
  },

  updateSubscription: async (id, data) => {
    const res = await apiClient(`/super-admin/subscriptions/${id}`, {
      method: 'PUT',
      body: data
    });
    return res.data;
  }
};
